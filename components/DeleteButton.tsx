"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    // 確認ダイアログ
    if (!confirm("本当にこの記事を削除しますか？この操作は元に戻せません。")) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id)

      if (error) {
        throw error
      }

      // 削除成功したらホームページへリダイレクト
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("削除エラー:", error)
      alert("削除中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:underline"
      aria-label="ブログを削除"
    >
      {loading ? "削除中..." : "削除する"}
    </button>
  )
}
