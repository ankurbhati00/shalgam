import type {
  AnalyticsOverview,
  AnalyticsParams,
  AnalyticsSeries,
  Report,
  ReportParams,
} from '@shalgam/types'

import type { ApiClient, RequestOptions } from '../http'

export function createAnalyticsService(client: ApiClient) {
  return {
    overview: (params: AnalyticsParams = {}, options?: RequestOptions) =>
      client.get<AnalyticsOverview>('/analytics/overview', { ...options, params: { ...params } }),

    series: (params: AnalyticsParams = {}, options?: RequestOptions) =>
      client.get<AnalyticsSeries>('/analytics/series', { ...options, params: { ...params } }),

    report: (params: ReportParams, options?: RequestOptions) =>
      client.get<Report>('/reports', { ...options, params: { ...params } }),
  }
}

export type AnalyticsService = ReturnType<typeof createAnalyticsService>
