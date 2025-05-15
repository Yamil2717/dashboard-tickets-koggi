"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Loader2 } from "lucide-react"
import { TicketDetail } from "@/components/ticket-detail"
import type { Ticket } from "@/lib/supabase"

export function TicketList({ filters = { status: "all", priority: "all", category: "all", search: "" } }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar tickets al montar el componente o cuando cambian los filtros
  useEffect(() => {
    loadTickets()
  }, [filters])

  const loadTickets = async () => {
    setIsLoading(true)
    try {
      // Construir la URL con los parámetros de filtro
      const queryParams = new URLSearchParams()
      if (filters.status && filters.status !== "all") queryParams.set("status", filters.status)
      if (filters.priority && filters.priority !== "all") queryParams.set("priority", filters.priority)
      if (filters.category && filters.category !== "all") queryParams.set("category", filters.category)
      if (filters.search) queryParams.set("search", filters.search)

      const response = await fetch(`/api/tickets/list?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error("Error al cargar tickets")
      }

      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error("Error al cargar tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/tickets/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ticketId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar estado")
      }

      // Actualizar la lista de tickets
      await loadTickets()

      // Actualizar el ticket seleccionado si está abierto
      if (selectedTicket && selectedTicket.id === ticketId) {
        const { ticket } = await response.json()
        setSelectedTicket(ticket)
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Error:", error)
      return Promise.reject(error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return (
          <Badge variant="default" className="bg-amber-500">
            Media
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Baja</Badge>
      default:
        return <Badge variant="secondary">Sin definir</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Abierto
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            En progreso
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Resuelto
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay tickets disponibles. ¡Crea tu primer ticket!
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.ticket_id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{ticket.category}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(ticket.created_at || "")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewTicket(ticket)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver ticket</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedTicket && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTicket.ticket_id} - {selectedTicket.title}
              </DialogTitle>
              <DialogDescription>Detalles del ticket</DialogDescription>
            </DialogHeader>
            <TicketDetail
              ticket={selectedTicket}
              onClose={() => setIsDialogOpen(false)}
              onStatusChange={handleStatusChange}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
