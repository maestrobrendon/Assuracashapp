import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Manrope, Geist_Mono } from "next/font/google"

// Initialize fonts properly
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Assura Cash - Africa's First Spending Operating System",
  description: "Protect your money from yourself with lockable wallets for specific expenses",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${geistMono.variable} font-sans antialiased`}>
        <Sidebar />
        <div className="lg:pl-64 pt-14 lg:pt-0">{children}</div>
      </body>
    </html>
  )
}
