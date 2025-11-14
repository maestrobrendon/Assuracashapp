"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, ArrowLeftRight, Wallet, Lock, TrendingUp, History, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BudgetWalletModal } from '@/components/modals/budget-wallet-modal'
import { GoalWalletModal } from '@/components/modals/goal-wallet-modal'
import { MoveMoneyModal } from '@/components/modals/move-money-modal'
import { AddFundsModal } from '@/components/modals/add-funds-modal'
import { useMainWallet } from '@/lib/hooks/use-main-wallet'

export default function WalletsPage() {
  const router = useRouter()
  const { balance: mainWalletBalance, refetch: refetchMainWallet } = useMainWallet()
  
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [moveMoneyModalOpen, setMoveMoneyModalOpen] = useState(false)
  const [addFundsModalOpen, setAddFundsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [budgetWallets, setBudgetWallets] = useState<any[]>([])
  const [goalWallets, setGoalWallets] = useState<any[]>([])
  const [budgetPage, setBudgetPage] = useState(1)
  const [showAllBudgets, setShowAllBudgets] = useState(false)
  const WALLETS_PER_PAGE = 6

  const loadWallets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const [budgetResult, goalResult] = await Promise.all([
        supabase.from('budget_wallets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('goal_wallets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      if (budgetResult.data) setBudgetWallets(budgetResult.data)
      if (goalResult.data) setGoalWallets(goalResult.data)

    } catch (error) {
      console.error('[v0] Error loading wallets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWallets()
  }, [])

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  const getDaysUntilUnlock = (lockUntil: string | null) => {
    if (!lockUntil) return 0
    const now = new Date()
    const unlock = new Date(lockUntil)
    const diff = unlock.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallets...</p>
        </div>
      </div>
    )
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
              <p className="text-4xl font-bold text-foreground">{formatNaira(mainWalletBalance)}</p>
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
            <div className="flex items-center gap-2">
              {budgetWallets.length > 6 && !showAllBudgets && (
                <Button 
                  onClick={() => setShowAllBudgets(true)} 
                  size="sm" 
                  variant="ghost"
                >
                  View All ({budgetWallets.length})
                </Button>
              )}
              <Button onClick={() => setBudgetModalOpen(true)} size="sm" variant="outline" className="bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </div>
          </div>

          {budgetWallets.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="mb-2 text-sm font-medium text-foreground">You haven't created any budgets yet.</p>
                <p className="mb-4 text-xs text-muted-foreground">Create a budget wallet to manage recurring expenses</p>
                <Button onClick={() => setBudgetModalOpen(true)} size="sm">
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgetWallets.slice((budgetPage - 1) * WALLETS_PER_PAGE, budgetPage * WALLETS_PER_PAGE).map((wallet) => {
                  const isLocked = wallet.is_locked && wallet.lock_until && new Date(wallet.lock_until) > new Date()
                  const daysLeft = getDaysUntilUnlock(wallet.lock_until)
                  
                  return (
                    <Card 
                      key={wallet.id} 
                      className="group hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/wallets/budget/${wallet.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold">{wallet.name}</CardTitle>
                            {isLocked && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <Lock className="mr-1 h-3 w-3" />
                                Locked • {daysLeft}d left
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{formatNaira(wallet.balance)}</p>
                          <p className="text-xs text-muted-foreground capitalize">{wallet.disbursement_frequency || 'Budget'} wallet</p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/wallets/budget/${wallet.id}`)
                          }}
                        >
                          <History className="mr-2 h-3.5 w-3.5" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {showAllBudgets && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBudgetPage(p => Math.max(1, p - 1))}
                    disabled={budgetPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(budgetWallets.length / WALLETS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={budgetPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBudgetPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBudgetPage(p => Math.min(Math.ceil(budgetWallets.length / WALLETS_PER_PAGE), p + 1))}
                    disabled={budgetPage === Math.ceil(budgetWallets.length / WALLETS_PER_PAGE)}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {showAllBudgets && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowAllBudgets(false)
                      setBudgetPage(1)
                    }}
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </>
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
                const progress = wallet.target_amount ? (wallet.balance / wallet.target_amount) * 100 : 0
                const isLocked = wallet.is_locked && wallet.lock_until && new Date(wallet.lock_until) > new Date()
                const daysLeft = getDaysUntilUnlock(wallet.lock_until)
                
                return (
                  <Card 
                    key={wallet.id} 
                    className="group hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/wallets/goal/${wallet.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold">{wallet.name}</CardTitle>
                          {isLocked && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Lock className="mr-1 h-3 w-3" />
                              Locked • {daysLeft}d left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{formatNaira(wallet.balance)}</p>
                        <p className="text-xs text-muted-foreground">of {formatNaira(wallet.target_amount || 0)} goal</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/wallets/goal/${wallet.id}`)
                        }}
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

        {/* Modals */}
        <BudgetWalletModal open={budgetModalOpen} onOpenChange={(open) => {
          setBudgetModalOpen(open)
          if (!open) {
            loadWallets()
            refetchMainWallet() // Refetch main wallet balance after modal closes
          }
        }} />
        <GoalWalletModal open={goalModalOpen} onOpenChange={(open) => {
          setGoalModalOpen(open)
          if (!open) {
            loadWallets()
            refetchMainWallet() // Refetch main wallet balance after modal closes
          }
        }} />
        <MoveMoneyModal open={moveMoneyModalOpen} onOpenChange={setMoveMoneyModalOpen} />
        <AddFundsModal open={addFundsModalOpen} onOpenChange={setAddFundsModalOpen} />
      </main>
    </div>
  )
}
