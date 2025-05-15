"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function TicketFilters({ onFilterChange }: { onFilterChange: (key: string, value: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      onFilterChange("search", searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, onFilterChange])

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 md:max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar tickets..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue="all" onValueChange={(value) => onFilterChange("priority", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all" onValueChange={(value) => onFilterChange("status", value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in-progress">En progreso</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Filtros avanzados</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtros avanzados</SheetTitle>
              <SheetDescription>Configura filtros adicionales para tus tickets</SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="category">
                  <AccordionTrigger>Categoría</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="category-all"
                          checked={true}
                          onCheckedChange={() => onFilterChange("category", "all")}
                        />
                        <Label htmlFor="category-all">Todas</Label>
                      </div>
                      {["Técnico", "Comercial", "Soporte", "Facturación"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            onCheckedChange={(checked) => {
                              if (checked) onFilterChange("category", category)
                            }}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="date">
                  <AccordionTrigger>Fecha</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date-from">Desde</Label>
                        <Input type="date" id="date-from" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date-to">Hasta</Label>
                        <Input type="date" id="date-to" />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  onFilterChange("search", "")
                  onFilterChange("priority", "all")
                  onFilterChange("status", "all")
                  onFilterChange("category", "all")
                }}
              >
                Limpiar
              </Button>
              <Button>Aplicar filtros</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
