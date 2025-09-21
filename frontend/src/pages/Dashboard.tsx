import { useState, useEffect } from 'react'
import { FileText, Upload, CheckCircle, AlertCircle, Clock, Calendar, User, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReportService } from '@/services/ReportService'
import { ReportStats, VeterinaryReportWithTimestamps } from '@shared/types/VeterinaryReport'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [recentReports, setRecentReports] = useState<VeterinaryReportWithTimestamps[]>([])
  const [loading, setLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(true)
  const navigate = useNavigate()
  
  useEffect(() => {
    loadStats()
    loadRecentReports()
  }, [])

  const loadStats = async () => {
    try {
      const data = await ReportService.getStats()
      setStats(data || null)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentReports = async () => {
    try {
      setReportsLoading(true)
      // Obtener los primeros 3 reportes (más recientes)
      const response = await ReportService.getAllReports({ page: 1, limit: 3 })
      
      if (response.success && response.data) {
        setRecentReports(response.data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar reportes recientes:', error)
      setRecentReports([])
    } finally {
      setReportsLoading(false)
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para obtener configuración del estado
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      PROCESSING: { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: 'Procesando',
        icon: <Clock className="h-3 w-3" />
      },
      COMPLETED: { 
        color: 'bg-green-100 text-green-800', 
        text: 'Completado',
        icon: <CheckCircle className="h-3 w-3" />
      },
      ERROR: { 
        color: 'bg-red-100 text-red-800', 
        text: 'Error',
        icon: <AlertCircle className="h-3 w-3" />
      },
      NEEDS_REVIEW: { 
        color: 'bg-orange-100 text-orange-800', 
        text: 'Necesita Revisión',
        icon: <AlertCircle className="h-3 w-3" />
      }
    }
    return configs[status] || configs.PROCESSING
  }

  // Función para navegar a un reporte
  const handleViewReport = (reportId: string) => {
    navigate(`/reports/${reportId}`)
  }

  const statCards = [
    {
      title: 'Total de Reportes',
      value: stats?.totalReports || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Procesados',
      value: stats?.completedReports || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'En Proceso',
      value: stats?.processingReports || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Necesitan Revisión',
      value: stats?.needsReviewReports || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Con Errores',
      value: stats?.errorReports || 0,
      icon: AlertCircle,
      color: 'text-red-600', 
      bgColor: 'bg-red-100'
    }
  ]

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Resumen del sistema de gestión de reportes veterinarios
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede a las funciones más utilizadas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/upload')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Nuevos Reportes
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/reports')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver Todos los Reportes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>
              Información sobre el rendimiento del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tasa de Completado
              </span>
              <Badge variant="secondary">
                {stats?.completionRate?.toFixed(1) || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total de Pacientes
              </span>
              <Badge variant="outline">
                {stats?.totalPatients || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Veterinarios Registrados
              </span>
              <Badge variant="outline">
                {stats?.totalVeterinarians || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reportes recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>
                Los últimos reportes procesados en el sistema
              </CardDescription>
            </div>
            {recentReports.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/reports')}
              >
                Ver todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => {
                const statusConfig = getStatusConfig(report.status)
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => handleViewReport(report.id!)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {report.patient?.name || 'Sin nombre'}
                          </h4>
                          <Badge className={`${statusConfig.color} flex items-center space-x-1`}>
                            {statusConfig.icon}
                            <span>{statusConfig.text}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{report.veterinarian?.name || 'Sin veterinario'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>{report.filename}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewReport(report.id!)
                      }}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay reportes recientes para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
