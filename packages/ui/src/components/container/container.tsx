import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, type HTMLAttributes } from 'react'

import { cn } from '../../lib/cn'

export const containerVariants = cva('mx-auto w-full px-4 sm:px-6', {
  variants: {
    size: {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: { size: 'xl' },
})

export interface ContainerProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof containerVariants> {
  as?: 'div' | 'section' | 'main' | 'header' | 'footer' | 'nav' | 'article'
}

/** Horizontally centred content column with responsive gutters. */
export function Container({ as = 'div', size, className, ...props }: ContainerProps) {
  return createElement(as, { className: cn(containerVariants({ size }), className), ...props })
}
