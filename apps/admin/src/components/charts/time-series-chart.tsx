import { formatDate } from '@shalgam/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { axisTick, chartTheme, seriesColors } from './chart-theme'
import { ChartTooltip } from './chart-tooltip'

export interface TimeSeriesPointData {
  date: string
  value: number
}

export interface TimeSeriesChartProps {
  data: TimeSeriesPointData[]
  /** Series name for the tooltip. */
  name: string
  kind?: 'area' | 'line'
  color?: string
  formatValue: (value: number) => string
  formatAxis?: (value: number) => string
  formatDateLabel?: (date: string) => string
}

/** Single-series trend over time. One measure per chart — never a second axis. */
export function TimeSeriesChart({
  data,
  name,
  kind = 'area',
  color = seriesColors.primary,
  formatValue,
  formatAxis,
  formatDateLabel,
}: TimeSeriesChartProps) {
  const labelFormatter = formatDateLabel ?? ((date: string) => formatDate(date, 'short'))
  const axisFormatter = formatAxis ?? formatValue
  const shared = (
    <>
      <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeWidth={1} />
      <XAxis
        dataKey="date"
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        minTickGap={28}
        tickFormatter={(value: string) => labelFormatter(value)}
      />
      <YAxis
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        width={48}
        tickFormatter={(value: number) => axisFormatter(value)}
      />
      <Tooltip
        cursor={{ stroke: chartTheme.cursor, strokeWidth: 1 }}
        isAnimationActive={false}
        content={(props) => (
          <ChartTooltip
            active={props.active}
            payload={props.payload}
            label={props.label}
            formatLabel={(label) => labelFormatter(String(label))}
            formatValue={(value) => formatValue(value)}
            seriesLabels={{ value: name }}
          />
        )}
      />
    </>
  )
  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === 'area' ? (
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          {shared}
          <Area
            type="monotone"
            dataKey="value"
            name={name}
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.1}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface, fill: color }}
            isAnimationActive={false}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          {shared}
          <Line
            type="monotone"
            dataKey="value"
            name={name}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: chartTheme.surface, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  )
}
