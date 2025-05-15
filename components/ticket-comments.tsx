"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Send, Loader2 } from "lucide-react"

type Comment = {
  id: number
  ticket_id: string
  content: string
  author: string
  created_at: string
}

export function TicketComments({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (ticketId) {
      loadComments()
    }
  }, [ticketId])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tickets/comments?ticketId=${ticketId}`)
      if (!response.ok) {
        throw new Error("Error al cargar comentarios")
      }
      const data = await response.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/tickets/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          content: newComment,
          author: "Usuario", // En un sistema real, esto vendría del usuario autenticado
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar comentario")
      }

      const data = await response.json()
      setComments([...comments, data.comment])
      setNewComment("")
    } catch (error) {
      console.error("Error:", error)
      alert("No se pudo enviar el comentario. Inténtalo de nuevo.")
    } finally {
      setIsSending(false)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comentarios</h3>

      <div className="space-y-4 max-h-60 overflow-y-auto p-1">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No hay comentarios. Sé el primero en comentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{comment.author}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          placeholder="Escribe un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button type="submit" size="icon" disabled={isSending || !newComment.trim()}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
