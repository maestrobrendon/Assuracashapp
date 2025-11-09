import { Users, Plus, ArrowUpRight, ArrowDownRight, Settings, UserPlus, TrendingUp, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function CirclesPage() {
  // Mock circles data
  const circles = [
    {
      id: 1,
      name: "Team Fund",
      members: 5,
      balance: 234.5,
      monthlyGoal: 500,
      description: "Shared budget for team expenses and projects",
      recentActivity: [
        { type: "contribution", member: "Alice", amount: 50, date: "2 hours ago" },
        { type: "expense", member: "Bob", amount: 25, date: "5 hours ago" },
      ],
    },
    {
      id: 2,
      name: "Project Alpha",
      members: 3,
      balance: 89.2,
      monthlyGoal: 200,
      description: "Development fund for new project",
      recentActivity: [{ type: "contribution", member: "Charlie", amount: 30, date: "1 day ago" }],
    },
    {
      id: 3,
      name: "Savings Pool",
      members: 8,
      balance: 512.75,
      monthlyGoal: 1000,
      description: "Group savings for future investments",
      recentActivity: [
        { type: "contribution", member: "Diana", amount: 100, date: "3 days ago" },
        { type: "contribution", member: "Eve", amount: 75, date: "4 days ago" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">My Circles</h2>
            <p className="mt-1 text-muted-foreground">Manage shared finances with groups</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Circle
          </Button>
        </div>

        {/* Circle Cards */}
        <div className="space-y-6">
          {circles.map((circle) => (
            <Card key={circle.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{circle.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{circle.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {circle.members} members
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Shield className="mr-1 h-3 w-3" />
                          Private
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href={`/circles/${circle.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Balance and Goal */}
                  <div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">{circle.balance.toFixed(2)}</span>
                        <span className="text-lg text-muted-foreground">ZEC</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Current balance</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Monthly goal</span>
                        <span className="font-medium text-foreground">
                          {circle.balance.toFixed(0)} / {circle.monthlyGoal} ZEC
                        </span>
                      </div>
                      <Progress value={(circle.balance / circle.monthlyGoal) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {((circle.balance / circle.monthlyGoal) * 100).toFixed(0)}% of monthly goal reached
                      </p>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Button className="flex-1">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Contribute
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <ArrowDownRight className="mr-2 h-4 w-4" />
                        Request
                      </Button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h4 className="mb-4 font-semibold text-foreground">Recent Activity</h4>
                    <div className="space-y-3">
                      {circle.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg border border-border p-3">
                          <div
                            className={`rounded-full p-2 ${
                              activity.type === "contribution" ? "bg-success/10" : "bg-accent/10"
                            }`}
                          >
                            {activity.type === "contribution" ? (
                              <ArrowDownRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-accent" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {activity.member} {activity.type === "contribution" ? "contributed" : "withdrew"}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.date}</p>
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              activity.type === "contribution" ? "text-success" : "text-foreground"
                            }`}
                          >
                            {activity.type === "contribution" ? "+" : "-"}
                            {activity.amount.toFixed(2)} ZEC
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pooled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {circles.reduce((sum, c) => sum + c.balance, 0).toFixed(2)}
                </span>
                <span className="text-muted-foreground">ZEC</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5% this month</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Circles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{circles.length}</span>
                <span className="text-muted-foreground">circles</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {circles.reduce((sum, c) => sum + c.members, 0)} total members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {(
                    (circles.reduce((sum, c) => sum + c.balance, 0) /
                      circles.reduce((sum, c) => sum + c.monthlyGoal, 0)) *
                    100
                  ).toFixed(0)}
                  %
                </span>
                <span className="text-muted-foreground">achieved</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Across all circles</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Circle CTA */}
        <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-balance">Start a New Circle</h3>
                <p className="text-sm text-muted-foreground">Pool funds with friends, family, or colleagues</p>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Circle
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
