"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()

  // 初期ロード時の処理
  useEffect(() => {
    // セッションチェック
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        // すでにログインしている場合はリダイレクト
        router.push("/")
        return
      }
      setInitialLoading(false)
    }

    checkSession()
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("ユーザー登録に失敗しました")
      }

      // 2. プロフィール作成
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          name: name || email.split("@")[0], // 名前が空の場合はメールアドレスの@前を使用
        },
      ])

      if (profileError) {
        throw profileError
      }

      console.log("登録成功")

      // 少し遅延させてからリダイレクト
      setTimeout(() => {
        router.push("/auth/login")
      }, 1000)
    } catch (error: any) {
      console.error("登録エラー:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // 初期ロード中は読み込み中表示
  if (initialLoading) {
    return <div className="max-w-md mx-auto">読み込み中...</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">新規登録</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">
            名前（任意）
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className="mt-4 text-center">
        すでにアカウントをお持ちの方は
        <Link href="/auth/login" className="text-blue-500 hover:underline ml-1">
          ログイン
        </Link>
      </p>
    </div>
  )
}
