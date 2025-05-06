import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/lib/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ブログアプリ",
  description: "Next.jsとSupabaseで作成したブログアプリ",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} text-black dark:text-white bg-white dark:bg-black`}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
