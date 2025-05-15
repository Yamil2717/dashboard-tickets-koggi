import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con la clave de servicio para evitar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("ticketId")

    if (!ticketId) {
      return NextResponse.json({ error: "Se requiere ticketId" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("ticket_comments")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error al obtener comentarios:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments: data })
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ticketId, content, author } = body

    if (!ticketId || !content) {
      return NextResponse.json({ error: "Se requieren ticketId y content" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("ticket_comments")
      .insert({
        ticket_id: ticketId,
        content,
        author: author || "Usuario",
      })
      .select()

    if (error) {
      console.error("Error al crear comentario:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comment: data[0] })
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
