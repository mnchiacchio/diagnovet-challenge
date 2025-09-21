import { Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormActionsProps {
  hasChanges: boolean
  saving: boolean
  onSave: () => void
  onReset: () => void
  onCancel: () => void
}

/**
 * Componente especializado para las acciones del formulario
 * Principio de Responsabilidad Única: Solo maneja las acciones del formulario
 */
export function FormActions({ 
  hasChanges, 
  saving, 
  onSave, 
  onReset, 
  onCancel 
}: FormActionsProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar
        </Button>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!hasChanges || saving}
          onClick={onSave}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
