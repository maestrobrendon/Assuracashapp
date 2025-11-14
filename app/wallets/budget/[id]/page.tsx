'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useMainWallet } from '@/lib/hooks/use-main-wallet'
import { ArrowLeft, ArrowRight, ArrowLeftRight, Lock, Unlock, Calendar, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function BudgetWalletDetailPage() {
  const router = useRouter()
  const params = useParams()
  const walletId = params.id as string

  const { balance: mainWalletBalance, refetch: refetchMainWallet } = useMainWallet()

  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
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
        supabase.from('budget_wallets').select('*').eq('id', walletId).eq('user_id', user.id).single(),
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

  const isLocked = wallet?.is_locked && wallet?.lock_until && new Date(wallet.lock_until) > new Date()

  const handleMoveToMain = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (Number.parseFloat(amount) > wallet.balance) {
      alert('Insufficient balance in budget wallet')
      return
    }

    setIsProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const moveAmount = Number.parseFloat(amount)

      const { error: budgetError } = await supabase
        .from('budget_wallets')
        .update({ balance: wallet.balance - moveAmount })
        .eq('id', walletId)

      if (budgetError) throw budgetError

      const { error: mainError } = await supabase
        .from('main_wallets')
        .update({ balance: mainWalletBalance + moveAmount })
        .eq('user_id', user.id)

      if (mainError) throw mainError

      await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: walletId,
        amount: moveAmount,
        type: 'withdrawal',
        description: `Moved to main wallet`,
        status: 'completed'
      })

      setAmount('')
      setMoveModalOpen(false)
      loadWalletData()
      refetchMainWallet()
    } catch (error) {
      console.error('[v0] Error moving money:', error)
      alert('Failed to move money')
    } finally {
      setIsProcessing(false)
    }
  }

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

      const { error: budgetError } = await supabase
        .from('budget_wallets')
        .update({ balance: wallet.balance + addAmount })
        .eq('id', walletId)

      if (budgetError) throw budgetError

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
        description: `Added from main wallet`,
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
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Wallet not found</p>
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
                <p className="text-sm text-muted-foreground mt-1">Budget Wallet</p>
              </div>
              {isLocked ? (
                <Badge variant="secondary" className="text-sm">
                  <Lock className="mr-1 h-4 w-4" />
                  Locked until {new Date(wallet.lock_until).toLocaleDateString()}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm">
                  <Unlock className="mr-1 h-4 w-4" />
                  Unlocked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
              <p className="text-4xl font-bold text-foreground">{formatNaira(wallet.balance)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Spend Limit</p>
                <p className="text-lg font-semibold">{wallet.spend_limit ? formatNaira(wallet.spend_limit) : 'None'}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Frequency</p>
                <p className="text-lg font-semibold capitalize">{wallet.disbursement_frequency || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!isLocked && (
                <Button 
                  onClick={() => setMoveModalOpen(true)}
                  className="w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Move to Main
                </Button>
              )}
              <Button 
                onClick={() => setAddModalOpen(true)}
                variant="outline"
                className={isLocked ? 'col-span-2' : ''}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add from Main
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
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

        <Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move to Main Wallet</DialogTitle>
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
                  Available: {formatNaira(wallet.balance)}
                </p>
              </div>
              <Button 
                onClick={handleMoveToMain} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Move Money'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add from Main Wallet</DialogTitle>
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
              </div>
              <Button 
                onClick={handleAddFromMain} 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Add Money'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
