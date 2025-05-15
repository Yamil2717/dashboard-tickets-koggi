import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { summarizeWithGemini } from "../ai/summarize/utils"

// Crear cliente de Supabase con la clave de servicio para evitar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, contactEmail } = body

    // Generar ID de ticket
    const newTicketId = `TICK-${Math.floor(1000 + Math.random() * 9000)}`

    // Obtener resumen y prioridad usando directamente la función
    const geminiResponse = await summarizeWithGemini(title, description, category)

    // Convertir prioridad de Gemini al formato de la base de datos
    const dbPriority =
      geminiResponse.priority === "Alta" ? "high" : geminiResponse.priority === "Media" ? "medium" : "low"

    // Guardar el ticket en Supabase usando la clave de servicio
    const { data, error } = await supabaseAdmin
      .from("tickets")
      .insert({
        ticket_id: newTicketId,
        title,
        description,
        category,
        priority: dbPriority,
        status: "open",
        summary: geminiResponse.summary,
        contact_email: contactEmail || null,
      })
      .select()

    if (error) {
      console.error("Error al crear ticket:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aquí podrías añadir la integración con n8n
    // Por ejemplo:
    /*
    try {
      const n8nWebhookUrl = "TU_URL_DE_WEBHOOK_N8N";
      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: data[0].ticket_id,
          title: data[0].title,
          priority: dbPriority,
          summary: geminiResponse.summary,
          category: category,
        }),
      });
    } catch (n8nError) {
      console.error("Error al notificar a n8n:", n8nError);
      // No interrumpimos el flujo si falla la notificación
    }
    */

    return NextResponse.json({
      ticket: data[0],
      aiSummary: geminiResponse.summary,
      aiPriority: geminiResponse.priority,
      ticketId: newTicketId,
    })
  } catch (error: any) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
