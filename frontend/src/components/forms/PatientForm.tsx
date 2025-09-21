import { UseFormReturn } from 'react-hook-form'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EditReportFormData } from '@/hooks/useReportEdit'

interface PatientFormProps {
  form: UseFormReturn<EditReportFormData>
}

/**
 * Componente especializado para la información del paciente
 * Principio de Responsabilidad Única: Solo maneja datos del paciente
 */
export function PatientForm({ form }: PatientFormProps) {
  const { register, formState: { errors } } = form

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
          Información del Paciente
        </CardTitle>
        <CardDescription>
          Datos básicos del animal paciente
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient.name">Nombre del Paciente *</Label>
          <Input
            id="patient.name"
            {...register('patient.name')}
            placeholder="Ej: Max, Luna, etc."
          />
          {errors.patient?.name && (
            <p className="text-sm text-red-600">{errors.patient.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient.species">Especie *</Label>
          <Input
            id="patient.species"
            {...register('patient.species')}
            placeholder="Ej: Canino, Felino, etc."
          />
          {errors.patient?.species && (
            <p className="text-sm text-red-600">{errors.patient.species.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient.breed">Raza</Label>
          <Input
            id="patient.breed"
            {...register('patient.breed')}
            placeholder="Ej: Labrador, Persa, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient.age">Edad</Label>
          <Input
            id="patient.age"
            {...register('patient.age')}
            placeholder="Ej: 3 años, 6 meses, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient.weight">Peso</Label>
          <Input
            id="patient.weight"
            {...register('patient.weight')}
            placeholder="Ej: 25 kg, 3.5 kg, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patient.owner">Propietario *</Label>
          <Input
            id="patient.owner"
            {...register('patient.owner')}
            placeholder="Nombre del propietario"
          />
          {errors.patient?.owner && (
            <p className="text-sm text-red-600">{errors.patient.owner.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
