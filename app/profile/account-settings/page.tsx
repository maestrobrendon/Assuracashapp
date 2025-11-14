"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, User, CreditCard, Award as IdCard, UserCheck, Users, Bell, FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function AccountSettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        <SettingsItem 
          icon={<User className="h-5 w-5 text-muted-foreground" />}
          label="Profile Settings"
          onClick={() => router.push("/profile/edit")}
        />

        <SettingsItem 
          icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
          label="BVN Settings"
          onClick={() => {}}
        />

        <SettingsItem 
          icon={<IdCard className="h-5 w-5 text-muted-foreground" />}
          label="NIN Settings"
          onClick={() => {}}
        />

        <SettingsItem 
          icon={<UserCheck className="h-5 w-5 text-muted-foreground" />}
          label="Update KYC"
          onClick={() => {}}
        />

        <SettingsItem 
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          label="Next of Kin"
          onClick={() => {}}
        />

        <SettingsItem 
          icon={<Bell className="h-5 w-5 text-muted-foreground" />}
          label="Notifications"
          onClick={() => router.push("/profile/notifications")}
        />

        <SettingsItem 
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          label="Assura Cash Story"
          onClick={() => {}}
        />
      </div>
    </div>
  )
}

function SettingsItem({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full py-4 bg-card rounded-lg px-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          {icon}
        </div>
        <span className="text-base font-normal">{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  )
}
