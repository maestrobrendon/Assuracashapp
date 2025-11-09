"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, LinkIcon, Mail, MessageSquare, Check } from "lucide-react"

interface InviteMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleName: string
  inviteLink: string
}

export function InviteMembersModal({ open, onOpenChange, circleName, inviteLink }: InviteMembersModalProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: string) => {
    console.log("[v0] Sharing via:", platform)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Members to {circleName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <Button variant="outline" onClick={() => handleShare("copy")} className="flex-col gap-1 h-auto py-3">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
