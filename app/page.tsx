"use client"

import { useState } from "react"
import {
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Zap,
  Send,
  Download,
  Target,
  PiggyBank,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SendMoneyModal } from "@/components/modals/send-money-modal"
import { TopUpModal } from "@/components/modals/top-up-modal"
import { WithdrawModal } from "@/components/modals/withdraw-modal"
import { BudgetWalletModal } from "@/components/modals/budget-wallet-modal"
import { GoalWalletModal } from "@/components/modals/goal-wallet-modal"
import { WalletCard } from "@/components/wallet-card"
import { mockWallets, mockCircles } from "@/lib/mock-data"

export default function HomePage() {
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [topUpModalOpen, setTopUpModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [walletType, setWalletType] = useState<"budget" | "goal">("budget")
  const [activeWalletTab, setActiveWalletTab] = useState<"budget" | "goals" | "circles">("budget")

  const totalBalance = 125450.45
  const recentTransactions = [
    { id: 1, type: "received", amount: 15500, from: "zs1...3x8k", date: "2 hours ago", shielded: true },
    { id: 2, type: "sent", amount: 5250, to: "zs1...9k2p", date: "5 hours ago", shielded: true },
    { id: 3, type: "received", amount: 50000, from: "Circle: Team Fund", date: "1 day ago", shielded: false },
    { id: 4, type: "sent", amount: 12750, to: "t1...4m9n", date: "2 days ago", shielded: false },
  ]

  const circles = [
    { id: 1, name: "Team Fund", members: 5, balance: 234500 },
    { id: 2, name: "Project Alpha", members: 3, balance: 89200 },
  ]

  const budgetWallets = mockWallets.filter((w) => w.type === "budget")
  const goalWallets = mockWallets.filter((w) => w.type === "goal")

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Balance Overview */}
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Dashboard</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    ₦{totalBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8.2% this month</span>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => setSendModalOpen(true)}
                    className="flex h-auto flex-col items-center gap-2 rounded-2xl py-4"
                  >
                    <div className="rounded-full bg-white/20 p-3">
                      <Send className="h-5 w-5" />
                    </div>
                    <span className="text-xs">Send To</span>
                  </Button>

                  <Button
                    onClick={() => setTopUpModalOpen(true)}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-2xl bg-transparent py-4"
                  >
                    <div className="rounded-full bg-primary/10 p-3">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs">Top Up</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setWalletType("budget")
                      setBudgetModalOpen(true)
                    }}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-2xl bg-transparent py-4"
                  >
                    <div className="rounded-full bg-primary/10 p-3">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs">Budget</span>
                  </Button>

                  <Button
                    onClick={() => setWithdrawModalOpen(true)}
                    variant="outline"
                    className="flex h-auto flex-col items-center gap-2 rounded-2xl bg-transparent py-4"
                  >
                    <div className="rounded-full bg-primary/10 p-3">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xs">Withdraw</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Budget Wallets</span>
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ₦{(totalBalance * 0.4).toLocaleString("en-NG", { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Goal Wallets</span>
                    <PiggyBank className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ₦{(totalBalance * 0.3).toLocaleString("en-NG", { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Wallets</CardTitle>
                <Link href="/wallets">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {/* Toggle buttons */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={activeWalletTab === "budget" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveWalletTab("budget")}
                  className="rounded-full px-6 transition-all"
                >
                  Budget
                </Button>
                <Button
                  variant={activeWalletTab === "goals" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveWalletTab("goals")}
                  className="rounded-full px-6 transition-all"
                >
                  Goals
                </Button>
                <Button
                  variant={activeWalletTab === "circles" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveWalletTab("circles")}
                  className="rounded-full px-6 transition-all"
                >
                  Circles
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Budget Wallets */}
              {activeWalletTab === "budget" && (
                <div className="space-y-4">
                  {budgetWallets.length > 0 ? (
                    budgetWallets.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        onClick={() => console.log("[v0] Wallet clicked:", wallet.id)}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <Target className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No budget wallets yet</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => {
                          setWalletType("budget")
                          setBudgetModalOpen(true)
                        }}
                      >
                        Create Budget Wallet
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Goal Wallets */}
              {activeWalletTab === "goals" && (
                <div className="space-y-4">
                  {goalWallets.length > 0 ? (
                    goalWallets.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        onClick={() => console.log("[v0] Wallet clicked:", wallet.id)}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <PiggyBank className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No goal wallets yet</p>
                      <Button
                        variant="outline"
                        className="mt-4 bg-transparent"
                        onClick={() => {
                          setWalletType("goal")
                          setGoalModalOpen(true)
                        }}
                      >
                        Create Goal Wallet
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Circles */}
              {activeWalletTab === "circles" && (
                <div className="space-y-4">
                  {mockCircles.map((circle) => (
                    <Card
                      key={circle.id}
                      className="group cursor-pointer overflow-hidden border-border/50 bg-card shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
                      onClick={() => console.log("[v0] Circle clicked:", circle.id)}
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{circle.name}</h3>
                            <p className="text-sm text-muted-foreground">{circle.description}</p>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            <Users className="mr-1 h-3 w-3" />
                            {circle.memberCount}
                          </Badge>
                        </div>

                        <p className="mb-4 text-3xl font-bold text-foreground">
                          ₦{circle.balance.toLocaleString("en-NG")}
                        </p>

                        {circle.targetAmount && (
                          <>
                            <div className="mb-3">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-500"
                                  style={{ width: `${Math.min((circle.balance / circle.targetAmount) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>₦{circle.balance.toLocaleString("en-NG")}</span>
                              <span>₦{circle.targetAmount.toLocaleString("en-NG")}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" className="w-full rounded-xl bg-transparent shadow-sm">
                    <Users className="mr-2 h-4 w-4" />
                    Create New Circle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Transactions */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/wallets">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${tx.type === "received" ? "bg-success/10" : "bg-accent/10"}`}>
                        {tx.type === "received" ? (
                          <ArrowDownRight
                            className={`h-4 w-4 ${tx.type === "received" ? "text-success" : "text-accent"}`}
                          />
                        ) : (
                          <ArrowUpRight
                            className={`h-4 w-4 ${tx.type === "received" ? "text-success" : "text-accent"}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.type === "received" ? "Received" : "Sent"}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {tx.type === "received" ? `from ${tx.from}` : `to ${tx.to}`}
                          </p>
                          {tx.shielded && (
                            <Badge variant="secondary" className="h-5 text-xs">
                              <Shield className="mr-1 h-3 w-3" />
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.type === "received" ? "text-success" : "text-foreground"}`}>
                        {tx.type === "received" ? "+" : "-"}₦{tx.amount.toLocaleString("en-NG")}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Circles */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Circles</CardTitle>
              <Link href="/circles">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {circles.map((circle) => (
                  <div
                    key={circle.id}
                    className="flex items-center justify-between rounded-xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{circle.name}</p>
                        <p className="text-sm text-muted-foreground">{circle.members} members</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₦{circle.balance.toLocaleString("en-NG")}</p>
                      <Link href={`/circles/${circle.id}`}>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full rounded-xl bg-transparent shadow-sm">
                  <Users className="mr-2 h-4 w-4" />
                  Create New Circle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Features Banner */}
        <Card className="mt-6 border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground text-balance">Assurance for Your Money</h3>
                <p className="text-sm text-muted-foreground">
                  Lock your money in dedicated wallets to protect from impulse spending
                </p>
              </div>
            </div>
            <Button className="rounded-xl">Learn More</Button>
          </CardContent>
        </Card>
      </main>

      <SendMoneyModal open={sendModalOpen} onOpenChange={setSendModalOpen} currentBalance={totalBalance} />
      <TopUpModal open={topUpModalOpen} onOpenChange={setTopUpModalOpen} />
      <WithdrawModal open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} currentBalance={totalBalance} />
      <BudgetWalletModal open={budgetModalOpen} onOpenChange={setBudgetModalOpen} />
      <GoalWalletModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
    </div>
  )
}
