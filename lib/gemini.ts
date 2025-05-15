// Solo definimos tipos, sin acceder a variables de entorno
export type GeminiResponse = {
  summary: string
  priority: "Alta" | "Media" | "Baja"
}

// Esta función ahora solo existe como tipo, no como implementación
export type SummarizeFunction = (title: string, description: string, category: string) => Promise<GeminiResponse>
