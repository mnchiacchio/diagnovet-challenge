import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OriginalTextFormProps {
  extractedText?: string
}

/**
 * Componente especializado para mostrar el texto original extraído
 * Principio de Responsabilidad Única: Solo maneja la visualización del texto original
 */
export function OriginalTextForm({ extractedText }: OriginalTextFormProps) {
  const [showOriginalText, setShowOriginalText] = useState(false)

  if (!extractedText) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Texto Original Extraído</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOriginalText(!showOriginalText)}
          >
            {showOriginalText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showOriginalText ? 'Ocultar' : 'Mostrar'}
          </Button>
        </CardTitle>
        <CardDescription>
          Texto extraído automáticamente del PDF original
        </CardDescription>
      </CardHeader>
      {showOriginalText && (
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {extractedText}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
