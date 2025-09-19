import { API_BASE_URL, API_ENDPOINTS } from '@shared/constants/apiEndpoints'
import { ApiResponse, PaginatedResponse, ReportStats, SearchFilters } from '@shared/types/VeterinaryReport'

export class ReportService {
  private static baseUrl = API_BASE_URL

  // Obtener todos los reportes con filtros
  static async getAllReports(filters: SearchFilters = {}) {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.species) params.append('species', filters.species)
    if (filters.veterinarian) params.append('veterinarian', filters.veterinarian)

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error('Error al obtener los reportes')
    }

    return response.json() as Promise<ApiResponse<PaginatedResponse<any>>>
  }

  // Obtener un reporte por ID
  static async getReportById(id: string) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.BY_ID(id)}`)
    
    if (!response.ok) {
      throw new Error('Error al obtener el reporte')
    }

    return response.json() as Promise<ApiResponse<any>>
  }

  // Crear un nuevo reporte
  static async createReport(reportData: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    })

    if (!response.ok) {
      throw new Error('Error al crear el reporte')
    }

    return response.json() as Promise<ApiResponse<any>>
  }

  // Actualizar un reporte
  static async updateReport(id: string, reportData: any) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.BY_ID(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    })

    if (!response.ok) {
      throw new Error('Error al actualizar el reporte')
    }

    return response.json() as Promise<ApiResponse<any>>
  }

  // Eliminar un reporte
  static async deleteReport(id: string) {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.BY_ID(id)}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Error al eliminar el reporte')
    }

    return response.json() as Promise<ApiResponse<any>>
  }

  // Buscar reportes
  static async searchReports(query: string, filters: SearchFilters = {}) {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.SEARCH(query)}?${params}`)
    
    if (!response.ok) {
      throw new Error('Error al buscar reportes')
    }

    return response.json() as Promise<ApiResponse<PaginatedResponse<any>>>
  }

  // Obtener estadísticas
  static async getStats() {
    const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.REPORTS.STATS}`)
    
    if (!response.ok) {
      throw new Error('Error al obtener estadísticas')
    }

    const result = await response.json() as ApiResponse<ReportStats>
    return result.data
  }
}
