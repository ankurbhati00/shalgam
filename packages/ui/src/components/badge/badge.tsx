import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef, ReactElement } from 'react'

import { cn } from '../../lib/cn'

export const badgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1 rounded-full font-medium whitespace-nowrap [&_svg]:size-3',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-text-muted',
        brand: 'bg-primary-muted text-primary-strong',
        success: 'bg-success-muted text-success-text',
        warning: 'bg-warning-muted text-warning-text',
        danger: 'bg-danger-muted text-danger-text',
        info: 'bg-info-muted text-info-text',
        inverse: 'bg-surface-inverse text-text-inverse',
        primary: 'bg-primary text-primary-foreground',
      },
      variant: {
        soft: '',
        outline: 'border bg-transparent',
      },
      size: {
        sm: 'h-5 px-1.5 text-2xs',
        md: 'h-6 px-2 text-xs',
        lg: 'h-7 px-2.5 text-sm',
      },
    },
    compoundVariants: [
      { variant: 'outline', tone: 'neutral', className: 'border-border text-text-muted' },
      { variant: 'outline', tone: 'brand', className: 'border-brand-600/40 text-primary-strong' },
      { variant: 'outline', tone: 'success', className: 'border-success/40 text-success-text' },
      { variant: 'outline', tone: 'warning', className: 'border-warning-600/50 text-warning-text' },
      { variant: 'outline', tone: 'danger', className: 'border-danger/40 text-danger-text' },
      { variant: 'outline', tone: 'info', className: 'border-info/40 text-info-text' },
    ],
    defaultVariants: { tone: 'neutral', variant: 'soft', size: 'md' },
  },
)

export interface BadgeProps
  extends Omit<ComponentPropsWithoutRef<'span'>, 'color'>, VariantProps<typeof badgeVariants> {
  icon?: ReactElement
  /** Renders a small leading dot in the badge's tone colour. */
  dot?: boolean
}

/** Compact label for status, counts and categories. Purely presentational — use `StatusBadge` for domain statuses. */
export function Badge({
  className,
  tone,
  variant,
  size,
  icon,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, variant, size }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  )
}
