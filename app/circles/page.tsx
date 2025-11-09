"use client"

import { useState } from "react"
import {
  Users,
  Plus,
  TrendingUp,
  Search,
  Filter,
  Globe,
  Lock,
  Target,
  Calendar,
  ArrowUpRight,
  MoreVertical,
  UserPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateCircleModal } from "@/components/modals/create-circle-modal"
import { ContributeCircleModal } from "@/components/modals/contribute-circle-modal"
import Link from "next/link"

export default function CirclesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [contributeModal, setContributeModal] = useState<{ open: boolean; circleName: string; suggested?: number }>({
    open: false,
    circleName: "",
  })
  const [searchQuery, setSearchQuery] = useState("")

  // Mock user's circles
  const myCircles = [
    {
      id: "c1",
      name: "Family Vacation Fund",
      description: "Saving together for December holiday in Dubai",
      balance: 420000,
      targetAmount: 1500000,
      memberCount: 5,
      role: "admin",
      isPublic: false,
      category: "Group Savings",
      deadline: new Date("2025-12-01"),
      recentActivity: [
        { member: "Tunde", amount: 50000, time: "2 hours ago" },
        { member: "You", amount: 100000, time: "1 day ago" },
      ],
    },
    {
      id: "c2",
      name: "Flatmates Rent Fund",
      description: "Monthly rent contribution for our 3-bedroom apartment",
      balance: 850000,
      targetAmount: 900000,
      memberCount: 3,
      role: "member",
      isPublic: false,
      category: "Rent Split",
      recurringAmount: 300000,
      recentActivity: [
        { member: "Kemi", amount: 300000, time: "3 days ago" },
        { member: "David", amount: 300000, time: "5 days ago" },
      ],
    },
    {
      id: "c3",
      name: "Wedding Ajo - Feb 2025",
      description: "Monthly savings group for Kemi's wedding",
      balance: 1250000,
      targetAmount: 2000000,
      memberCount: 8,
      role: "moderator",
      isPublic: false,
      category: "Ajo/Esusu",
      recurringAmount: 50000,
      recentActivity: [
        { member: "Grace", amount: 50000, time: "1 day ago" },
        { member: "Lawrence", amount: 50000, time: "2 days ago" },
      ],
    },
  ]

  // Mock public circles for discovery
  const publicCircles = [
    {
      id: "p1",
      name: "Clean Water Campaign - Enugu",
      description: "Help us build wells in rural communities",
      balance: 2850000,
      targetAmount: 5000000,
      memberCount: 124,
      category: "Charity/Fundraiser",
      organizer: "Water For Life NGO",
      isPublic: true,
    },
    {
      id: "p2",
      name: "Tech Conference 2025",
      description: "Group funding for conference tickets and travel",
      balance: 680000,
      targetAmount: 1200000,
      memberCount: 18,
      category: "Event Planning",
      organizer: "Lagos Tech Community",
      isPublic: true,
    },
    {
      id: "p3",
      name: "Community Library Project",
      description: "Building a free library for Ikeja community",
      balance: 1450000,
      targetAmount: 3000000,
      memberCount: 89,
      category: "Charity/Fundraiser",
      organizer: "Ikeja Readers Club",
      isPublic: true,
    },
  ]

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
      <CreateCircleModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <ContributeCircleModal
        open={contributeModal.open}
        onOpenChange={(open) => setContributeModal({ ...contributeModal, open })}
        circleName={contributeModal.circleName}
        suggestedAmount={contributeModal.suggested}
      />
    </div>
  )
}
