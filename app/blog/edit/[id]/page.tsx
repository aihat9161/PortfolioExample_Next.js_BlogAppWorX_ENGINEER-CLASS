"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import BlogForm from "@/components/BlogForm" // BlogFormDirectからBlogFormに変更
import Link from "next/link"

export default function EditBlogPage() {
  const [blog, setBlog] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log(`ブログ編集ページ: ID=${id}の記事を取得中`)

        // セッション確認
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("未ログイン状態: ログインページへリダイレクト")
          router.push("/auth/login")
          return
        }

        console.log(`認証済み: ユーザーID=${session.user.id}`)

        // ブログ記事を取得
        const { data: blogData, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single()

        if (error) {
          console.error("ブログ取得エラー:", error)
          setError(`ブログ記事の取得に失敗しました: ${error.message}`)
          return
        }

        if (!blogData) {
          setError(`ID: ${id} のブログ記事が見つかりません`)
          return
        }

        console.log("ブログ取得成功:", {
          id: blogData.id,
          title: blogData.title,
          owner: blogData.user_id,
        })

        // 所有者チェック - 文字列として比較
        if (String(blogData.user_id) !== String(session.user.id)) {
          console.error("権限エラー: このブログの編集権限がありません", {
            blogOwnerId: blogData.user_id,
            blogOwnerIdType: typeof blogData.user_id,
            currentUserId: session.user.id,
            currentUserIdType: typeof session.user.id,
          })
          setError("このブログを編集する権限がありません")
          return
        }

        setBlog(blogData)
      } catch (error: any) {
        console.error("データ取得エラー:", error)
        setError(`データの取得中にエラーが発生しました: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id, router])

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

  if (!blog) {
    return <div className="max-w-3xl mx-auto">ブログ記事が見つかりません</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ブログ編集</h1>
      <BlogForm blog={blog} />
    </div>
  )
}
