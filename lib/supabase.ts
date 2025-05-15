import { createClient } from "@supabase/supabase-js"

// Tipos para nuestra base de datos
export type Ticket = {
  id?: number
  ticket_id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  summary?: string
  contact_email?: string
  created_at?: string
  updated_at?: string
}

// Crear cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones para interactuar con la tabla de tickets
export async function getTickets() {
  const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }

  return data || []
}

export async function getTicketsByFilter(filters: {
  status?: string
  priority?: string
  category?: string
  search?: string
}) {
  let query = supabase.from("tickets").select("*")

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority)
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching filtered tickets:", error)
    return []
  }

  return data || []
}

export async function createTicket(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("tickets").insert(ticket).select()

  if (error) {
    console.error("Error creating ticket:", error)
    throw error
  }

  return data?.[0]
}

export async function updateTicket(id: number, updates: Partial<Ticket>) {
  const { data, error } = await supabase
    .from("tickets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating ticket:", error)
    throw error
  }

  return data?.[0]
}

export async function getTicketStats() {
  const { data: tickets, error } = await supabase.from("tickets").select("status, priority")

  if (error) {
    console.error("Error fetching ticket stats:", error)
    return {
      total: 0,
      pending: 0,
      critical: 0,
      resolved: 0,
    }
  }

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "open" || t.status === "in-progress").length,
    critical: tickets.filter((t) => t.priority === "high").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  }

  return stats
}
