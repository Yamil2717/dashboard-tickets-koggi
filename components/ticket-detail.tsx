"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketComments } from "@/components/ticket-comments"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import type { Ticket } from "@/lib/supabase"

interface TicketDetailProps {
  ticket: Ticket
  onClose: () => void
  onStatusChange?: (ticketId: number, newStatus: string) => Promise<void>
}

export function TicketDetail({ ticket, onClose, onStatusChange }: TicketDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(ticket.status)

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange || newStatus === currentStatus) return

    setIsUpdating(true)
    try {
      await onStatusChange(ticket.id!, newStatus)
      setCurrentStatus(newStatus)
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      alert("No se pudo actualizar el estado del ticket")
    } finally {
      setIsUpdating(false)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Alta
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="bg-amber-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Media
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Baja
          </Badge>
        )
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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {getPriorityBadge(ticket.priority)}
        {getStatusBadge(currentStatus)}
        <Badge variant="secondary">{ticket.category}</Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-4 pt-4">
          <div>
            <h4 className="mb-2 font-medium">Descripción original</h4>
            <p className="text-sm text-muted-foreground">{ticket.description}</p>
          </div>

          <Separator />

          <div>
            <h4 className="mb-2 font-medium flex items-center gap-2">
              Resumen AI
              <Badge variant="outline" className="ml-2">
                Generado automáticamente
              </Badge>
            </h4>
            <ScrollArea className="h-[120px] rounded-md border p-4">
              <p className="text-sm">{ticket.summary}</p>
            </ScrollArea>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Creado: {formatDate(ticket.created_at || "")}</span>
            <span>Última actualización: {formatDate(ticket.updated_at || "")}</span>
          </div>

          {onStatusChange && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Cambiar estado</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentStatus === "open" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("open")}
                    disabled={isUpdating || currentStatus === "open"}
                  >
                    Abierto
                  </Button>
                  <Button
                    variant={currentStatus === "in-progress" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("in-progress")}
                    disabled={isUpdating || currentStatus === "in-progress"}
                  >
                    En progreso
                  </Button>
                  <Button
                    variant={currentStatus === "resolved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange("resolved")}
                    disabled={isUpdating || currentStatus === "resolved"}
                  >
                    Resuelto
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="comments" className="pt-4">
          <TicketComments ticketId={ticket.id!.toString()} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
