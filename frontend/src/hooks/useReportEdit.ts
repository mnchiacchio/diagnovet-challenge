import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'

// Services and Types
import { ReportService } from '@/services/ReportService'
import { UpdateReportSchema } from '@shared/validators/reportValidators'
import type { VeterinaryReportWithTimestamps } from '@shared/types/VeterinaryReport'

// Esquema de validación para el formulario de edición
const EditReportFormSchema = UpdateReportSchema.extend({
  extractedText: z.string().optional(),
})

export type EditReportFormData = z.infer<typeof EditReportFormSchema>

/**
 * Hook personalizado para manejar la lógica de edición de reportes
 * Principio de Responsabilidad Única: Solo maneja la lógica de estado y API
 */
export function useReportEdit(reportId: string) {
  const { toast } = useToast()
  
  // Estados
  const [report, setReport] = useState<VeterinaryReportWithTimestamps | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Formulario
  const form = useForm<EditReportFormData>({
    resolver: zodResolver(EditReportFormSchema),
    mode: 'onChange'
  })

  // Cargar reporte
  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await ReportService.getReportById(reportId)
      
      if (response.success && response.data) {
        const reportData = response.data
        setReport(reportData)
        
        // Resetear formulario con datos
        form.reset({
          filename: reportData.filename,
          findings: reportData.findings || '',
          diagnosis: reportData.diagnosis || '',
          differentials: reportData.differentials || [],
          recommendations: reportData.recommendations || [],
          measurements: reportData.measurements,
          images: reportData.images || [],
          extractedText: reportData.extractedText || '',
          status: reportData.status,
          confidence: reportData.confidence,
          patient: reportData.patient,
          veterinarian: reportData.veterinarian,
          study: {
            ...reportData.study,
            // Convertir fecha ISO a formato date (YYYY-MM-DD) para input type="date"
            date: reportData.study.date 
              ? new Date(reportData.study.date).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)
          }
        })
      }
    } catch (error) {
      console.error('Error al cargar el reporte:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Guardar cambios
  const saveReport = async (data: EditReportFormData) => {
    try {
      setSaving(true)
      
      const { extractedText, ...reportData } = data
      const response = await ReportService.updateReport(reportId, reportData)
      
      if (response.success) {
        toast({
          title: "Éxito",
          description: "Reporte actualizado correctamente",
        })
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Error al guardar:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el reporte",
        variant: "destructive"
      })
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  // Restaurar valores originales
  const resetToOriginal = () => {
    if (report) {
      form.reset({
        filename: report.filename,
        findings: report.findings || '',
        diagnosis: report.diagnosis || '',
        differentials: report.differentials || [],
        recommendations: report.recommendations || [],
        measurements: report.measurements,
        images: report.images || [],
        extractedText: report.extractedText || '',
        status: report.status,
        confidence: report.confidence,
        patient: report.patient,
        veterinarian: report.veterinarian,
        study: {
          ...report.study,
          // Convertir fecha ISO a formato date (YYYY-MM-DD) para input type="date"
          date: report.study.date 
            ? new Date(report.study.date).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        }
      })
    }
  }

  // Cargar reporte al montar
  useEffect(() => {
    if (reportId) {
      loadReport()
    }
  }, [reportId])

  return {
    // Estados
    report,
    loading,
    saving,
    hasChanges: form.formState.isDirty,
    
    // Formulario
    form,
    
    // Acciones
    saveReport,
    resetToOriginal,
    loadReport
  }
}
