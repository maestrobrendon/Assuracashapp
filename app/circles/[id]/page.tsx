"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Download,
  Lock,
  Globe,
  Shield,
  Crown,
  MoreVertical,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ContributeCircleModal } from "@/components/modals/contribute-circle-modal"
import { WithdrawCircleModal } from "@/components/modals/withdraw-circle-modal"
import { InviteMembersModal } from "@/components/modals/invite-members-modal"
import Link from "next/link"

export default function CircleDetailPage() {
  const params = useParams()
  const [contributeModal, setContributeModal] = useState(false)
  const [withdrawModal, setWithdrawModal] = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [newPost, setNewPost] = useState("")

  // Mock circle data
  const circle = {
    id: params.id,
    name: "Family Vacation Fund",
    description: "Saving together for December holiday in Dubai",
    balance: 420000,
    targetAmount: 1500000,
    memberCount: 5,
    role: "admin",
    isPublic: false,
    category: "Group Savings",
    deadline: new Date("2025-12-01"),
    createdAt: new Date("2024-06-15"),
    privacySettings: {
      showMemberNames: true,
      showIndividualContributions: true,
    },
    allowExternalContributions: false,
    inviteLink: "https://assuracash.app/invite/abc123xyz",
  }

  const members = [
    { id: "1", name: "You", username: "@adebayo", role: "admin", totalContributed: 120000, joinedAt: "Jun 2024" },
    {
      id: "2",
      name: "Tunde Ogunleye",
      username: "@tundeo",
      role: "admin",
      totalContributed: 100000,
      joinedAt: "Jun 2024",
    },
    {
      id: "3",
      name: "Grace Idowu",
      username: "@gracei",
      role: "moderator",
      totalContributed: 80000,
      joinedAt: "Jul 2024",
    },
    {
      id: "4",
      name: "Kemi Johnson",
      username: "@kemij",
      role: "member",
      totalContributed: 70000,
      joinedAt: "Aug 2024",
    },
    { id: "5", name: "David Eze", username: "@davide", role: "member", totalContributed: 50000, joinedAt: "Sep 2024" },
  ]

  const transactions = [
    {
      id: "t1",
      type: "contribution",
      from: "Tunde Ogunleye",
      amount: 50000,
      timestamp: new Date("2025-01-15"),
      note: "Monthly contribution",
    },
    {
      id: "t2",
      type: "contribution",
      from: "You",
      amount: 40000,
      timestamp: new Date("2025-01-14"),
    },
    {
      id: "t3",
      type: "contribution",
      from: "Grace Idowu",
      amount: 30000,
      timestamp: new Date("2025-01-13"),
    },
    {
      id: "t4",
      type: "withdrawal",
      from: "Admin",
      to: "Flight Booking",
      amount: 150000,
      timestamp: new Date("2025-01-10"),
      note: "Booked Emirates flights for all 5 members",
      receipt: true,
    },
    {
      id: "t5",
      type: "contribution",
      from: "Kemi Johnson",
      amount: 35000,
      timestamp: new Date("2025-01-09"),
    },
  ]

  const posts = [
    {
      id: "p1",
      author: "Tunde Ogunleye",
      role: "admin",
      content: "Great news everyone! We just hit 30% of our target. Keep up the contributions!",
      timestamp: new Date("2025-01-14"),
      reactions: [
        { emoji: "🎉", count: 4 },
        { emoji: "❤️", count: 3 },
      ],
    },
    {
      id: "p2",
      author: "Grace Idowu",
      role: "moderator",
      content: "I found some great hotel deals in Dubai. Sharing the link in our WhatsApp group!",
      timestamp: new Date("2025-01-12"),
      reactions: [{ emoji: "👍", count: 5 }],
    },
  ]

  const handlePostUpdate = () => {
    console.log("[v0] Posting update:", newPost)
    setNewPost("")
  }

  const isAdminOrMod = circle.role === "admin" || circle.role === "moderator"

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/circles">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Circles
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{circle.name}</h1>
                <p className="mt-1 text-muted-foreground">{circle.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    <Users className="mr-1 h-3 w-3" />
                    {circle.memberCount} members
                  </Badge>
                  <Badge variant="outline">
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
                  <Badge variant="outline" className="capitalize">
                    <Shield className="mr-1 h-3 w-3" />
                    {circle.role}
                  </Badge>
                  <Badge variant="secondary">{circle.category}</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isAdminOrMod && (
                <Button variant="outline" onClick={() => setInviteModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              )}
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {circle.role === "admin" && (
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <CardContent className="pt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                <p className="text-4xl font-bold text-foreground mb-1">₦{circle.balance.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Created {circle.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Target Goal</span>
                    <span className="font-medium">{((circle.balance / circle.targetAmount) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(circle.balance / circle.targetAmount) * 100} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    ₦{(circle.targetAmount - circle.balance).toLocaleString()} to go
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Deadline:{" "}
                    {circle.deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="lg" onClick={() => setContributeModal(true)}>
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Contribute Funds
                </Button>
                {circle.role === "admin" && (
                  <Button size="lg" variant="outline" onClick={() => setWithdrawModal(true)}>
                    <ArrowDownRight className="mr-2 h-5 w-5" />
                    Withdraw Funds
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="feed">Feed</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Contributed</span>
                    <span className="text-lg font-semibold">₦{circle.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Contribution</span>
                    <span className="text-lg font-semibold">
                      ₦{(circle.balance / circle.memberCount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Days Until Deadline</span>
                    <span className="text-lg font-semibold">
                      {Math.ceil((circle.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contribution Rate</span>
                    <span className="text-lg font-semibold text-success">+12.5%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members
                      .sort((a, b) => b.totalContributed - a.totalContributed)
                      .slice(0, 5)
                      .map((member, idx) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {idx + 1}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.username}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">₦{member.totalContributed.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {((member.totalContributed / circle.balance) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                      <div
                        className={`rounded-full p-2 ${tx.type === "contribution" ? "bg-success/10" : "bg-accent/10"}`}
                      >
                        {tx.type === "contribution" ? (
                          <ArrowUpRight className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {tx.type === "contribution" ? `${tx.from} contributed` : `Withdrawal: ${tx.to}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.timestamp.toLocaleDateString()} • {tx.note}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-semibold ${tx.type === "contribution" ? "text-success" : "text-foreground"}`}
                      >
                        {tx.type === "contribution" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div
                        className={`rounded-full p-3 ${tx.type === "contribution" ? "bg-success/10" : "bg-accent/10"}`}
                      >
                        {tx.type === "contribution" ? (
                          <ArrowUpRight className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {tx.type === "contribution" ? `${tx.from} contributed` : `Withdrawal: ${tx.to}`}
                          </p>
                          {tx.receipt && (
                            <Badge variant="outline" className="text-xs">
                              Receipt attached
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx.timestamp.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {tx.note && <p className="text-xs text-muted-foreground mt-1">{tx.note}</p>}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${tx.type === "contribution" ? "text-success" : "text-foreground"}`}
                        >
                          {tx.type === "contribution" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Circle Members ({members.length})</CardTitle>
                {isAdminOrMod && (
                  <Button onClick={() => setInviteModal(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Members
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 rounded-lg border border-border p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.role === "admin" && <Crown className="h-4 w-4 text-amber-500" />}
                          {member.role === "moderator" && <Shield className="h-4 w-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {member.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Joined {member.joinedAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">₦{member.totalContributed.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total contributed</p>
                      </div>
                      {isAdminOrMod && member.id !== "1" && (
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            {/* Post Update */}
            {isAdminOrMod && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Share an update with Circle members..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handlePostUpdate} disabled={!newPost}>
                        Post Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{post.author}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {post.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-3">{post.content}</p>
                        <div className="flex items-center gap-4">
                          {post.reactions.map((reaction) => (
                            <Button key={reaction.emoji} variant="ghost" size="sm" className="h-8 gap-1">
                              <span>{reaction.emoji}</span>
                              <span className="text-xs">{reaction.count}</span>
                            </Button>
                          ))}
                          <Button variant="ghost" size="sm" className="h-8">
                            <MessageSquare className="mr-1 h-4 w-4" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ContributeCircleModal open={contributeModal} onOpenChange={setContributeModal} circleName={circle.name} />
      <WithdrawCircleModal open={withdrawModal} onOpenChange={setWithdrawModal} circleBalance={circle.balance} />
      <InviteMembersModal
        open={inviteModal}
        onOpenChange={setInviteModal}
        circleName={circle.name}
        inviteLink={circle.inviteLink}
      />
    </div>
  )
}
