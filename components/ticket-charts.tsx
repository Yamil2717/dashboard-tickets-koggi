"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "lucide-react"

// Importamos Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Registramos los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export function TicketCharts() {
  const [chartData, setChartData] = useState({
    labels: [],
    tickets: [],
    priorities: { high: 0, medium: 0, low: 0 },
    categories: {},
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch("/api/tickets/charts")
        if (!response.ok) {
          throw new Error("Error al cargar datos para gráficos")
        }
        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [])

  // Datos para el gráfico de línea (tickets por día)
  const lineData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Tickets Creados",
        data: chartData.tickets,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.2,
      },
    ],
  }

  // Datos para el gráfico de pastel (prioridades)
  const pieData = {
    labels: ["Alta", "Media", "Baja"],
    datasets: [
      {
        data: [chartData.priorities.high, chartData.priorities.medium, chartData.priorities.low],
        backgroundColor: ["rgba(239, 68, 68, 0.7)", "rgba(245, 158, 11, 0.7)", "rgba(16, 185, 129, 0.7)"],
        borderColor: ["rgb(239, 68, 68)", "rgb(245, 158, 11)", "rgb(16, 185, 129)"],
        borderWidth: 1,
      },
    ],
  }

  // Datos para el gráfico de barras (categorías)
  const barData = {
    labels: Object.keys(chartData.categories),
    datasets: [
      {
        label: "Tickets por Categoría",
        data: Object.values(chartData.categories),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Cargando estadísticas...</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse">Cargando datos...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Análisis de Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">
              <LineChart className="h-4 w-4 mr-2" />
              Línea de Tiempo
            </TabsTrigger>
            <TabsTrigger value="priorities">
              <PieChart className="h-4 w-4 mr-2" />
              Prioridades
            </TabsTrigger>
            <TabsTrigger value="categories">
              <BarChart className="h-4 w-4 mr-2" />
              Categorías
            </TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="h-72">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Tickets creados por día",
                  },
                },
              }}
            />
          </TabsContent>
          <TabsContent value="priorities" className="h-72">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Distribución por prioridad",
                  },
                },
              }}
            />
          </TabsContent>
          <TabsContent value="categories" className="h-72">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Tickets por categoría",
                  },
                },
              }}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
