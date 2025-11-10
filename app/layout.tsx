import type React from "react"
import "./globals.css"
import { Manrope, Geist_Mono } from "next/font/google"
import { AuthLayoutWrapper } from "@/components/auth-layout-wrapper"

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
