import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export const textVariants = cva('', {
  variants: {
    size: {
      '2xs': 'text-2xs',
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    tone: {
      default: 'text-text',
      muted: 'text-text-muted',
      subtle: 'text-text-subtle',
      brand: 'text-primary-strong',
      success: 'text-success-text',
      warning: 'text-warning-text',
      danger: 'text-danger-text',
      info: 'text-info-text',
      inverse: 'text-text-inverse',
    },
    align: {
      start: 'text-start',
      center: 'text-center',
      end: 'text-end',
    },
    truncate: {
      true: 'truncate',
    },
    tabular: {
      true: 'tabular',
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'regular',
    tone: 'default',
  },
})

type TextElement =
  'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'small' | 'dd' | 'dt' | 'li' | 'time'

export interface TextProps
  extends Omit<HTMLAttributes<HTMLElement>, 'color'>, VariantProps<typeof textVariants> {
  /** Element to render. Defaults to `p`. */
  as?: TextElement
  children?: ReactNode
  /** Clamp to N lines (1–4) with an ellipsis. */
  lines?: 1 | 2 | 3 | 4
}

const lineClamp = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
} as const

/** Body text with tokenised size, weight and tone. */
export function Text({
  as = 'p',
  className,
  size,
  weight,
  tone,
  align,
  truncate,
  tabular,
  lines,
  ...props
}: TextProps) {
  return createElement(as, {
    className: cn(
      textVariants({ size, weight, tone, align, truncate, tabular }),
      lines && lineClamp[lines],
      className,
    ),
    ...props,
  })
}
