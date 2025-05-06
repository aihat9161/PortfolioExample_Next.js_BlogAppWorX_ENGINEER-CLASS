"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

type Blog = {
  id: string
  title: string
  content: string
}

export default function BlogForm({ blog }: { blog?: Blog }) {
  const [title, setTitle] = useState(blog?.title || "")
  const [content, setContent] = useState(blog?.content || "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const isEditing = !!blog

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // バリデーション
      if (!title.trim()) {
        throw new Error("タイトルは必須です")
      }

      if (!content.trim()) {
        throw new Error("内容は必須です")
      }

      // セッション取得
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error("ログインが必要です。再度ログインしてください。")
      }

      // 直接Supabaseクライアントを使用
      if (isEditing) {
        // 編集の場合
        if (!blog?.id) {
          throw new Error("ブログIDが不正です")
        }

        console.log(`ブログ更新: ID=${blog.id}, タイトル=${title}, 内容長=${content.length}文字`)

        const { data, error } = await supabase
        .from("blogs")
        .update({ title, content })
        .eq("id", blog.id)
        .select()

        if (error) {
          console.error("Supabase更新エラー:", error)
          throw new Error(`ブログの更新に失敗しました: ${error.message}`)
        }

        console.log("更新成功:", data)
      } else {
        // 新規作成の場合
        console.log(`ブログ作成: タイトル=${title}, 内容長=${content.length}文字`)

        const { data, error } = await supabase
          .from("blogs")
          .insert([{ title, content, user_id: session.user.id }])
          .select()

        if (error) {
          console.error("Supabase挿入エラー:", error)
          throw new Error(`ブログの作成に失敗しました: ${error.message}`)
        }

        console.log("作成成功:", data)
      }

      // 成功したらメインページへリダイレクト
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("フォーム送信エラー:", error)
      setError(error.message || "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="space-y-2">
        <label htmlFor="title" className="block font-medium">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block font-medium">
          内容
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border rounded min-h-[200px]"
          required
        />
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "保存中..." : isEditing ? "更新する" : "作成する"}
        </button>

        <Link href={isEditing ? `/blog/${blog.id}` : "/"} className="px-4 py-2 border rounded hover:bg-gray-100">
          キャンセル
        </Link>
      </div>
    </form>
  )
}
