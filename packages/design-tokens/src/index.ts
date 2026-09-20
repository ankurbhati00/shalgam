/**
 * Shalgam design tokens as typed constants.
 *
 * The source of truth is `tokens.css`. These constants exist for the few places
 * that need token values in JavaScript (charts, canvas, inline SVG, media queries)
 * and always reference the CSS custom property so themes keep working.
 */

const cssVar = (name: string) => `var(--${name})` as const

export const semanticColors = {
  background: cssVar('color-background'),
  surface: cssVar('color-surface'),
  surfaceMuted: cssVar('color-surface-muted'),
  border: cssVar('color-border'),
  borderStrong: cssVar('color-border-strong'),
  text: cssVar('color-text'),
  textMuted: cssVar('color-text-muted'),
  textSubtle: cssVar('color-text-subtle'),
  primary: cssVar('color-primary'),
  primaryStrong: cssVar('color-primary-strong'),
  primaryForeground: cssVar('color-primary-foreground'),
  success: cssVar('color-success'),
  warning: cssVar('color-warning'),
  danger: cssVar('color-danger'),
  info: cssVar('color-info'),
} as const

export const brandScale = {
  50: cssVar('color-brand-50'),
  100: cssVar('color-brand-100'),
  200: cssVar('color-brand-200'),
  300: cssVar('color-brand-300'),
  400: cssVar('color-brand-400'),
  500: cssVar('color-brand-500'),
  600: cssVar('color-brand-600'),
  700: cssVar('color-brand-700'),
  800: cssVar('color-brand-800'),
  900: cssVar('color-brand-900'),
  950: cssVar('color-brand-950'),
} as const

/** Categorical palette for charts; order is intentional (brand first, then hue-separated). */
export const chartPalette = [
  cssVar('color-chart-1'),
  cssVar('color-chart-2'),
  cssVar('color-chart-3'),
  cssVar('color-chart-4'),
  cssVar('color-chart-5'),
  cssVar('color-chart-6'),
] as const

export const tints = {
  lime: cssVar('color-tint-lime'),
  mint: cssVar('color-tint-mint'),
  sky: cssVar('color-tint-sky'),
  lavender: cssVar('color-tint-lavender'),
  peach: cssVar('color-tint-peach'),
  butter: cssVar('color-tint-butter'),
  rose: cssVar('color-tint-rose'),
} as const

export type Tint = keyof typeof tints

/** Breakpoints mirror Tailwind's defaults so JS media queries agree with CSS. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

/** Motion durations in milliseconds (match `--animate-*` in tokens.css). */
export const durations = {
  fast: 140,
  base: 180,
  slow: 260,
} as const

export const fontFamily = {
  sans: "'Plus Jakarta Sans Variable', ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
} as const
