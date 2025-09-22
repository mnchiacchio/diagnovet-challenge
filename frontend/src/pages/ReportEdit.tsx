
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Custom Hook
import { useReportEdit } from '@/hooks/useReportEdit'

// Form Components
import { PatientForm } from '@/components/forms/PatientForm'
import { VeterinarianForm } from '@/components/forms/VeterinarianForm'
import { StudyForm } from '@/components/forms/StudyForm'
import { ClinicalForm } from '@/components/forms/ClinicalForm'
import { StatusForm } from '@/components/forms/StatusForm'
import { OriginalTextForm } from '@/components/forms/OriginalTextForm'
import { FormActions } from '@/components/forms/FormActions'

import type { ProcessingStatus } from '@/shared/types/VeterinaryReport'

/**
 * Página principal de edición de reportes
 * Principio de Composición: Compone múltiples componentes especializados
 * Principio de Responsabilidad Única: Solo maneja la composición y navegación
 */
export function ReportEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Hook personalizado para manejar la lógica de edición
  const {
    report,
    loading,
    saving,
    hasChanges,
    form,
    saveReport,
    resetToOriginal
  } = useReportEdit(id || '')

  // Guardar cambios
  const handleSave = async () => {
    try {
      const data = form.getValues()
      const result = await saveReport(data)
      if (result?.success) {
        navigate(`/reports/${id}`)
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  // Cancelar edición
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('¿Estás seguro? Se perderán los cambios no guardados.')) {
        navigate(`/reports/${id}`)
      }
    } else {
      navigate(`/reports/${id}`)
    }
  }

  // Restaurar valores originales
  const handleReset = () => {
    if (confirm('¿Restaurar valores originales? Se perderán los cambios.')) {
      resetToOriginal()
    }
  }

  // Obtener configuración de estado
  const getStatusConfig = (status: ProcessingStatus) => {
    const configs: Record<ProcessingStatus, { color: string; text: string }> = {
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', text: 'Procesando' },
      COMPLETED: { color: 'bg-green-100 text-green-800', text: 'Completado' },
      ERROR: { color: 'bg-red-100 text-red-800', text: 'Error' },
      NEEDS_REVIEW: { color: 'bg-orange-100 text-orange-800', text: 'Necesita Revisión' }
    }
    return configs[status] || configs.PROCESSING
  }

  // Estados de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Estado de error
  if (!report) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se pudo cargar el reporte solicitado.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Reporte</h1>
            <p className="text-gray-600">{report.filename}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Cambios sin guardar
            </Badge>
          )}
          <Badge className={getStatusConfig(report.status).color}>
            {getStatusConfig(report.status).text}
          </Badge>
        </div>
      </div>

      {/* Formulario con composición de componentes */}
      <form className="space-y-6">
        <PatientForm form={form} />
        <VeterinarianForm form={form} />
        <StudyForm form={form} />
        <ClinicalForm form={form} />
        <StatusForm form={form} />
        <OriginalTextForm extractedText={report.extractedText} />
        
        <FormActions
          hasChanges={hasChanges}
          saving={saving}
          onSave={handleSave}
          onReset={handleReset}
          onCancel={handleCancel}
        />
      </form>
    </div>
  )
}