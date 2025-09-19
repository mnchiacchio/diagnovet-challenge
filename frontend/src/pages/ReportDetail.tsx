import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReportService } from '@/services/ReportService'

export function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadReport(id)
    }
  }, [id])

  const loadReport = async (reportId: string) => {
    try {
      setLoading(true)
      const response = await ReportService.getReportById(reportId)
      
      if (response.success && response.data) {
        setReport(response.data)
      }
    } catch (error) {
      console.error('Error al cargar el reporte:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', text: 'Procesando' },
      COMPLETED: { color: 'bg-green-100 text-green-800', text: 'Completado' },
      ERROR: { color: 'bg-red-100 text-red-800', text: 'Error' },
      NEEDS_REVIEW: { color: 'bg-orange-100 text-orange-800', text: 'Necesita Revisión' }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
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

  if (!report) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reporte no encontrado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          El reporte que buscas no existe o ha sido eliminado.
        </p>
        <Button 
          onClick={() => navigate('/reports')}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Reportes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.filename}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge(report.status)}
              {report.confidence && (
                <Badge variant="outline">
                  Confianza: {report.confidence}%
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nombre
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Especie
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.species || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Raza
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.breed || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Edad
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.age || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Peso
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.weight || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Propietario
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.patient?.owner || 'No especificado'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información del Veterinario */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Veterinario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Nombre
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.veterinarian?.name || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Matrícula
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.veterinarian?.license || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Título
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.veterinarian?.title || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clínica
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.veterinarian?.clinic || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Contacto
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.veterinarian?.contact || 'No especificado'}
              </p>
            </div>
            {report.veterinarian?.referredBy && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Derivado por
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {report.veterinarian.referredBy}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información del Estudio */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tipo
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.type || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Fecha
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.date ? new Date(report.study.date).toLocaleDateString('es-ES') : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Técnica
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.technique || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Región Corporal
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.bodyRegion || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Incidencias
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.incidences?.join(', ') || 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Equipamiento
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {report.study?.equipment || 'No especificado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Clínico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hallazgos */}
        {report.findings && (
          <Card>
            <CardHeader>
              <CardTitle>Hallazgos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {report.findings}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Diagnóstico */}
        {report.diagnosis && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {report.diagnosis}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Diagnósticos Diferenciales */}
        {report.differentials && report.differentials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnósticos Diferenciales</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.differentials.map((diff: string, index: number) => (
                  <li key={index} className="text-sm text-gray-900 dark:text-white">
                    {index + 1}. {diff}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recomendaciones */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-900 dark:text-white">
                    {index + 1}. {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Texto Extraído */}
      {report.extractedText && (
        <Card>
          <CardHeader>
            <CardTitle>Texto Extraído</CardTitle>
            <CardDescription>
              Texto completo extraído del documento mediante OCR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {report.extractedText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
