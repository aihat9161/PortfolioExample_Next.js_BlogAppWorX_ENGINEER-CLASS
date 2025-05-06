"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BlogForm from "@/components/BlogForm" // BlogFormDirectからBlogFormに変更
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function NewBlogPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // セッション確認
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("未ログイン状態: ログインページへリダイレクト")
          router.push("/auth/login")
          return
        }

        setLoading(false)
      } catch (error) {
        console.error("認証確認エラー:", error)
        setError("認証状態の確認中にエラーが発生しました")
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className="max-w-3xl mx-auto">読み込み中...</div>
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Link href="/" className="text-blue-500 hover:underline">
          ← ホームに戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">新規ブログ作成</h1>
      <BlogForm />
    </div>
  )
}
