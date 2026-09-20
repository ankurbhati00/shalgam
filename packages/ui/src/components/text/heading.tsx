import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, type HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export const headingVariants = cva('font-semibold tracking-tight text-balance text-text', {
  variants: {
    size: {
      xs: 'text-sm',
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl md:text-2xl',
      xl: 'text-2xl md:text-3xl',
      '2xl': 'text-3xl font-bold md:text-4xl',
      '3xl': 'text-4xl font-bold md:text-5xl',
    },
  },
  defaultVariants: { size: 'md' },
})

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, 'color'>, VariantProps<typeof headingVariants> {
  /** Semantic level (h1–h6), independent of the visual `size`. */
  level?: HeadingLevel
}

/** Headings separate semantics (`level`) from appearance (`size`) so the document outline stays correct. */
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  return createElement(`h${level}`, {
    className: cn(headingVariants({ size }), className),
    ...props,
  })
}
