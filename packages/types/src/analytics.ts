import type { DateRangeParams, ISODateString, Rupees } from './common'
import type { OrderStatus } from './order'

export interface Kpi {
  value: number
  previous: number
  /** Percentage change versus the previous period; `null` when the previous period is zero. */
  changePercent: number | null
}

export interface AnalyticsOverview {
  range: { from: ISODateString; to: ISODateString }
  kpis: {
    totalOrders: Kpi
    revenue: Kpi
    averageOrderValue: Kpi
    activeCustomers: Kpi
    cancellationRate: Kpi
    deliverySuccessRate: Kpi
  }
}

export interface TimeSeriesPoint {
  date: ISODateString
  orders: number
  revenue: Rupees
}

export interface CategorySales {
  categoryId: string
  categoryName: string
  revenue: Rupees
  orders: number
  share: number
}

export interface TopProduct {
  productId: string
  name: string
  imageUrl: string
  unit: string
  unitsSold: number
  revenue: Rupees
}

export interface StatusDistributionPoint {
  status: OrderStatus
  count: number
}

export interface DeliveryPerformancePoint {
  date: ISODateString
  onTime: number
  delayed: number
  failed: number
  averageMinutes: number
}

export interface CustomerTrendPoint {
  date: ISODateString
  newCustomers: number
  returningCustomers: number
}

export interface CancellationReason {
  reason: string
  count: number
  share: number
}

export interface AnalyticsParams extends DateRangeParams {
  categoryId?: string
  productId?: string
  status?: OrderStatus[]
  granularity?: 'day' | 'week'
}

export interface AnalyticsSeries {
  timeSeries: TimeSeriesPoint[]
  salesByCategory: CategorySales[]
  topProducts: TopProduct[]
  statusDistribution: StatusDistributionPoint[]
  deliveryPerformance: DeliveryPerformancePoint[]
  customerTrend: CustomerTrendPoint[]
  cancellationReasons: CancellationReason[]
}
