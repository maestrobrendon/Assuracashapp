"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, ArrowUpRight, ArrowDownRight, Wallet, Users, Target, PiggyBank, Download, Send, TrendingUp, Calendar, Search, Filter, ChevronLeft } from 'lucide-react'
import { Activity as ActivityType } from "@/lib/types/activity"
import { getUserActivities, getActivityStats } from "@/lib/actions/activities"
import { useAccountMode } from "@/lib/hooks/use-account-mode"
import Link from "next/link"

const activityTypeLabels: Record<string, string> = {
  transfer: "Transfer",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  contribution: "Contribution",
  wallet_created: "Wallet Created",
  wallet_funded: "Wallet Funded",
  wallet_withdrawal: "Wallet Withdrawal",
  circle_created: "Circle Created",
  circle_joined: "Circle Joined",
  circle_contribution: "Circle Contribution",
  circle_withdrawal: "Circle Withdrawal",
  budget_created: "Budget Created",
  budget_funded: "Budget Funded",
  budget_disbursement: "Budget Disbursement",
  goal_created: "Goal Created",
  goal_contribution: "Goal Contribution",
  goal_completed: "Goal Completed",
  send: "Sent Money",
  receive: "Received Money",
  top_up: "Top Up",
  request_sent: "Request Sent",
  request_received: "Request Received",
}

const activityTypeIcons: Record<string, any> = {
  transfer: Send,
  deposit: ArrowDownRight,
  withdrawal: ArrowUpRight,
  contribution: Users,
  wallet_created: Wallet,
  wallet_funded: Download,
  wallet_withdrawal: ArrowUpRight,
  circle_created: Users,
  circle_joined: Users,
  circle_contribution: Users,
  circle_withdrawal: ArrowUpRight,
  budget_created: Target,
  budget_funded: Target,
  budget_disbursement: Target,
  goal_created: PiggyBank,
  goal_contribution: PiggyBank,
  goal_completed: PiggyBank,
  send: Send,
  receive: ArrowDownRight,
  top_up: Download,
  request_sent: Send,
  request_received: ArrowDownRight,
}

const activityTypeColors: Record<string, string> = {
  deposit: "text-success bg-success/10",
  receive: "text-success bg-success/10",
  top_up: "text-success bg-success/10",
  contribution: "text-success bg-success/10",
  wallet_funded: "text-success bg-success/10",
  budget_funded: "text-success bg-success/10",
  goal_contribution: "text-success bg-success/10",
  circle_contribution: "text-success bg-success/10",
  withdrawal: "text-destructive bg-destructive/10",
  send: "text-destructive bg-destructive/10",
  transfer: "text-destructive bg-destructive/10",
  wallet_withdrawal: "text-destructive bg-destructive/10",
  circle_withdrawal: "text-destructive bg-destructive/10",
  budget_disbursement: "text-destructive bg-destructive/10",
}

export default function ActivityPage() {
  const router = useRouter()
  const { accountMode, isLoading: isModeLoading } = useAccountMode()
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisMonth: 0,
    totalSent: 0,
    totalReceived: 0,
  })

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  useEffect(() => {
    if (!isModeLoading && accountMode) {
      loadActivities()
      loadStats()
    }
  }, [isModeLoading, accountMode])

  useEffect(() => {
    filterActivities()
  }, [activities, searchQuery, selectedFilter, dateFilter])

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push("/auth/login")
      return
    }
    setIsLoading(false)
  }

  const loadActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !accountMode) return

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('mode', accountMode)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setActivities(data as ActivityType[])
      }
    } catch (error) {
      console.error('[v0] Error loading activities:', error)
    }
  }

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !accountMode) return

      const statsData = await getActivityStats(user.id, accountMode)
      setStats(statsData)
    } catch (error) {
      console.error('[v0] Error loading stats:', error)
    }
  }

  const filterActivities = () => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((activity) =>
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activityTypeLabels[activity.activity_type || 'transfer']?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((activity) => activity.activity_type === selectedFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      let filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter((activity) =>
        new Date(activity.created_at) >= filterDate
      )
    }

    setFilteredActivities(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const groupActivitiesByDate = (activities: ActivityType[]) => {
    const groups: Record<string, ActivityType[]> = {}
    
    activities.forEach((activity) => {
      const date = new Date(activity.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let groupKey: string
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday'
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Week'
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = 'This Month'
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(activity)
    })

    return groups
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  if (isLoading || isModeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground">Track all your transactions and activities</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.thisMonth}</div>
              <p className="text-xs text-success mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₦{stats.totalSent.toLocaleString('en-NG', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₦{stats.totalReceived.toLocaleString('en-NG', { minimumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="send">Sent Money</SelectItem>
                  <SelectItem value="receive">Received Money</SelectItem>
                  <SelectItem value="top_up">Top Up</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="contribution">Contributions</SelectItem>
                  <SelectItem value="wallet_created">Wallets Created</SelectItem>
                  <SelectItem value="circle_joined">Circles Joined</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>All Activities</CardTitle>
            <CardDescription>
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedActivities).length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No activities found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                  <div key={dateGroup}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{dateGroup}</h3>
                    <div className="space-y-2">
                      {groupActivities.map((activity) => {
                        const Icon = activityTypeIcons[activity.activity_type || 'transfer'] || Activity
                        const colorClass = activityTypeColors[activity.activity_type || 'transfer'] || 'text-foreground bg-muted'
                        const isIncome = ['deposit', 'receive', 'top_up', 'contribution', 'wallet_funded', 'budget_funded', 'goal_contribution', 'circle_contribution'].includes(activity.activity_type || '')

                        return (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`rounded-full p-2.5 ${colorClass}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">
                                  {activityTypeLabels[activity.activity_type || 'transfer']}
                                </p>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(activity.created_at)}
                                  </p>
                                  {activity.reference_number && (
                                    <>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <p className="text-xs text-muted-foreground font-mono">
                                        {activity.reference_number}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${isIncome ? 'text-success' : 'text-foreground'}`}>
                                {isIncome ? '+' : '-'}₦{Number(activity.amount).toLocaleString('en-NG', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="mt-1">
                                {activity.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
