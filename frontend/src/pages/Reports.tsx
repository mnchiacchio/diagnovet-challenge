import { useState, useEffect } from 'react'
import { Search, FileText, Eye, Edit, Trash2, RefreshCw, Download, Filter, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ReportService } from '@/services/ReportService'
import { UploadService } from '@/services/UploadService'
import { ProcessingStatus } from '@shared/types/VeterinaryReport'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/hooks/use-toast'
import { FilterSidebar, FilterState } from '@/components/FilterSidebar'

export function Reports() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set())
  const [deletingReports, setDeletingReports] = useState<Set<string>>(new Set())
  const [downloadingReports, setDownloadingReports] = useState<Set<string>>(new Set())
  const [showFilterSidebar, setShowFilterSidebar] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    species: '',
    veterinarian: ''
  })
  
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Debounce para la búsqueda (500ms de delay)
  const debouncedSearchInput = useDebounce(searchInput, 1000)
  
  // Efecto para cargar reportes cuando cambien los filtros
  useEffect(() => {
    loadReports()
  }, [activeFilters])

  // Efecto para sincronizar el input de búsqueda con los filtros activos
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      search: debouncedSearchInput
    }))
  }, [debouncedSearchInput])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await ReportService.getAllReports({
        search: activeFilters.search || undefined,
        status: activeFilters.status || undefined,
        dateFrom: activeFilters.dateFrom || undefined,
        dateTo: activeFilters.dateTo || undefined,
        species: activeFilters.species || undefined,
        veterinarian: activeFilters.veterinarian || undefined,
        page: 1,
        limit: 20
      })
      
      if (response.success && response.data) {
        setReports(response.data.data)
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para aplicar filtros desde el sidebar
  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  // Función para eliminar reporte con confirmación mejorada
  const deleteReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    const reportName = report?.filename || 'este reporte'
    
    // Confirmación más elegante y específica
    const confirm = window.confirm(
      `¿Estás seguro de que quieres eliminar "${reportName}"?\n\n` +
      `Esta acción no se puede deshacer y se perderán todos los datos del reporte.`
    )
    
    if (!confirm) return

    try {
      setDeletingReports(prev => new Set(prev).add(reportId))
      
      const response = await ReportService.deleteReport(reportId)
      
      if (response.success && response.data?.id) {
        // Optimistic update: remover del estado sin recargar
        setReports(prev => prev.filter(report => report.id !== reportId))
        toast({
          title: "Reporte eliminado",
          description: `"${reportName}" ha sido eliminado correctamente.`,
        })
      } else {
        // Si falla, recargar todos los reportes
        await loadReports()
        toast({
          title: "Error al eliminar",
          description: `No se pudo eliminar "${reportName}". Inténtalo de nuevo.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error al eliminar reporte:', error)
      // En caso de error, recargar todos los reportes
      await loadReports()
      toast({
        title: "Error al eliminar",
        description: `Ocurrió un error inesperado al eliminar "${reportName}".`,
        variant: "destructive",
      })
    } finally {
      setDeletingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const processReport = async (reportId: string) => {
    try {
      setProcessingReports(prev => new Set(prev).add(reportId))
      
      await UploadService.processFile(reportId)
      
      // Recargar reportes después del procesamiento
      await loadReports()
      
      toast({
        title: "Procesamiento completado",
        description: "El reporte se ha procesado correctamente con IA.",
      })
      
      setProcessingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    } catch (error) {
      console.error('Error al procesar reporte:', error)
      toast({
        title: "Error en el procesamiento",
        description: "No se pudo procesar el reporte. Inténtalo de nuevo.",
        variant: "destructive",
      })
      setProcessingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: ProcessingStatus) => {
    const statusConfig = {
      PENDING: { color: 'bg-gray-100 text-gray-800', text: 'Pendiente' },
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

  const viewReport = async (reportId: string) => {
    navigate(`/reports/${reportId}`)
  }
  const editReport = async (reportId: string) => {
    navigate(`/reports/${reportId}/edit`)
  }

  const downloadReport = async (reportId: string) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(reportId))
      
      const response = await ReportService.downloadReport(reportId)
      
      if (response.ok) {
        // Obtener el nombre del archivo del reporte actual en el estado
        const currentReport = reports.find(report => report.id === reportId)
        const filename = currentReport?.filename || `reporte-${reportId}`
        
        // Asegurar que tenga la extensión .pdf
        const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
        
        // Si es una redirección (Cloudinary), descargar el archivo con nombre correcto
        if (response.redirected) {
          // Descargar desde la URL de Cloudinary
          const cloudinaryResponse = await fetch(response.url)
          const blob = await cloudinaryResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = pdfFilename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          // Si es un archivo directo, descargarlo
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = pdfFilename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
        
        toast({
          title: "Descarga completada",
          description: `El reporte original ${pdfFilename} se ha descargado correctamente.`,
        })
      } else {
        console.error('Error al descargar archivo:', response.statusText)
        toast({
          title: "Error en la descarga",
          description: "No se pudo descargar el reporte original. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error al descargar reporte:', error)
      toast({
        title: "Error en la descarga",
        description: "Ocurrió un error inesperado al descargar el reporte original.",
        variant: "destructive",
      })
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev)
        newSet.delete(reportId)
        return newSet
      })
    }
  }

  const handleClearFilters = () => {
    setActiveFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      species: '',
      veterinarian: ''
    });
    setSearchInput('');
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
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilterSidebar(true)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros Avanzados</span>
              {Object.values(activeFilters).some(value => value !== '') && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(activeFilters).filter(value => value !== '').length}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={loadReports}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
          
          {/* Filtros activos */}
          {Object.values(activeFilters).some(value => value !== '') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={ handleClearFilters }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar todo
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeFilters.search && (
                  <Badge variant="secondary" className="text-xs">
                    Búsqueda: {activeFilters.search}
                  </Badge>
                )}
                {activeFilters.status && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {activeFilters.status}
                  </Badge>
                )}
                {activeFilters.dateFrom && (
                  <Badge variant="secondary" className="text-xs">
                    Desde: {activeFilters.dateFrom}
                  </Badge>
                )}
                {activeFilters.dateTo && (
                  <Badge variant="secondary" className="text-xs">
                    Hasta: {activeFilters.dateTo}
                  </Badge>
                )}
                {activeFilters.species && (
                  <Badge variant="secondary" className="text-xs">
                    Especie: {activeFilters.species}
                  </Badge>
                )}
                {activeFilters.veterinarian && (
                  <Badge variant="secondary" className="text-xs">
                    Veterinario: {activeFilters.veterinarian}
                  </Badge>
                )}
              </div>
            </div>
          )}
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
                      {report.study?.date && (
                      <p><strong>Fecha de estudio:</strong> {new Date(report.study?.date).toLocaleDateString('es-ES')}</p>
                      )}
                      <p><strong>Fecha de subida:</strong> {new Date(report.createdAt).toLocaleDateString('es-ES')}</p>
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
                    {(report.status === 'PENDING' || report.status === 'ERROR') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => processReport(report.id)}
                        disabled={processingReports.has(report.id)}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer"
                        title="Re-procesar reporte con IA"
                      >
                        {processingReports.has(report.id) ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button 
                      onClick={() => downloadReport(report.id)} 
                      variant="outline" 
                      size="sm"
                      disabled={downloadingReports.has(report.id)}
                      className="text-green-600 hover:text-green-700 disabled:opacity-50"
                      title={downloadingReports.has(report.id) ? "Descargando reporte original..." : "Descargar reporte original (PDF)"}
                    >
                      {downloadingReports.has(report.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button onClick={() => viewReport(report.id)} variant="outline" size="sm" title="Ver reporte">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => editReport(report.id)} variant="outline" size="sm" title="Editar reporte">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => deleteReport(report.id)} 
                      variant="outline" 
                      size="sm" 
                      disabled={deletingReports.has(report.id)}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title={deletingReports.has(report.id) ? "Eliminando..." : "Eliminar reporte permanentemente"}
                    >
                      {deletingReports.has(report.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilterSidebar}
        onClose={() => setShowFilterSidebar(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </div>
  )
}
