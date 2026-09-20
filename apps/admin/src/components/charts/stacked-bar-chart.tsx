import { formatDate } from '@shalgam/utils'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartTheme } from './chart-theme'
import { ChartTooltip } from './chart-tooltip'

export interface StackedSeries {
  key: string
  label: string
  color: string
}

export interface StackedBarChartProps {
  data: readonly object[]
  xKey: string
  series: StackedSeries[]
  formatValue: (value: number) => string
  formatX?: (value: string) => string
}

/** Part-to-whole over time. Segments are separated by a 2px surface gap, never a border. */
export function StackedBarChart({
  data,
  xKey,
  series,
  formatValue,
  formatX,
}: StackedBarChartProps) {
  const labelFormatter = formatX ?? ((value: string) => formatDate(value, 'short'))
  const seriesLabels = Object.fromEntries(series.map((item) => [item.key, item.label]))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={[...data]}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid vertical={false} stroke={chartTheme.grid} strokeWidth={1} />
        <XAxis
          dataKey={xKey}
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
          width={40}
          allowDecimals={false}
          tickFormatter={(value: number) => formatValue(value)}
        />
        <Tooltip
          cursor={{ fill: chartTheme.grid, fillOpacity: 0.5 }}
          isAnimationActive={false}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label}
              formatLabel={(label) => labelFormatter(String(label))}
              formatValue={(value) => formatValue(value)}
              seriesLabels={seriesLabels}
            />
          )}
        />
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stackId="stack"
            fill={item.color}
            stroke={chartTheme.surface}
            strokeWidth={1}
            maxBarSize={24}
            radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
