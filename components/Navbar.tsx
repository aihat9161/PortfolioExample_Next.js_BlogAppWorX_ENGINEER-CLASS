"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"

export default function Navbar() {
  const { user, signOut, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // 認証関連のページかどうか
  const isAuthPage = pathname?.startsWith("/auth")

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("ログアウトエラー:", error)
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ブログアプリ
        </Link>

        <nav>
          <ul className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <li>
                      <button onClick={handleLogout} className="hover:text-blue-500">
                        ログアウト
                      </button>
                    </li>
                  </>
                ) : (
                  !isAuthPage && (
                    <>
                      <li>
                        <Link href="/auth/login" className="hover:text-blue-500">
                          ログイン
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/auth/signup"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                          新規登録
                        </Link>
                      </li>
                    </>
                  )
                )}
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
