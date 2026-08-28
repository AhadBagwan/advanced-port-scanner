import apiClient from './api'
import type {
  Scan,
  ScanCreateRequest,
  ScanResult,
  ScanComparisonData,
  PaginatedResponse,
  APIResponse,
} from '@/types'

export const scanService = {
  async createScan(params: ScanCreateRequest): Promise<Scan> {
    const response = await apiClient.post<Scan>('/scans', params)
    return response.data
  },

  async listScans(
    skip: number = 0,
    limit: number = 50,
    filterStatus?: string
  ): Promise<PaginatedResponse<Scan>> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(filterStatus && { filter_status: filterStatus }),
    })

    const response = await apiClient.get<APIResponse<PaginatedResponse<Scan>>>(
      `/scans?${params.toString()}`
    )
    return response.data.data
  },

  async getScan(id: number): Promise<Scan> {
    const response = await apiClient.get<APIResponse<Scan>>(`/scans/${id}`)
    return response.data.data
  },

  async getScanResults(
    id: number,
    skip: number = 0,
    limit: number = 100,
    filterOpen: boolean = false
  ): Promise<PaginatedResponse<ScanResult>> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      filter_open: filterOpen.toString(),
    })

    const response = await apiClient.get<APIResponse<PaginatedResponse<ScanResult>>>(
      `/scans/${id}/results?${params.toString()}`
    )
    return response.data.data
  },

  async getScanStatus(id: number) {
    const response = await apiClient.get<APIResponse<any>>(
      `/scans/${id}/status`
    )
    return response.data.data
  },

  async updateScan(
    id: number,
    updates: { notes?: string; tags?: string[] }
  ): Promise<Scan> {
    const response = await apiClient.put<APIResponse<Scan>>(
      `/scans/${id}`,
      updates
    )
    return response.data.data
  },

  async deleteScan(id: number): Promise<void> {
    await apiClient.delete(`/scans/${id}`)
  },

  async exportScan(
    id: number,
    format: 'json' | 'csv' | 'xml' | 'pdf'
  ): Promise<any> {
    const response = await apiClient.post<APIResponse<any>>(
      `/scans/${id}/export?format=${format}`
    )
    return response.data.data
  },

  async compareScans(
    scan1Id: number,
    scan2Id: number
  ): Promise<ScanComparisonData> {
    const response = await apiClient.get<APIResponse<ScanComparisonData>>(
      `/scans/compare?scan_id1=${scan1Id}&scan_id2=${scan2Id}`
    )
    return response.data.data
  },
}
