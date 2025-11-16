"use client"

import { useState, useEffect } from "react"
import { Users, Plus, TrendingUp, Search, Filter, Globe, Lock, Target, Calendar, ArrowUpRight, MoreVertical, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateCircleModal } from "@/components/modals/create-circle-modal"
import { ContributeCircleModal } from "@/components/modals/contribute-circle-modal"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAccountMode } from "@/lib/hooks/use-account-mode"

export default function CirclesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [contributeModal, setContributeModal] = useState<{ open: boolean; circleName: string; suggested?: number }>({
    open: false,
    circleName: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [myCircles, setMyCircles] = useState<any[]>([])
  const [publicCircles, setPublicCircles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { accountMode, isLoading: accountModeLoading } = useAccountMode()

  useEffect(() => {
    if (!accountModeLoading && accountMode) {
      loadCircles()
    }
    
    const circlesChannel = supabase
      .channel('circles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circles' }, () => {
        loadCircles()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members' }, () => {
        loadCircles()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_transactions' }, () => {
        loadCircles()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(circlesChannel)
    }
  }, [accountMode, accountModeLoading])

  const loadCircles = async () => {
    setIsLoading(true)
    console.log("[v0] Loading circles...")
    
    if (accountModeLoading || !accountMode) {
      setIsLoading(false)
      return
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error("[v0] Not authenticated")
        setIsLoading(false)
        return
      }

      console.log("[v0] Authenticated user:", user.id)

      const { data: userCirclesData, error: userCirclesError } = await supabase
        .from('circle_members')
        .select(`
          role,
          total_contributed,
          circles (*)
        `)
        .eq('user_id', user.id)
        .eq('mode', accountMode)

      console.log("[v0] User circles data:", userCirclesData)
      console.log("[v0] User circles error:", userCirclesError)

      if (userCirclesError) {
        console.error("[v0] Error fetching user circles:", userCirclesError)
      } else if (userCirclesData) {
        const formattedCircles = await Promise.all(userCirclesData.map(async (item: any) => {
          // Fetch actual members count for this circle
          const { data: membersData } = await supabase
            .from('circle_members')
            .select('id')
            .eq('circle_id', item.circles.id)
            .eq('mode', accountMode)

          return {
            ...item.circles,
            role: item.role,
            userContribution: item.total_contributed || 0,
            memberCount: membersData?.length || 0, // Use actual fetched count
            balance: item.circles.current_balance || 0,
            targetAmount: item.circles.target_amount || 0,
            isPublic: item.circles.visibility === "public",
            deadline: item.circles.target_date ? new Date(item.circles.target_date) : null,
            recentActivity: [],
          }
        }))
        console.log("[v0] Formatted my circles:", formattedCircles)
        setMyCircles(formattedCircles)
      }

      const { data: publicCirclesData, error: publicCirclesError } = await supabase
        .from('circles')
        .select('*')
        .eq('visibility', 'public')
        .eq('mode', accountMode)
        .order('created_at', { ascending: false })
        .limit(20)

      console.log("[v0] Public circles data:", publicCirclesData)
      console.log("[v0] Public circles error:", publicCirclesError)

      if (publicCirclesError) {
        console.error("[v0] Error fetching public circles:", publicCirclesError)
      } else if (publicCirclesData) {
        const formattedPublic = publicCirclesData.map((circle: any) => ({
          ...circle,
          memberCount: circle.member_count || 0,
          balance: circle.current_balance || 0,
          targetAmount: circle.target_amount || 0,
          isPublic: true,
          organizer: "Admin",
        }))
        setPublicCircles(formattedPublic)
      }
    } catch (error) {
      console.error("[v0] Unexpected error loading circles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open)
    if (!open) {
      loadCircles()
    }
  }

  // Calculate accurate real-time stats from actual circle data
  const totalPooled = myCircles.reduce((sum, circle) => sum + (circle.balance || 0), 0)
  const totalUserContributed = myCircles.reduce((sum, circle) => sum + (circle.userContribution || 0), 0)
  const adminCircles = myCircles.filter((c) => c.role === "admin").length
  const avgProgress = myCircles.length > 0
    ? myCircles.reduce((sum, c) => sum + ((c.balance || 0) / (c.targetAmount || 1)) * 100, 0) / myCircles.length
    : 0

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Responsive header with proper spacing for mobile */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Circles</h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">Pool funds with groups toward shared goals</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Create Circle
          </Button>
        </div>

        {/* Updated stats with accurate real-time data */}
        <div className="mb-6 grid gap-3 sm:mb-8 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">Total Pooled</p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-2xl">
                    ₦{totalPooled.toLocaleString('en-NG', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="ml-2 rounded-full bg-primary/10 p-2 sm:p-3">
                  <TrendingUp className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">My Circles</p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-2xl">{myCircles.length}</p>
                </div>
                <div className="ml-2 rounded-full bg-accent/10 p-2 sm:p-3">
                  <Users className="h-4 w-4 text-accent sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">As Admin</p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-2xl">{adminCircles}</p>
                </div>
                <div className="ml-2 rounded-full bg-success/10 p-2 sm:p-3">
                  <Target className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground sm:text-sm">Goals Progress</p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-2xl">{avgProgress.toFixed(0)}%</p>
                </div>
                <div className="ml-2 rounded-full bg-info/10 p-2 sm:p-3">
                  <Calendar className="h-4 w-4 text-info sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responsive tabs for mobile */}
        <Tabs defaultValue="my-circles" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-circles" className="text-xs sm:text-sm">My Circles</TabsTrigger>
            <TabsTrigger value="explore" className="text-xs sm:text-sm">Explore Public</TabsTrigger>
          </TabsList>

          {/* My Circles Tab */}
          <TabsContent value="my-circles" className="space-y-4 sm:space-y-6">
            {myCircles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Circles Yet</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4 max-w-sm">
                    Create your first Circle to start pooling funds with friends, family, or colleagues
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Circle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myCircles.map((circle) => (
                <Card key={circle.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Responsive card header */}
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        <div className="rounded-full bg-primary/10 p-3 sm:p-4 flex-shrink-0">
                          <Users className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-base sm:text-xl mb-1">{circle.name}</CardTitle>
                          <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm mb-2">{circle.description}</p>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              {circle.memberCount}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {circle.isPublic ? (
                                <>
                                  <Globe className="mr-1 h-3 w-3" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-1 h-3 w-3" />
                                  Private
                                </>
                              )}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize bg-background">
                              {circle.role}
                            </Badge>
                            <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                              {circle.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/circles/${circle.id}`} className="flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                          <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  {/* Responsive card content and stacked on mobile */}
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                      {/* Balance & Progress */}
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground sm:text-sm mb-1">Current Balance</p>
                          <p className="text-2xl font-bold text-foreground sm:text-3xl">₦{circle.balance.toLocaleString()}</p>
                        </div>

                        {circle.targetAmount && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">Target Goal</span>
                              <span className="font-medium">
                                ₦{circle.balance.toLocaleString()} / ₦{circle.targetAmount.toLocaleString()}
                              </span>
                            </div>
                            <Progress value={(circle.balance / circle.targetAmount) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {((circle.balance / circle.targetAmount) * 100).toFixed(1)}% of goal reached
                            </p>
                          </div>
                        )}

                        {circle.deadline && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground sm:h-4 sm:w-4" />
                            <span className="text-muted-foreground">
                              Deadline: {circle.deadline.toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Buttons stack on mobile */}
                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() =>
                              setContributeModal({
                                open: true,
                                circleName: circle.name,
                                suggested: circle.recurringAmount,
                              })
                            }
                          >
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Contribute
                          </Button>
                          <Link href={`/circles/${circle.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Recent Activity - hidden on small mobile */}
                      <div className="hidden sm:block">
                        <h4 className="mb-3 text-sm font-semibold text-foreground sm:text-base">Recent Activity</h4>
                        <div className="space-y-2">
                          {circle.recentActivity.length > 0 ? (
                            circle.recentActivity.map((activity, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2 sm:p-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium text-foreground sm:text-sm">{activity.member} contributed</p>
                                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                                <p className="ml-2 flex-shrink-0 text-xs font-semibold text-success sm:text-sm">+₦{activity.amount.toLocaleString()}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground sm:text-sm">No recent activity</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-4 sm:space-y-6">
            {/* Responsive search and filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search public circles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Responsive grid for all screen sizes */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {publicCircles.map((circle) => (
                <Card key={circle.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="mr-1 h-3 w-3" />
                        Public
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {circle.category}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-base leading-tight sm:text-lg">{circle.name}</CardTitle>
                    <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm mt-1">{circle.description}</p>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            ₦{circle.balance.toLocaleString()} / ₦{circle.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(circle.balance / circle.targetAmount) * 100} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{circle.memberCount} members</span>
                        </div>
                        <span className="text-xs text-muted-foreground">by {circle.organizer}</span>
                      </div>

                      <Button className="w-full bg-transparent" size="sm" variant="outline">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Circle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <CreateCircleModal open={createModalOpen} onOpenChange={handleCreateModalClose} />
      <ContributeCircleModal
        open={contributeModal.open}
        onOpenChange={(open) => setContributeModal({ ...contributeModal, open })}
        circleName={contributeModal.circleName}
        suggestedAmount={contributeModal.suggested}
      />
    </div>
  )
}
