import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// ブログ記事の取得
export async function GET(request: NextRequest) {
  //const supabase = createRouteHandlerClient({ cookies })

  // クエリパラメータからIDを取得
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  try {
    let query = supabase.from("blogs").select("*, profiles(name)")

    // IDが指定されている場合は特定の記事を取得
    if (id) {
      query = query.eq("id", id).single()
    } else {
      // 指定がない場合は全記事を取得（作成日時の降順）
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "ブログ記事の取得に失敗しました" }, { status: 500 })
  }
}

// ブログ記事の作成
export async function POST(request: NextRequest) {
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
    const { title, content } = body

    // バリデーション
    if (!title || !content) {
      return NextResponse.json({ error: "タイトルと内容は必須です" }, { status: 400 })
    }

    // ブログ記事の作成（講義内で実装）
    const { data, error } = await supabase
      .from("blogs")
      .insert([
        {
          title,
          content,
          user_id: session.user.id,
        },
      ])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "ブログ記事の作成に失敗しました" }, { status: 500 })
  }
}

// ブログ記事の更新
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
    const { id, title, content } = body

    // バリデーション
    if (!id || !title || !content) {
      return NextResponse.json({ error: "ID、タイトル、内容は必須です" }, { status: 400 })
    }

    // 記事の所有者チェック
    const { data: blog } = await supabase.from("blogs").select("user_id").eq("id", id).single()

    if (!blog) {
      return NextResponse.json({ error: "ブログ記事が見つかりません" }, { status: 404 })
    }

    if (blog.user_id !== session.user.id) {
      return NextResponse.json({ error: "この操作を行う権限がありません" }, { status: 403 })
    }

    // ブログ記事の更新（講義内で実装）
    const { data, error } = await supabase.from("blogs").update({ title, content }).eq("id", id).select()

    if (error) {
      throw error
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "ブログ記事の更新に失敗しました" }, { status: 500 })
  }
}

// ブログ記事の削除
export async function DELETE(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // 認証チェック
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
  }

  // クエリパラメータからIDを取得
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "IDは必須です" }, { status: 400 })
  }

  try {
    // 記事の所有者チェック
    const { data: blog } = await supabase.from("blogs").select("user_id").eq("id", id).single()

    if (!blog) {
      return NextResponse.json({ error: "ブログ記事が見つかりません" }, { status: 404 })
    }

    if (blog.user_id !== session.user.id) {
      return NextResponse.json({ error: "この操作を行う権限がありません" }, { status: 403 })
    }

    // ブログ記事の削除（講義内で実装）
    const { error } = await supabase.from("blogs").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "ブログ記事の削除に失敗しました" }, { status: 500 })
  }
}
