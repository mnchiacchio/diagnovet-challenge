import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProcessingStatus } from '@/shared/types/VeterinaryReport'
import type { EditReportFormData } from '@/hooks/useReportEdit'

interface StatusFormProps {
  form: UseFormReturn<EditReportFormData>
}

/**
 * Componente especializado para el estado y confianza del reporte
 * Principio de Responsabilidad Única: Solo maneja estado y confianza
 */
export function StatusForm({ form }: StatusFormProps) {
  const { register, watch, setValue } = form
  
  const currentStatus = watch('status')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del Procesamiento</CardTitle>
        <CardDescription>
          Control del estado y confianza del reporte
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={currentStatus}
            onValueChange={(value: string) => setValue('status', value as ProcessingStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROCESSING">Procesando</SelectItem>
              <SelectItem value="COMPLETED">Completado</SelectItem>
              <SelectItem value="NEEDS_REVIEW">Necesita Revisión</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confidence">Confianza (%)</Label>
          <Input
            id="confidence"
            type="number"
            min="0"
            max="100"
            {...register('confidence', { valueAsNumber: true })}
            placeholder="0-100"
          />
        </div>
      </CardContent>
    </Card>
  )
}