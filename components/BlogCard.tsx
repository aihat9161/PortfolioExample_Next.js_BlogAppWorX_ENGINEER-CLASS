import Link from "next/link"

type Blog = {
  id: string
  title: string
  content: string
  created_at: string
  user_id: string
  profiles?: {
    name: string
  }
}

export default function BlogCard({ blog }: { blog: Blog }) {
  // 内容の一部を表示（最初の100文字）
  const excerpt = blog.content.length > 100 ? blog.content.substring(0, 100) + "..." : blog.content

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={`/blog/${blog.id}`} className="hover:text-blue-500">
            {blog.title}
          </Link>
        </h2>

        <p className="text-gray-600 mb-4">{excerpt}</p>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <p>投稿者: {blog.profiles?.name || "匿名"}</p>
          <p>{new Date(blog.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
