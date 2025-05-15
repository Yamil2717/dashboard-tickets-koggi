import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con la clave de servicio para evitar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: "Se requieren id y status" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar ticket:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aquí podríamos enviar una notificación a n8n
    // Ejemplo: await fetch('https://tu-instancia-n8n.com/webhook/ticket-updated', {...})

    return NextResponse.json({ ticket: data[0] })
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
