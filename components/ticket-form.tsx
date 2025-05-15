"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "El título debe tener al menos 5 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  category: z.string({
    required_error: "Por favor selecciona una categoría.",
  }),
  contactEmail: z
    .string()
    .email({
      message: "Por favor ingresa un email válido.",
    })
    .optional()
    .or(z.literal("")),
})

export function TicketForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [aiPriority, setAiPriority] = useState("")
  const [ticketId, setTicketId] = useState("")
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      contactEmail: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Usar la API route para crear el ticket
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el ticket")
      }

      const data = await response.json()

      // Actualizar la UI
      setAiSummary(data.aiSummary)
      setAiPriority(data.aiPriority)
      setTicketId(data.ticketId)
      setIsSuccess(true)

      // Refrescar los datos
      router.refresh()
    } catch (error) {
      console.error("Error al crear el ticket:", error)
      alert("Hubo un error al crear el ticket. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    form.reset()
    setIsSuccess(false)
    setAiSummary("")
    setAiPriority("")
    setTicketId("")
  }

  const handleViewDashboard = () => {
    router.push("/")
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {!isSuccess ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del ticket</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Error en la página de inicio" {...field} />
                  </FormControl>
                  <FormDescription>Un título claro y conciso del problema o solicitud.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Soporte">Soporte</SelectItem>
                      <SelectItem value="Facturación">Facturación</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>La categoría ayuda a dirigir el ticket al equipo correcto.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema o solicitud con el mayor detalle posible..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Incluye toda la información relevante para entender y resolver el problema.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contacto (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormDescription>Para recibir notificaciones sobre este ticket.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Crear Ticket"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-2 text-2xl font-semibold">¡Ticket Creado!</h2>
              <p className="text-muted-foreground">Tu ticket ha sido procesado por nuestra IA</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Resumen generado por IA</h3>
                  <p className="mt-1">{aiSummary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Prioridad asignada</h3>
                  <div className="mt-1">
                    {aiPriority === "Alta" && <Badge variant="destructive">Alta</Badge>}
                    {aiPriority === "Media" && (
                      <Badge variant="default" className="bg-amber-500">
                        Media
                      </Badge>
                    )}
                    {aiPriority === "Baja" && <Badge variant="outline">Baja</Badge>}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID de Ticket</h3>
                  <p className="mt-1 font-mono">{ticketId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleReset} className="flex-1">
              Crear otro ticket
            </Button>
            <Button onClick={handleViewDashboard} variant="outline" className="flex-1">
              Ver Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
