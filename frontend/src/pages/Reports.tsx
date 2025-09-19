import { useState, useEffect } from 'react'
import { Search, Filter, Plus, FileText, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ReportService } from '@/services/ReportService'
import { ProcessingStatus } from '@shared/types/VeterinaryReport'

export function Reports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | ''>('')

  useEffect(() => {
    loadReports()
  }, [searchQuery, statusFilter])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await ReportService.getAllReports({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        page: 1,
        limit: 20
      })
      
      if (response.success && response.data) {
        setReports(response.data.reports)
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ProcessingStatus) => {
    const statusConfig = {
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', text: 'Procesando' },
      COMPLETED: { color: 'bg-green-100 text-green-800', text: 'Completado' },
      ERROR: { color: 'bg-red-100 text-red-800', text: 'Error' },
      NEEDS_REVIEW: { color: 'bg-orange-100 text-orange-800', text: 'Necesita Revisión' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-veterinary-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reportes Veterinarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona y revisa todos los reportes del sistema
          </p>
        </div>
        <Button className="veterinary-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProcessingStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-veterinary-primary focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="PROCESSING">Procesando</option>
                <option value="COMPLETED">Completado</option>
                <option value="ERROR">Error</option>
                <option value="NEEDS_REVIEW">Necesita Revisión</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No hay reportes
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comienza subiendo algunos archivos para procesar.
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {report.filename}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Paciente:</strong> {report.patient?.name || 'No especificado'}</p>
                      <p><strong>Especie:</strong> {report.patient?.species || 'No especificado'}</p>
                      <p><strong>Veterinario:</strong> {report.veterinarian?.name || 'No especificado'}</p>
                      <p><strong>Fecha:</strong> {new Date(report.createdAt).toLocaleDateString('es-ES')}</p>
                    </div>

                    {report.diagnosis && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Diagnóstico:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.diagnosis}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
