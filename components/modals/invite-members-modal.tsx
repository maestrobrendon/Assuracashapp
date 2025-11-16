"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, LinkIcon, Mail, MessageSquare, Check, Search, UserPlus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface InviteMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleName: string
  inviteLink: string
  circleId?: string
}

export function InviteMembersModal({ open, onOpenChange, circleName, inviteLink, circleId }: InviteMembersModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    console.log("[v0] Sharing via:", platform)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const supabase = createClient()
      
      // Search profiles by phone, email, or zcash_id
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, phone_number, zcash_id, avatar_url')
        .or(`phone_number.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,zcash_id.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        .limit(10)

      if (error) {
        console.error("[v0] Error searching users:", error)
        return
      }

      console.log("[v0] Search results:", data)
      setSearchResults(data || [])
    } catch (error) {
      console.error("[v0] Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInviteUser = async (userId: string) => {
    if (!circleId) return
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      
      // Get current account mode
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_mode')
        .eq('user_id', user.id)
        .single()
      
      const accountMode = profile?.account_mode || 'demo'

      // Add user to circle
      const { error } = await supabase
        .from('circle_members')
        .insert({
          circle_id: circleId,
          user_id: userId,
          role: 'member',
          mode: accountMode,
          total_contributed: 0
        })

      if (error) {
        console.error("[v0] Error inviting user:", error)
        alert('Failed to invite user. They may already be a member.')
        return
      }

      // Update circle member count
      const { data: membersCount } = await supabase
        .from('circle_members')
        .select('id', { count: 'exact' })
        .eq('circle_id', circleId)
        .eq('mode', accountMode)

      await supabase
        .from('circles')
        .update({ member_count: membersCount?.length || 0 })
        .eq('id', circleId)

      alert('User invited successfully!')
      setSearchQuery("")
      setSearchResults([])
    } catch (error) {
      console.error("[v0] Error inviting user:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Members to {circleName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="search">Find Members</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-6">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Share this link with people you want to invite</p>
            </div>

            <div className="space-y-2">
              <Label>Quick Share</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleShare("whatsapp")} className="flex-col gap-1 h-auto py-3">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                <Button variant="outline" onClick={() => handleShare("email")} className="flex-col gap-1 h-auto py-3">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button variant="outline" onClick={handleCopy} className="flex-col gap-1 h-auto py-3">
                  <LinkIcon className="h-5 w-5" />
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-email">Invite by Email</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => console.log("[v0] Sending invite to:", email)} disabled={!email}>
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label>Search Members</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone, email, User ID, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Search for Assura Cash users by their phone number, email, unique User ID, or name
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.full_name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            {user.zcash_id && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                ID: {user.zcash_id}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleInviteUser(user.user_id)}
                            className="flex-shrink-0"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No users found matching "{searchQuery}"
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
