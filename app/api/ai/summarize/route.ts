import { NextResponse } from "next/server"
import { summarizeWithGemini } from "./utils"

export async function POST(request: Request) {
  try {
    const { title, description, category } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Se requieren título, descripción y categoría" }, { status: 400 })
    }

    const result = await summarizeWithGemini(title, description, category)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error en la API de resumen:", error)
    return NextResponse.json(
      {
        summary: "No se pudo generar un resumen automático.",
        priority: "Media",
      },
      { status: 500 },
    )
  }
}
