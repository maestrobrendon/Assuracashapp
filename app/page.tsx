"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase"
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, Shield, Zap, Send, Download, Target, PiggyBank, ArrowDownLeft, UserPlus, X, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { SendMoneyModal } from "@/components/modals/send-money-modal"
import { RequestMoneyModal } from "@/components/request-money-modal"
import { TopUpModal } from "@/components/modals/top-up-modal"
import { WithdrawModal } from "@/components/modals/withdraw-modal"
import { BudgetWalletModal } from "@/components/modals/budget-wallet-modal"
import { GoalWalletModal } from "@/components/modals/goal-wallet-modal"
import { WalletCard } from "@/components/wallet-card"
import { mockCircles, mockFavoriteContacts, mockPendingRequests } from "@/lib/mock-data"
import { getBudgetWallets, getGoalWallets } from "@/lib/actions/wallets"
import { useMainWallet } from "@/lib/hooks/use-main-wallet"

export default function HomePage() {
  const router = useRouter()
  const { balance: mainWalletBalance, refetch: refetchMainWallet } = useMainWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [topUpModalOpen, setTopUpModalOpen] = useState(false)
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [walletType, setWalletType] = useState<"budget" | "goal">("budget")
  const [activeWalletTab, setActiveWalletTab] = useState<"budget" | "goals" | "circles">("budget")
  const [dismissedRequests, setDismissedRequests] = useState<string[]>([])
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(false)
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [balancesHidden, setBalancesHidden] = useState(false)
  const [budgetWallets, setBudgetWallets] = useState<any[]>([])
  const [goalWallets, setGoalWallets] = useState<any[]>([])
  const [isLoadingWallets, setIsLoadingWallets] = useState(true)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [quickStats, setQuickStats] = useState({
    budgetTotal: 0,
    goalTotal: 0,
    circlesTotal: 0,
    transactionCount: 0,
  })

  const circles = [
    { id: 1, name: "Team Fund", members: 5, balance: 234500 },
    { id: 2, name: "Project Alpha", members: 3, balance: 89200 },
  ]

  const activePendingRequests = mockPendingRequests.filter((req) => !dismissedRequests.includes(req.id))

  const formatBalance = (amount: number) => {
    if (balancesHidden) {
      return "₦••••••"
    }
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
  }

  const formatBalanceShort = (amount: number) => {
    if (balancesHidden) {
      return "₦••••••"
    }
    return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`
  }

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `Expires in ${hours}h`
    const days = Math.ceil(hours / 24)
    return `Expires in ${days} day${days > 1 ? "s" : ""}`
  }

  const handlePrevRequest = () => {
    setCurrentRequestIndex((prev) => (prev > 0 ? prev - 1 : activePendingRequests.length - 1))
  }

  const handleNextRequest = () => {
    setCurrentRequestIndex((prev) => (prev < activePendingRequests.length - 1 ? prev + 1 : 0))
  }

  const handleDismissRequest = (requestId: string) => {
    setDismissedRequests([...dismissedRequests, requestId])
    if (currentRequestIndex >= activePendingRequests.length - 1) {
      setCurrentRequestIndex(Math.max(0, activePendingRequests.length - 2))
    }
  }

  const handleBudgetModalClose = (open: boolean) => {
    setBudgetModalOpen(open)
    if (!open) {
      loadWallets()
      refetchMainWallet()
      loadTransactions()
      calculateQuickStats()
    }
  }

  const handleGoalModalClose = (open: boolean) => {
    setGoalModalOpen(open)
    if (!open) {
      loadWallets()
      refetchMainWallet()
      loadTransactions()
      calculateQuickStats()
    }
  }

  const handleTopUpModalClose = (open: boolean) => {
    setTopUpModalOpen(open)
    if (!open) {
      refetchMainWallet()
      loadTransactions()
      calculateQuickStats()
    }
  }

  const loadWallets = async () => {
    setIsLoadingWallets(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const [budgetResult, goalResult] = await Promise.all([
        supabase.from('budget_wallets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('goal_wallets').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      if (budgetResult.data) {
        console.log('[v0] Budget wallets loaded:', budgetResult.data.length)
        setBudgetWallets(budgetResult.data.map((w: any) => ({
          id: w.id,
          name: w.name,
          type: 'budget',
          balance: w.balance,
          spent: 0,
          limit: w.spend_limit || w.balance,
          color: 'from-blue-500 to-cyan-500',
        })))
      }

      if (goalResult.data) {
        console.log('[v0] Goal wallets loaded:', goalResult.data.length)
        setGoalWallets(goalResult.data.map((w: any) => ({
          id: w.id,
          name: w.name,
          type: 'goal',
          balance: w.balance,
          target: w.target_amount,
          deadline: w.target_date,
          color: 'from-purple-500 to-pink-500',
        })))
      }

      calculateQuickStats()
    } catch (error) {
      console.error('[v0] Error loading wallets:', error)
    } finally {
      setIsLoadingWallets(false)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        const formattedTransactions = data.map((tx: any) => ({
          id: tx.id,
          type: tx.sender_id === user.id ? "sent" : "received",
          amount: tx.amount,
          from: tx.sender_id === user.id ? null : tx.description,
          to: tx.receiver_id === user.id ? null : tx.description,
          date: formatDate(tx.created_at),
          shielded: tx.type === 'shielded',
          description: tx.description,
        }))
        
        setRecentTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error('[v0] Error loading transactions:', error)
    }
  }

  const calculateQuickStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [budgetResult, goalResult, txResult] = await Promise.all([
        supabase.from('budget_wallets').select('balance').eq('user_id', user.id),
        supabase.from('goal_wallets').select('balance').eq('user_id', user.id),
        supabase.from('transactions').select('id').eq('sender_id', user.id),
      ])

      const budgetTotal = budgetResult.data?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0
      const goalTotal = goalResult.data?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0
      const circlesTotal = circles.reduce((sum, c) => sum + c.balance, 0)
      const transactionCount = txResult.data?.length || 0

      setQuickStats({
        budgetTotal,
        goalTotal,
        circlesTotal,
        transactionCount,
      })
    } catch (error) {
      console.error('[v0] Error calculating stats:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    return date.toLocaleDateString()
  }

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push("/auth/login")
    } else {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      loadWallets()
      loadTransactions()
    }
  }, [isLoading])

  useEffect(() => {
    if (isLoading) return

    const budgetChannel = supabase
      .channel('budget-wallet-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_wallets' }, () => {
        console.log('[v0] Budget wallet changed, reloading...')
        loadWallets()
        calculateQuickStats()
      })
      .subscribe()

    const goalChannel = supabase
      .channel('goal-wallet-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goal_wallets' }, () => {
        console.log('[v0] Goal wallet changed, reloading...')
        loadWallets()
        calculateQuickStats()
      })
      .subscribe()

    const txChannel = supabase
      .channel('transaction-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        console.log('[v0] Transaction changed, reloading...')
        loadTransactions()
        calculateQuickStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(budgetChannel)
      supabase.removeChannel(goalChannel)
      supabase.removeChannel(txChannel)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Balance Overview */}
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Dashboard</h2>
          <div className="grid gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setBalancesHidden(!balancesHidden)}
                    className="h-8 w-8 rounded-full hover:bg-muted"
                    aria-label={balancesHidden ? "Show balances" : "Hide balances"}
                  >
                    {balancesHidden ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">{formatBalance(mainWalletBalance)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+8.2% this month</span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setSendModalOpen(true)}
                    size="lg"
                    className="h-14 rounded-2xl text-base font-semibold"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send
                  </Button>

                  <Button
                    onClick={() => setRequestModalOpen(true)}
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl bg-card text-base font-semibold"
                  >
                    <ArrowDownLeft className="mr-2 h-5 w-5" />
                    Request
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3">
                  <Button
                    onClick={() => setSendModalOpen(true)}
                    variant="ghost"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl py-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Transfer</span>
                  </Button>

                  <Button
                    onClick={() => setTopUpModalOpen(true)}
                    variant="ghost"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl py-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <Download className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Top Up</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setWalletType("budget")
                      setBudgetModalOpen(true)
                    }}
                    variant="ghost"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl py-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Budget</span>
                  </Button>

                  <Button
                    onClick={() => setWithdrawModalOpen(true)}
                    variant="ghost"
                    className="flex h-auto flex-col items-center gap-2 rounded-xl py-3"
                  >
                    <div className="rounded-full bg-primary/10 p-2.5">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs text-muted-foreground">Withdraw</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <button
                  onClick={() => setIsQuickStatsOpen(!isQuickStatsOpen)}
                  className="flex w-full items-center justify-between md:cursor-default"
                >
                  <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
                  {/* Show chevron only on mobile */}
                  <div className="md:hidden">
                    {isQuickStatsOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CardHeader>
              <CardContent className={`${isQuickStatsOpen ? "block" : "hidden md:block"}`}>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Budget Wallets</span>
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatBalanceShort(quickStats.budgetTotal)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Goal Wallets</span>
                      <PiggyBank className="h-4 w-4 text-accent" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatBalanceShort(quickStats.goalTotal)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Circles</span>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatBalanceShort(quickStats.circlesTotal)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-success">+8.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {activePendingRequests.length > 0 && (
          <div className="mb-6 relative">
            {/* Count badge in top right */}
            <div className="absolute -top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-lg">
              {activePendingRequests.length}
            </div>

            {/* Slider container */}
            <div className="relative overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentRequestIndex * 100}%)` }}
              >
                {activePendingRequests.map((request) => (
                  <div key={request.id} className="w-full flex-shrink-0">
                    <Card className="relative overflow-hidden shadow-sm border-l-4 border-l-primary">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 rounded-full z-10"
                        onClick={() => handleDismissRequest(request.id)}
                      >
                        
                      </Button>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-lg">
                              {request.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{request.from}</p>
                              <p className="text-sm text-muted-foreground">
                                Requested ₦{request.amount.toLocaleString("en-NG")}
                              </p>
                              <p className="text-xs text-muted-foreground">{request.reason}</p>
                              <div className="mt-1 flex items-center gap-1 text-xs text-warning">
                                <Clock className="h-3 w-3" />
                                {getTimeUntilExpiry(request.expiresAt)}
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => setSendModalOpen(true)} className="rounded-xl">
                            Send Money
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Navigation buttons - show only if more than 1 request */}
              {activePendingRequests.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
                    onClick={handlePrevRequest}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
                    onClick={handleNextRequest}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Dot indicators */}
            {activePendingRequests.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {activePendingRequests.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentRequestIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentRequestIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to request ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <Card className="mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Your favorite people</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <button className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted">
                  <UserPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Add</span>
              </button>

              {mockFavoriteContacts.map((contact) => (
                <button
                  key={contact.id}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  onClick={() => {
                    setSendModalOpen(true)
                  }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-bold text-white text-sm transition-transform group-hover:scale-110">
                    {contact.initials}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-foreground max-w-[60px] truncate">
                      {contact.name.split(" ")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">{contact.initials}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                        onClick={() => router.push(`/wallets/budget/${wallet.id}`)}
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
                        onClick={() => router.push(`/wallets/goal/${wallet.id}`)}
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
                  {circles.map((circle) => (
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

                        <p className="mb-4 text-3xl font-bold text-foreground">{formatBalanceShort(circle.balance)}</p>

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
                              <span>{formatBalanceShort(circle.balance)}</span>
                              <span>{formatBalanceShort(circle.targetAmount)}</span>
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
                            className={`h-4 w-4 ${tx.type === "received" ? "text-success" : "text-foreground"}`}
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
                        {balancesHidden
                          ? "₦••••"
                          : `${tx.type === "received" ? "+" : "-"}₦${tx.amount.toLocaleString("en-NG")}`}
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
                      <p className="font-semibold text-foreground">{formatBalanceShort(circle.balance)}</p>
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

      <SendMoneyModal open={sendModalOpen} onOpenChange={setSendModalOpen} currentBalance={mainWalletBalance} />
      <RequestMoneyModal open={requestModalOpen} onOpenChange={setRequestModalOpen} />
      <TopUpModal open={topUpModalOpen} onOpenChange={handleTopUpModalClose} />
      <WithdrawModal open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen} currentBalance={mainWalletBalance} />
      <BudgetWalletModal open={budgetModalOpen} onOpenChange={handleBudgetModalClose} />
      <GoalWalletModal open={goalModalOpen} onOpenChange={handleGoalModalClose} />
    </div>
  )
}
