import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../lib/cn'

export const cardVariants = cva('rounded-xl bg-surface text-text', {
  variants: {
    variant: {
      elevated: 'shadow-sm',
      outline: 'border border-border',
      subtle: 'bg-surface-muted',
      ghost: '',
    },
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4 md:p-5',
      lg: 'p-5 md:p-6',
    },
    interactive: {
      true: 'transition-[box-shadow,transform,border-color] duration-150 ease-out-soft focus-within:shadow-md hover:-translate-y-px hover:shadow-md',
    },
  },
  defaultVariants: { variant: 'outline', padding: 'md' },
})

export interface CardProps
  extends ComponentPropsWithoutRef<'div'>, VariantProps<typeof cardVariants> {}

/** Surface container. Compose with `CardHeader`, `CardTitle`, `CardContent` and `CardFooter`. */
export function Card({ className, variant, padding, interactive, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding, interactive }), className)} {...props} />
  )
}

export interface CardHeaderProps extends ComponentPropsWithoutRef<'div'> {
  /** Right-aligned slot for actions (buttons, menus). */
  actions?: ReactNode
}

export function CardHeader({ className, actions, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)} {...props}>
      <div className="min-w-0 flex-1 space-y-1">{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export interface CardTitleProps extends ComponentPropsWithoutRef<'h3'> {
  /** Heading level; defaults to `h2` because cards usually sit directly under a page `h1`. */
  as?: 'h2' | 'h3' | 'h4'
}

export function CardTitle({ as: Component = 'h2', className, children, ...props }: CardTitleProps) {
  return (
    <Component
      className={cn('text-base leading-tight font-semibold text-text', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardDescription({ className, ...props }: ComponentPropsWithoutRef<'p'>) {
  return <p className={cn('text-sm text-text-muted', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('mt-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('mt-4 flex items-center gap-2 border-t border-border-subtle pt-4', className)}
      {...props}
    />
  )
}
