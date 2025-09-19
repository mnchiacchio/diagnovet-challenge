import { API_BASE_URL, API_ENDPOINTS } from '@shared/constants/apiEndpoints'
import { ApiResponse, UploadResult, ProcessingResult } from '@shared/types/VeterinaryReport'

export class UploadService {
  private static baseUrl = API_BASE_URL

  // Subir archivos
  static async uploadFiles(files: File[]): Promise<UploadResult[]> {
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD.BASE}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Error al subir los archivos')
    }

    const result = await response.json() as ApiResponse<UploadResult[]>
    return result.data || []
  }

  // Procesar archivo con OCR
  static async processFile(reportId: string): Promise<ProcessingResult> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD.PROCESS(reportId)}`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Error al procesar el archivo')
    }

    const result = await response.json() as ApiResponse<ProcessingResult>
    return result.data || { success: false, error: 'Error desconocido' }
  }

  // Obtener estado de procesamiento
  static async getProcessingStatus(reportId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD.STATUS(reportId)}`)

    if (!response.ok) {
      throw new Error('Error al obtener el estado de procesamiento')
    }

    const result = await response.json() as ApiResponse<any>
    return result.data
  }
}
