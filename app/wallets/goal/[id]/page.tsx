'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useMainWallet } from '@/lib/hooks/use-main-wallet'
import { ArrowLeft, Target, Calendar, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function GoalWalletDetailPage() {
  const router = useRouter()
  const params = useParams()
  const walletId = params.id as string

  const { balance: mainWalletBalance, refetch: refetchMainWallet } = useMainWallet()

  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const loadWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const [walletResult, txResult] = await Promise.all([
        supabase.from('goal_wallets').select('*').eq('id', walletId).eq('user_id', user.id).single(),
        supabase.from('transactions').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false }).limit(20)
      ])

      if (walletResult.data) setWallet(walletResult.data)
      if (txResult.data) setTransactions(txResult.data)

    } catch (error) {
      console.error('[v0] Error loading wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (walletId) loadWalletData()
  }, [walletId])

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  }

  const progress = wallet ? (wallet.balance / wallet.target_amount) * 100 : 0

  const handleAddFromMain = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (Number.parseFloat(amount) > mainWalletBalance) {
      alert('Insufficient balance in main wallet')
      return
    }

    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const addAmount = Number.parseFloat(amount)

      const { error: goalError } = await supabase
        .from('goal_wallets')
        .update({ balance: wallet.balance + addAmount })
        .eq('id', walletId)

      if (goalError) throw goalError

      const { error: mainError } = await supabase
        .from('main_wallets')
        .update({ balance: mainWalletBalance - addAmount })
        .eq('user_id', user.id)

      if (mainError) throw mainError

      await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: walletId,
        amount: addAmount,
        type: 'deposit',
        description: `Added to goal: ${wallet.name}`,
        status: 'completed'
      })

      setAmount('')
      setAddModalOpen(false)
      loadWalletData()
      refetchMainWallet()
    } catch (error) {
      console.error('[v0] Error adding money:', error)
      alert('Failed to add money')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading goal...</p>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Goal not found</p>
          <Button onClick={() => router.push('/wallets')}>Back to Wallets</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/wallets')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wallets
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{wallet.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Goal Wallet</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Current Progress</p>
              <p className="text-4xl font-bold text-foreground mb-1">{formatNaira(wallet.balance)}</p>
              <p className="text-sm text-muted-foreground">of {formatNaira(wallet.target_amount)} goal</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-lg font-bold text-primary">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {wallet.target_date && (
              <div className="rounded-lg border border-border p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Target Date</p>
                    <p className="font-semibold">{new Date(wallet.target_date).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={() => setAddModalOpen(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add to Goal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No contributions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start contributing to reach your goal!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${tx.type === 'deposit' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                        {tx.type === 'deposit' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString('en-NG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.type === 'deposit' ? 'text-success' : 'text-destructive'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatNaira(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Main wallet balance: {formatNaira(mainWalletBalance)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Remaining to goal: {formatNaira(Math.max(0, wallet.target_amount - wallet.balance))}
                </p>
              </div>
              <Button 
                onClick={handleAddFromMain} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Add to Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
