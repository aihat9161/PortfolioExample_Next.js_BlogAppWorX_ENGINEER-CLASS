"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import DeleteButton from "@/components/DeleteButton" // DeleteButtonをインポート

export default function BlogPage() {
  const [blog, setBlog] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // セッション情報を取得
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          setUser(session.user)
        }

        // ブログ記事を取得
        const { data: blogData, error } = await supabase
        .from("blogs")
        .select("*, profiles(name)")
        .eq("id", id)
        .single()

        if (error) {
          console.error("ブログ取得エラー:", error)
          setError(`ブログの取得に失敗しました: ${error.message}`)
          return
        }

        if (!blogData) {
          setError("ブログ記事が見つかりません")
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

    fetchData()
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

  // 所有者チェック - 文字列に変換して比較
  const isOwner = user?.id && blog.user_id && String(user.id) === String(blog.user_id)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
        <div className="flex justify-between items-center text-gray-500">
          <p>投稿者: {blog.profiles?.name || "匿名"}</p>
          <p>{new Date(blog.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="prose max-w-none mb-8">{blog.content}</div>

      <div className="flex gap-4">
        <Link href="/" className="text-blue-500 hover:underline">
          ← 戻る
        </Link>

        {isOwner && (
          <>
            <Link href={`/blog/edit/${blog.id}`} className="text-blue-500 hover:underline">
              編集する
            </Link>
            <DeleteButton id={blog.id} />
          </>
        )}
      </div>
    </div>
  )
}
