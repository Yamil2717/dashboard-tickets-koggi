"use client"

import { useState, useCallback } from "react"
import { ThemeProvider } from "next-themes"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketList } from "@/components/ticket-list"
import { TicketForm } from "@/components/ticket-form"
import { TicketStats } from "@/components/ticket-stats"
import { TicketFilters } from "@/components/ticket-filters"
import { TicketCharts } from "@/components/ticket-charts"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, PlusCircle, TicketIcon, Settings, User, BarChart3 } from "lucide-react"

export function TicketDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: "",
  })

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <TicketIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">TicketAI</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "new"} onClick={() => setActiveTab("new")}>
                  <PlusCircle className="h-5 w-5" />
                  <span>Nuevo Ticket</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>
                  <BarChart3 className="h-5 w-5" />
                  <span>Análisis</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <User className="h-5 w-5" />
                  <span>Mi Perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="container mx-auto p-4">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <SidebarTrigger className="md:hidden mr-2" />
                <h1 className="text-2xl font-bold inline-block">
                  {activeTab === "dashboard"
                    ? "Dashboard de Tickets"
                    : activeTab === "new"
                      ? "Nuevo Ticket"
                      : "Análisis de Tickets"}
                </h1>
              </div>
              <ThemeToggle />
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="new">Nuevo Ticket</TabsTrigger>
                <TabsTrigger value="analytics">Análisis</TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="space-y-6">
                <TicketStats />
                <TicketFilters onFilterChange={handleFilterChange} />
                <TicketList filters={filters} />
              </TabsContent>
              <TabsContent value="new">
                <TicketForm />
              </TabsContent>
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <TicketCharts />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
