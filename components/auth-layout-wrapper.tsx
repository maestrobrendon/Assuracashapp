"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
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
      {!isAuthPage && <Sidebar />}
      <main className={!isAuthPage ? "lg:pl-64" : ""}>{children}</main>
    </>
  )
}
