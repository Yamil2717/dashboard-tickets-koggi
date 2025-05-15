import type { GeminiResponse } from "@/lib/gemini"

// Accedemos a la clave API solo en el servidor
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export async function summarizeWithGemini(
  title: string,
  description: string,
  category: string,
): Promise<GeminiResponse> {
  try {
    const prompt = `
      Actúa como un analista de soporte. A partir del título, la descripción y la categoría de un ticket, genera un resumen breve del caso y asigna una prioridad en base a la urgencia y criticidad. 

      La prioridad debe ser:
      - "Alta": si el problema impide operaciones, afecta a muchos usuarios o requiere atención inmediata.
      - "Media": si el problema impacta parcialmente el servicio o puede esperar algunas horas.
      - "Baja": si es una consulta, solicitud sin urgencia o problema menor.

      Devuelve un JSON con "summary" y "priority".

      Ejemplo de entrada:
      Título: El sistema no carga la pantalla principal  
      Descripción: El usuario reporta que después de loguearse, la pantalla queda en blanco. Afecta a varios usuarios.  
      Categoría: Soporte

      Ahora analiza el siguiente ticket:
      Título: ${title}
      Descripción: ${description}
      Categoría: ${category}
    `

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!response.ok) {
      console.error(`Error en la API de Gemini: ${response.status} ${response.statusText}`)
      throw new Error(`Error en la API de Gemini: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Intentar parsear la respuesta como JSON
    try {
      return JSON.parse(text)
    } catch {
      // Fallback: si no es JSON válido, usar heurística simple
      return {
        summary: text.split("\n")[0] || "Resumen no disponible",
        priority: /alta/i.test(text) ? "Alta" : /media/i.test(text) ? "Media" : "Baja",
      }
    }
  } catch (error: any) {
    console.error("Error al resumir con Gemini:", error)
    return {
      summary: "No se pudo generar un resumen automático.",
      priority: "Media",
    }
  }
}
