import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EditReportFormData } from '@/hooks/useReportEdit'

interface VeterinarianFormProps {
  form: UseFormReturn<EditReportFormData>
}

/**
 * Componente especializado para la información del veterinario
 * Principio de Responsabilidad Única: Solo maneja datos del veterinario
 */
export function VeterinarianForm({ form }: VeterinarianFormProps) {
  const { register, formState: { errors } } = form

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Veterinario</CardTitle>
        <CardDescription>
          Datos del profesional que realizó el estudio
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="veterinarian.name">Nombre del Veterinario *</Label>
          <Input
            id="veterinarian.name"
            {...register('veterinarian.name')}
            placeholder="Dr. Juan Pérez"
          />
          {errors.veterinarian?.name && (
            <p className="text-sm text-red-600">{errors.veterinarian.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinarian.license">Matrícula</Label>
          <Input
            id="veterinarian.license"
            {...register('veterinarian.license')}
            placeholder="Ej: MV-12345"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinarian.title">Título</Label>
          <Input
            id="veterinarian.title"
            {...register('veterinarian.title')}
            placeholder="Ej: Especialista en Radiología"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinarian.clinic">Clínica</Label>
          <Input
            id="veterinarian.clinic"
            {...register('veterinarian.clinic')}
            placeholder="Nombre de la clínica"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinarian.contact">Contacto</Label>
          <Input
            id="veterinarian.contact"
            {...register('veterinarian.contact')}
            placeholder="Teléfono o email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="veterinarian.referredBy">Referido por</Label>
          <Input
            id="veterinarian.referredBy"
            {...register('veterinarian.referredBy')}
            placeholder="Veterinario que refiere"
          />
        </div>
      </CardContent>
    </Card>
  )
}
