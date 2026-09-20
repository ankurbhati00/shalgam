import { analyticsQueries } from '@shalgam/query'
import type { AnalyticsParams } from '@shalgam/types'
import { useQuery } from '@tanstack/react-query'

export function useAnalyticsOverview(params: AnalyticsParams) {
  return useQuery(analyticsQueries.overview(params))
}

export function useAnalyticsSeries(params: AnalyticsParams) {
  return useQuery(analyticsQueries.series(params))
}
