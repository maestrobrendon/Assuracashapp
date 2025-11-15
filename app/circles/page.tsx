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
  const accountMode = useAccountMode()

  useEffect(() => {
    loadCircles()
    
    const circlesChannel = supabase
      .channel('circles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circles' }, () => {
        console.log('[v0] Circles updated, reloading...')
        loadCircles()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'circle_members' }, () => {
        console.log('[v0] Circle members updated, reloading...')
        loadCircles()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(circlesChannel)
    }
  }, [])

  const loadCircles = async () => {
    setIsLoading(true)
    console.log("[v0] Loading circles...")
    
    if (!accountMode) {
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
        const formattedCircles = userCirclesData.map((item: any) => ({
          ...item.circles,
          role: item.role,
          userContribution: item.total_contributed || 0,
          memberCount: item.circles.member_count || 0,
          balance: item.circles.current_balance || 0,
          targetAmount: item.circles.target_amount || 0,
          isPublic: item.circles.visibility === "public",
          deadline: item.circles.target_date ? new Date(item.circles.target_date) : null,
          recentActivity: [],
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

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Circles</h2>
            <p className="mt-1 text-muted-foreground">Pool funds with groups toward shared goals</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Circle
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pooled</p>
                  <p className="text-2xl font-bold text-foreground">₦2.52M</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Circles</p>
                  <p className="text-2xl font-bold text-foreground">{myCircles.length}</p>
                </div>
                <div className="rounded-full bg-accent/10 p-3">
                  <Users className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">As Admin</p>
                  <p className="text-2xl font-bold text-foreground">
                    {myCircles.filter((c) => c.role === "admin").length}
                  </p>
                </div>
                <div className="rounded-full bg-success/10 p-3">
                  <Target className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Goals Progress</p>
                  <p className="text-2xl font-bold text-foreground">58%</p>
                </div>
                <div className="rounded-full bg-info/10 p-3">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="my-circles" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-circles">My Circles</TabsTrigger>
            <TabsTrigger value="explore">Explore Public</TabsTrigger>
          </TabsList>

          {/* My Circles Tab */}
          <TabsContent value="my-circles" className="space-y-6">
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
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-4">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{circle.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mb-2">{circle.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              {circle.memberCount} members
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
                            <Badge variant="secondary" className="text-xs">
                              {circle.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/circles/${circle.id}`}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Balance & Progress */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                          <p className="text-3xl font-bold text-foreground">₦{circle.balance.toLocaleString()}</p>
                        </div>

                        {circle.targetAmount && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
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
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Deadline: {circle.deadline.toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1"
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
                            <Button variant="outline" className="w-full bg-transparent">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="mb-3 font-semibold text-foreground">Recent Activity</h4>
                        <div className="space-y-2">
                          {circle.recentActivity.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{activity.member} contributed</p>
                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                              </div>
                              <p className="text-sm font-semibold text-success">+₦{activity.amount.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Explore Tab */}
          <TabsContent value="explore" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search public circles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publicCircles.map((circle) => (
                <Card key={circle.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="mr-1 h-3 w-3" />
                        Public
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {circle.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{circle.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{circle.description}</p>
                  </CardHeader>

                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            ₦{circle.balance.toLocaleString()} / ₦{circle.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(circle.balance / circle.targetAmount) * 100} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{circle.memberCount} members</span>
                        </div>
                        <span className="text-xs text-muted-foreground">by {circle.organizer}</span>
                      </div>

                      <Button className="w-full bg-transparent" variant="outline">
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
