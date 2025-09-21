import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { EditReportFormData } from '@/hooks/useReportEdit'

interface ClinicalFormProps {
  form: UseFormReturn<EditReportFormData>
}

/**
 * Componente especializado para la información clínica
 * Principio de Responsabilidad Única: Solo maneja datos clínicos
 */
export function ClinicalForm({ form }: ClinicalFormProps) {
  const { register, control } = form

  // Field arrays para arrays dinámicos
  const { fields: differentialFields, append: appendDifferential, remove: removeDifferential } = useFieldArray({
    control,
    name: 'differentials'
  })

  const { fields: recommendationFields, append: appendRecommendation, remove: removeRecommendation } = useFieldArray({
    control,
    name: 'recommendations'
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Clínica</CardTitle>
        <CardDescription>
          Hallazgos, diagnóstico y recomendaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="findings">Hallazgos</Label>
          <Textarea
            id="findings"
            {...register('findings')}
            placeholder="Describe los hallazgos del estudio..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnóstico</Label>
          <Textarea
            id="diagnosis"
            {...register('diagnosis')}
            placeholder="Diagnóstico principal..."
            rows={3}
          />
        </div>

        {/* Diagnósticos Diferenciales */}
        <div className="space-y-2">
          <Label>Diagnósticos Diferenciales</Label>
          {differentialFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                {...register(`differentials.${index}`)}
                placeholder="Diagnóstico diferencial"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeDifferential(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDifferential('')}
          >
            Agregar Diagnóstico Diferencial
          </Button>
        </div>

        {/* Recomendaciones */}
        <div className="space-y-2">
          <Label>Recomendaciones</Label>
          {recommendationFields.map((field, index) => (
            <div key={field.id} className="flex space-x-2">
              <Input
                {...register(`recommendations.${index}`)}
                placeholder="Recomendación o tratamiento"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRecommendation(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendRecommendation('')}
          >
            Agregar Recomendación
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
