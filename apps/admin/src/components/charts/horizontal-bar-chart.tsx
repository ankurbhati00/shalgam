import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { axisTick, chartTheme, seriesColors } from './chart-theme'
import { ChartTooltip } from './chart-tooltip'

export interface HorizontalBarDatum {
  label: string
  value: number
}

export interface HorizontalBarChartProps {
  data: HorizontalBarDatum[]
  name: string
  formatValue: (value: number) => string
  color?: string
  /** Width reserved for category labels. */
  labelWidth?: number
}

/** Ranked magnitudes: one hue for every bar (identity is the label, length is the value), value at the tip. */
export function HorizontalBarChart({
  data,
  name,
  formatValue,
  color = seriesColors.primary,
  labelWidth = 120,
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 56, bottom: 0, left: 4 }}
        barCategoryGap={6}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: chartTheme.grid, fillOpacity: 0.5 }}
          isAnimationActive={false}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              payload={props.payload}
              label={props.label}
              formatValue={(value) => formatValue(value)}
              seriesLabels={{ value: name }}
            />
          )}
        />
        <Bar
          dataKey="value"
          name={name}
          fill={color}
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="value"
            position="right"
            offset={6}
            fill={chartTheme.axis}
            fontSize={11}
            formatter={(value: unknown) => formatValue(Number(value))}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
