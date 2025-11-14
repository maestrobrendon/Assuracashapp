import type React from "react"
import "./globals.css"

import { AuthLayoutWrapper } from "@/components/auth-layout-wrapper"

import { Manrope, Geist_Mono, Geist_Mono as V0_Font_Geist_Mono } from 'next/font/google'

// Initialize fonts
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })

const manrope = Manrope({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
