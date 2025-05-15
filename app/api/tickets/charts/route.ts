import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente de Supabase con la clave de servicio para evitar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    // Obtener todos los tickets
    const { data: tickets, error } = await supabaseAdmin
      .from("tickets")
      .select("created_at, priority, category")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error al obtener tickets:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Procesar datos para gráficos
    const dateMap = new Map()
    const priorities = { high: 0, medium: 0, low: 0 }
    const categories = {}

    // Obtener fecha actual y hace 7 días
    const today = new Date()
    const last7Days = new Date(today)
    last7Days.setDate(today.getDate() - 6)

    // Inicializar el mapa de fechas para los últimos 7 días
    for (let i = 0; i < 7; i++) {
      const date = new Date(last7Days)
      date.setDate(last7Days.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      dateMap.set(dateStr, 0)
    }

    // Procesar tickets
    tickets.forEach((ticket) => {
      // Contar por prioridad
      priorities[ticket.priority] = (priorities[ticket.priority] || 0) + 1

      // Contar por categoría
      categories[ticket.category] = (categories[ticket.category] || 0) + 1

      // Contar por fecha (últimos 7 días)
      const ticketDate = new Date(ticket.created_at).toISOString().split("T")[0]
      if (dateMap.has(ticketDate)) {
        dateMap.set(ticketDate, dateMap.get(ticketDate) + 1)
      }
    })

    // Convertir el mapa de fechas a arrays para el gráfico
    const labels = Array.from(dateMap.keys())
    const ticketCounts = Array.from(dateMap.values())

    return NextResponse.json({
      labels,
      tickets: ticketCounts,
      priorities,
      categories,
    })
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
