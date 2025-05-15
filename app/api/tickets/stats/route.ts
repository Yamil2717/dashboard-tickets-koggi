import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con la clave de servicio para evitar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    const { data: tickets, error } = await supabaseAdmin.from("tickets").select("status, priority")

    if (error) {
      console.error("Error al obtener estadísticas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const stats = {
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "open" || t.status === "in-progress").length,
      critical: tickets.filter((t) => t.priority === "high").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
