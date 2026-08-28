import apiClient from './api'
import type {
  SummaryStats,
  TrendData,
  TopTarget,
  APIResponse,
} from '@/types'

export const statsService = {
  async getSummary(): Promise<SummaryStats> {
    const response = await apiClient.get<APIResponse<SummaryStats>>(
      '/stats/summary'
    )
    return response.data.data
  },

  async getTrends(days: number = 30): Promise<TrendData[]> {
    const response = await apiClient.get<APIResponse<{ trend: TrendData[] }>>(
      `/stats/trends?days=${days}`
    )
    return response.data.data.trend
  },

  async getTopTargets(limit: number = 10): Promise<TopTarget[]> {
    const response = await apiClient.get<APIResponse<{ targets: TopTarget[] }>>(
      `/stats/top-targets?limit=${limit}`
    )
    return response.data.data.targets
  },

  async getPortDistribution() {
    const response = await apiClient.get(`/stats/port-distribution`)
    return response.data.data
  },

  async getServiceStats() {
    const response = await apiClient.get(`/stats/service-stats`)
    return response.data.data
  },
}
