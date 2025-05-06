import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// ユーザー情報の取得
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(null)
    }

    // ユーザープロフィールの取得
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    return NextResponse.json({
      user: session.user,
      profile,
    })
  } catch (error) {
    return NextResponse.json({ error: "ユーザー情報の取得に失敗しました" }, { status: 500 })
  }
}

// プロフィール更新
export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // 認証チェック
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    // バリデーション
    if (!name) {
      return NextResponse.json({ error: "名前は必須です" }, { status: 400 })
    }

    // プロフィールの更新
    const { data, error } = await supabase.from("profiles").update({ name }).eq("id", session.user.id).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "プロフィールの更新に失敗しました" }, { status: 500 })
  }
}
