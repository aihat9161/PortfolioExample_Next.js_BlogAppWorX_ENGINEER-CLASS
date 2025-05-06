import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabaseClient"
import { cookies } from "next/headers"
import Link from "next/link"
import BlogCard from "@/components/BlogCard"

import { useRouter } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function Home() {

  // ブログ記事の取得（講義内で実装）
  const { data: blogs } = await supabase
  .from("blogs")
  .select("*, profiles(name)")
  .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ブログ一覧</h1>
        <Link href="/blog/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          新規作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
          ) : (
          <p className="text-gray-500">まだブログがありません。</p>
          )}
      </div>
    </div>
  )
}
