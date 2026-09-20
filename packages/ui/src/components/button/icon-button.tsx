import { Button as BaseButton } from '@base-ui-components/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import {
  cloneElement,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
} from 'react'

import { cn } from '../../lib/cn'

export const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-full focus-ring select-none',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-out-soft',
    'active:scale-95 disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover',
        secondary: 'bg-surface-inverse text-text-inverse hover:opacity-90',
        outline:
          'border border-border-strong bg-surface text-text shadow-xs hover:bg-surface-muted',
        ghost: 'text-text-muted hover:bg-surface-muted hover:text-text',
        soft: 'bg-primary-muted text-primary-strong hover:bg-brand-200',
        danger: 'text-danger-text hover:bg-danger-muted',
      },
      size: {
        xs: 'size-7 pointer-coarse:size-9 [&_svg]:size-3.5',
        sm: 'size-8 pointer-coarse:size-10 [&_svg]:size-4',
        md: 'size-10 pointer-coarse:size-11 [&_svg]:size-5',
        lg: 'size-12 [&_svg]:size-6',
      },
      shape: {
        round: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
      shape: 'round',
    },
  },
)

type NativeButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'className' | 'children' | 'aria-label' | 'color'
>

export interface IconButtonProps
  extends NativeButtonProps, VariantProps<typeof iconButtonVariants> {
  /** Render a different element (e.g. a router link) with icon-button styling. */
  render?: ReactElement<{ className?: string } & Record<string, unknown>>
  focusableWhenDisabled?: boolean
  /** Required: icon-only buttons must have an accessible name. */
  'aria-label': string
  icon: ReactElement
  className?: string
  loading?: boolean
}

export function IconButton({
  className,
  variant,
  size,
  shape,
  icon,
  loading = false,
  disabled,
  type = 'button',
  render,
  focusableWhenDisabled,
  ...props
}: IconButtonProps) {
  const classes = cn(iconButtonVariants({ variant, size, shape }), className)
  const content = loading ? <LoaderCircle aria-hidden className="animate-spin" /> : icon

  if (isValidElement(render) && render.type !== 'button') {
    const inert = disabled || loading
    return cloneElement(
      render,
      {
        ...props,
        className: cn(classes, inert && 'pointer-events-none opacity-50', render.props.className),
        'aria-disabled': inert || undefined,
        tabIndex: inert ? -1 : undefined,
      },
      content,
    )
  }

  return (
    <BaseButton
      type={type}
      disabled={disabled || loading}
      focusableWhenDisabled={focusableWhenDisabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </BaseButton>
  )
}
