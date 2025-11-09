"use client"

import { useState } from "react"
import { Plus, ArrowLeftRight, Wallet, Lock, TrendingUp, History, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockWallets, mockTransactions, formatNaira, getDaysUntilUnlock } from "@/lib/mock-data"
import { BudgetWalletModal } from "@/components/modals/budget-wallet-modal"
import { GoalWalletModal } from "@/components/modals/goal-wallet-modal"
import { MoveMoneyModal } from "@/components/modals/move-money-modal"
import { AddFundsModal } from "@/components/modals/add-funds-modal"

export default function WalletsPage() {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [moveMoneyModalOpen, setMoveMoneyModalOpen] = useState(false)
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const mainWallet = mockWallets.find((w) => w.type === "main")
  const budgetWallets = mockWallets.filter((w) => w.type === "budget")
  const goalWallets = mockWallets.filter((w) => w.type === "goal")

  const getWalletTransactions = (walletId: string) => {
    return mockTransactions
      .filter((tx) => tx.walletId === walletId || tx.toWallet === walletId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 3)
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-foreground">My Wallets</h2>
          <p className="text-sm text-muted-foreground">Manage your main balance and budget/goal wallets</p>
        </div>

        {/* Main Wallet Balance Card */}
        <Card className="mb-6 border-primary/20 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-4xl font-bold text-foreground">{formatNaira(mainWallet?.balance || 0)}</p>
              <p className="text-sm text-muted-foreground">Main Wallet</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setAddFundsModalOpen(true)}
                className="flex items-center justify-center gap-2 h-14 rounded-full"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add Funds</span>
              </Button>
              <Button
                onClick={() => setMoveMoneyModalOpen(true)}
                variant="outline"
                className="flex items-center justify-center gap-2 h-14 rounded-full bg-transparent"
              >
                <ArrowLeftRight className="h-5 w-5" />
                <span className="font-medium">Move Money</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Budget Wallets Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Your Budget Wallets</h3>
            <Button onClick={() => setBudgetModalOpen(true)} size="sm" variant="outline" className="bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>

          {budgetWallets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-sm font-medium text-foreground">You haven't created any budgets yet.</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Create a budget wallet to manage recurring expenses
                </p>
                <Button onClick={() => setBudgetModalOpen(true)} size="sm">
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgetWallets.map((wallet) => {
                const transactions = getWalletTransactions(wallet.id)
                return (
                  <Card key={wallet.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold">{wallet.name}</CardTitle>
                          {wallet.lockStatus === "locked" && wallet.lockUntil && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked • {getDaysUntilUnlock(wallet.lockUntil)}d left
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Balance */}
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatNaira(wallet.balance)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{wallet.contributionSchedule} budget</p>
                      </div>

                      {/* Recent Transactions */}
                      {transactions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                          <div className="space-y-1.5">
                            {transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between text-xs">
                                <span className="truncate text-muted-foreground">{tx.description}</span>
                                <span className={tx.type === "credit" ? "text-success font-medium" : "font-medium"}>
                                  {tx.type === "credit" ? "+" : "-"}
                                  {formatNaira(tx.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setSelectedWallet(wallet.id)}
                      >
                        <History className="mr-2 h-3.5 w-3.5" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Goal Wallets Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Your Goal Wallets</h3>
            <Button onClick={() => setGoalModalOpen(true)} size="sm" variant="outline" className="bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>

          {goalWallets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-sm font-medium text-foreground">You haven't created any goals yet.</p>
                <p className="mb-4 text-xs text-muted-foreground">Create a goal wallet to save for specific targets</p>
                <Button onClick={() => setGoalModalOpen(true)} size="sm">
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {goalWallets.map((wallet) => {
                const progress = wallet.targetAmount ? (wallet.balance / wallet.targetAmount) * 100 : 0
                const transactions = getWalletTransactions(wallet.id)
                return (
                  <Card key={wallet.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold">{wallet.name}</CardTitle>
                          {wallet.lockStatus === "locked" && wallet.lockUntil && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked • {getDaysUntilUnlock(wallet.lockUntil)}d left
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Balance and Target */}
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatNaira(wallet.balance)}</p>
                        <p className="text-xs text-muted-foreground">of {formatNaira(wallet.targetAmount || 0)} goal</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Recent Transactions */}
                      {transactions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                          <div className="space-y-1.5">
                            {transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between text-xs">
                                <span className="truncate text-muted-foreground">{tx.description}</span>
                                <span className={tx.type === "credit" ? "text-success font-medium" : "font-medium"}>
                                  {tx.type === "credit" ? "+" : "-"}
                                  {formatNaira(tx.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => setSelectedWallet(wallet.id)}
                      >
                        <History className="mr-3.5 w-3.5" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <BudgetWalletModal open={budgetModalOpen} onOpenChange={setBudgetModalOpen} />
        <GoalWalletModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
        <MoveMoneyModal open={moveMoneyModalOpen} onOpenChange={setMoveMoneyModalOpen} />
        <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
      </main>
    </div>
  )
}
