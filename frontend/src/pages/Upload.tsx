import { useState, useCallback, useEffect } from 'react'
import { Upload as UploadIcon, FileText, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { UploadService } from '@/services/UploadService'
import { normalizeFileName } from '@/utils/fileUtils'

interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  result?: any
  reportId?: string
  processingStatus?: string
}

export function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  // Monitorear estado de procesamiento
  useEffect(() => {
    const processingFiles = files.filter(f => f.status === 'processing' && f.reportId)
    
    if (processingFiles.length === 0) return

    const interval = setInterval(async () => {
      for (const file of processingFiles) {
        if (file.reportId) {
          try {
            const status = await UploadService.getProcessingStatus(file.reportId)
            
            setFiles(prev => prev.map(f => 
              f.id === file.id 
                ? { 
                    ...f, 
                    processingStatus: status.status,
                    status: status.status === 'COMPLETED' ? 'completed' : 
                            status.status === 'ERROR' ? 'error' : 'processing',
                    progress: status.status === 'COMPLETED' ? 100 : 
                              status.status === 'ERROR' ? 100 : 75,
                    error: status.status === 'ERROR' ? 'Error en el procesamiento' : f.error
                  }
                : f
            ))

            // Mostrar notificación cuando se complete
            if (status.status === 'COMPLETED') {
              console.log(`✅ Procesamiento completado para ${file.file.name}`)
            }
          } catch (error) {
            console.error('Error al obtener estado:', error)
          }
        }
      }
    }, 2000) // Verificar cada 2 segundos

    return () => clearInterval(interval)
  }, [files])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }, [])

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }))
    
    setFiles(prev => [...prev, ...uploadFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const retryProcessing = async (fileId: string, reportId: string) => {
    try {
      // Actualizar estado a procesando
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'processing', error: undefined }
          : f
      ))

      // Reintentar procesamiento
      await UploadService.processFile(reportId)
    } catch (error) {
      console.error('Error al reintentar procesamiento:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: 'Error al reintentar procesamiento' }
          : f
      ))
    }
  }

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    if (pendingFiles.length === 0) return

    try {
      // Actualizar todos los archivos a "subiendo"
      setFiles(prev => prev.map(f => 
        pendingFiles.some(pf => pf.id === f.id)
          ? { ...f, status: 'uploading', progress: 0 }
          : f
      ))

      // Crear archivos con nombres normalizados
      const normalizedFiles = pendingFiles.map(f => {
        const normalizedName = normalizeFileName(f.file.name)
        // Crear un nuevo File con el nombre normalizado
        return new File([f.file], normalizedName, { type: f.file.type })
      })

      // Subir archivos usando el servicio real
      const uploadResults = await UploadService.uploadFiles(normalizedFiles)

      // Actualizar estado de archivos con resultados reales
      setFiles(prev => prev.map(f => {
        const pendingFile = pendingFiles.find(pf => pf.id === f.id)
        if (pendingFile) {
          // Buscar resultado comparando nombres normalizados
          const normalizedOriginalName = normalizeFileName(pendingFile.file.name)
          const result = uploadResults.find(r => 
            r.filename === normalizedOriginalName ||
            r.originalFilename === normalizedOriginalName
          )
          return {
            ...f,
            status: result ? 'processing' : 'error', // Cambiar a 'processing' en lugar de 'completed'
            progress: result ? 50 : 100, // 50% después de subir, 100% cuando se complete el procesamiento
            result: result || null,
            reportId: result?.id,
            error: result ? undefined : 'Error al subir el archivo'
          }
        }
        return f
      }))

    } catch (error) {
      console.error('Error al subir archivos:', error)
      
      // Marcar todos los archivos pendientes como error
      setFiles(prev => prev.map(f => 
        pendingFiles.some(pf => pf.id === f.id)
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Error al subir el archivo'
            }
          : f
      ))
    }
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'uploading':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-veterinary-primary"></div>
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status: UploadFile['status'], processingStatus?: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'uploading':
        return 'Subiendo...'
      case 'processing':
        return processingStatus === 'PROCESSING' ? 'Procesando OCR...' : 
               processingStatus === 'NEEDS_REVIEW' ? 'Revisión necesaria' :
               'Procesando...'
      case 'completed':
        return 'Completado'
      case 'error':
        return 'Error'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Subir Archivos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sube reportes veterinarios para procesamiento automático
        </p>
      </div>

      {/* Zona de subida */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivos</CardTitle>
          <CardDescription>
            Arrastra y suelta archivos PDF o imágenes, o haz clic para seleccionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-veterinary-primary bg-veterinary-primary/5'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Arrastra archivos aquí o{' '}
                  <span className="text-veterinary-primary hover:text-veterinary-secondary">
                    haz clic para seleccionar
                  </span>
                </span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf"
                  className="sr-only"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PDF de hasta 10MB cada uno
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Archivos Seleccionados ({files.length})
                </h3>
                <Button 
                  onClick={uploadFiles}
                  disabled={files.every(f => f.status !== 'pending')}
                  className="veterinary-button"
                >
                  ✨Procesar Archivos
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {getStatusIcon(file.status)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {file.progress}% completado
                          </p>
                          {file.status === 'processing' && file.processingStatus && (
                            <p className="text-xs text-blue-500 mt-1">
                              Estado: {file.processingStatus}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">
                          {file.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getStatusText(file.status, file.processingStatus)}
                      </span>
                      {file.status === 'error' && file.reportId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryProcessing(file.id, file.reportId!)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
