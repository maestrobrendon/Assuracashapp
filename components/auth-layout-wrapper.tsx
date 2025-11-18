"use client"

import { Sidebar } from "@/components/sidebar"
import { ThemeSync } from "@/components/theme-sync"
import { usePathname } from 'next/navigation'
import type React from "react"

export function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")

  return (
    <>
      <ThemeSync />
      {!isAuthPage && <Sidebar />}
      <main className={!isAuthPage ? "pt-16 lg:pt-0 lg:pl-64" : ""}>{children}</main>
    </>
  )
}
