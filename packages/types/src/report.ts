import type { DateRangeParams, ISODateString, Rupees } from './common'

export type ReportType = 'sales' | 'orders' | 'inventory' | 'customers'

export interface ReportParams extends DateRangeParams {
  type: ReportType
  categoryId?: string
}

export interface ReportSummaryItem {
  label: string
  value: number
  format: 'number' | 'currency' | 'percent'
}

export interface ReportColumn {
  key: string
  label: string
  format: 'text' | 'number' | 'currency' | 'percent' | 'date'
  align?: 'start' | 'end'
}

export type ReportRow = Record<string, string | number | null>

export interface Report {
  type: ReportType
  title: string
  generatedAt: ISODateString
  range: { from: ISODateString; to: ISODateString }
  summary: ReportSummaryItem[]
  columns: ReportColumn[]
  rows: ReportRow[]
  totalRevenue?: Rupees
}
