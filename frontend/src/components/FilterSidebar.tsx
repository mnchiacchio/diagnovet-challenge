import { useState } from 'react'
import { X, Search, Filter, Calendar, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProcessingStatus } from '@shared/types/VeterinaryReport'

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  currentFilters: FilterState
}

export interface FilterState {
  search: string
  status: ProcessingStatus | ''
  dateFrom: string
  dateTo: string
  species: string
  veterinarian: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PROCESSING', label: 'Procesando' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'ERROR', label: 'Error' },
  { value: 'NEEDS_REVIEW', label: 'Necesita Revisión' }
]

export function FilterSidebar({ isOpen, onClose, onApplyFilters, currentFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      species: '',
      veterinarian: ''
    }
    setFilters(clearedFilters)
    onApplyFilters(clearedFilters)
    onClose()
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex">
      <div className="bg-white dark:bg-gray-900 w-80 h-full shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-veterinary-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros de Búsqueda
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros */}
          <div className="space-y-6">
            {/* Búsqueda */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Search className="h-4 w-4 mr-2 text-veterinary-primary" />
                  Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Buscar por paciente, veterinario..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-veterinary-primary" />
                  Estado del Reporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Rango de fechas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-veterinary-primary" />
                  Rango de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Desde
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Hasta
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filtros adicionales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-veterinary-primary" />
                  Filtros Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Especie
                  </label>
                  <Input
                    placeholder="Perro, Gato, etc."
                    value={filters.species}
                    onChange={(e) => handleFilterChange('species', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Veterinario
                  </label>
                  <Input
                    placeholder="Nombre del veterinario"
                    value={filters.veterinarian}
                    onChange={(e) => handleFilterChange('veterinarian', e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros activos */}
          {hasActiveFilters && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtros Activos:
              </h3>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Búsqueda: {filters.search}
                  </Badge>
                )}
                {filters.status && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
                  </Badge>
                )}
                {filters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    Desde: {filters.dateFrom}
                  </Badge>
                )}
                {filters.dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    Hasta: {filters.dateTo}
                  </Badge>
                )}
                {filters.species && (
                  <Badge variant="secondary" className="text-xs">
                    Especie: {filters.species}
                  </Badge>
                )}
                {filters.veterinarian && (
                  <Badge variant="secondary" className="text-xs">
                    Veterinario: {filters.veterinarian}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={handleApplyFilters}
              className="w-full veterinary-button"
            >
              Aplicar Filtros
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
