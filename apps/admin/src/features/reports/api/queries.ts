import { analyticsQueries } from '@shalgam/query'
import type { ReportParams } from '@shalgam/types'
import { useQuery } from '@tanstack/react-query'

export function useReport(params: ReportParams) {
  return useQuery(analyticsQueries.report(params))
}
