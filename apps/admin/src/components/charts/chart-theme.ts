import { brandScale, chartPalette, semanticColors } from '@shalgam/tokens'

import type { Theme } from '../../app/store/ui-store'

/**
 * Chart chrome and series colours, all as CSS custom properties from the
 * design tokens so charts follow the active theme. The categorical palette
 * was run through the dataviz validator: slots 1–2 are the only pair used
 * adjacently (customer trend); single-series charts always take slot 1.
 */
export const chartTheme = {
  grid: semanticColors.border,
  axis: semanticColors.textMuted,
  surface: semanticColors.surface,
  cursor: semanticColors.borderStrong,
  tickFontSize: 11,
} as const

export const seriesColors = {
  primary: chartPalette[0],
  secondary: chartPalette[1],
  /** De-emphasised context series. */
  muted: semanticColors.textSubtle,
} as const

/** Reserved status colours: only for series that mean good / warning / bad. */
export const statusColors = {
  good: semanticColors.success,
  warning: semanticColors.warning,
  bad: semanticColors.danger,
} as const

/**
 * Ordinal ramp for the fulfilment stages (placed → delivered). Validated with
 * `--ordinal` for both surfaces; dark mode takes its own, lighter steps.
 */
export function orderStageRamp(theme: Theme): readonly [string, string, string, string, string] {
  return theme === 'dark'
    ? [brandScale[300], brandScale[500], brandScale[600], brandScale[700], brandScale[800]]
    : [brandScale[600], brandScale[700], brandScale[800], brandScale[900], brandScale[950]]
}

export const axisTick = { fontSize: chartTheme.tickFontSize, fill: chartTheme.axis } as const
