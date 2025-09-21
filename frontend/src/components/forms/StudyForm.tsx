import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { EditReportFormData } from '@/hooks/useReportEdit'

interface StudyFormProps {
  form: UseFormReturn<EditReportFormData>
}

/**
 * Componente especializado para la información del estudio
 * Principio de Responsabilidad Única: Solo maneja datos del estudio
 */
export function StudyForm({ form }: StudyFormProps) {
  const { register, control, formState: { errors } } = form

  // Field array para incidencias
  const { fields: incidenceFields, append: appendIncidence, remove: removeIncidence } = useFieldArray({
    control,
    name: 'study.incidences'
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Estudio</CardTitle>
        <CardDescription>
          Detalles del estudio médico realizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="study.type">Tipo de Estudio *</Label>
            <Input
              id="study.type"
              {...register('study.type')}
              placeholder="Ej: Radiografía, Ecografía, etc."
            />
            {errors.study?.type && (
              <p className="text-sm text-red-600">{errors.study.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="study.date">Fecha del Estudio *</Label>
            <Input
              id="study.date"
              type="date"
              {...register('study.date')}
            />
            {errors.study?.date && (
              <p className="text-sm text-red-600">{errors.study.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="study.technique">Técnica</Label>
            <Input
              id="study.technique"
              {...register('study.technique')}
              placeholder="Ej: Proyección lateral, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="study.bodyRegion">Región Corporal</Label>
            <Input
              id="study.bodyRegion"
              {...register('study.bodyRegion')}
              placeholder="Ej: Tórax, Abdomen, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="study.equipment">Equipamiento</Label>
            <Input
              id="study.equipment"
              {...register('study.equipment')}
              placeholder="Marca y modelo del equipo"
            />
          </div>
        </div>

        {/* Incidencias */}
        <div className="space-y-2">
          <Label>Incidencias</Label>
          {incidenceFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                {...register(`study.incidences.${index}`)}
                placeholder="Descripción de la incidencia"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeIncidence(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIncidence('')}
          >
            Agregar Incidencia
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
