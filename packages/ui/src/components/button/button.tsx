import { Button as BaseButton } from '@base-ui-components/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import {
  cloneElement,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn'

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap focus-ring select-none',
    'transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out-soft',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    'data-[loading]:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-surface-inverse text-text-inverse hover:opacity-90',
        outline:
          'border border-border-strong bg-surface text-text shadow-xs hover:border-neutral-400 hover:bg-surface-muted',
        ghost: 'text-text hover:bg-surface-muted',
        soft: 'bg-primary-muted text-primary-strong hover:bg-brand-200',
        danger: 'bg-danger text-danger-foreground shadow-xs hover:opacity-90',
        'danger-outline':
          'border border-danger/40 bg-surface text-danger-text hover:bg-danger-muted',
        link: 'h-auto rounded-none px-0 text-primary-strong underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs pointer-coarse:h-9 [&_svg]:size-3.5',
        sm: 'h-8 px-3.5 text-sm pointer-coarse:h-10 [&_svg]:size-4',
        md: 'h-10 px-4 text-sm [&_svg]:size-4',
        lg: 'h-12 px-6 text-base [&_svg]:size-5',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type NativeButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'className' | 'children' | 'color'
>

export interface ButtonProps extends NativeButtonProps, VariantProps<typeof buttonVariants> {
  className?: string
  children?: ReactNode
  /**
   * Render a different element with button styling, e.g. `render={<Link to="/orders" />}`.
   * Links keep their link semantics; only real `<button>`s go through Base UI.
   */
  render?: ReactElement<{ className?: string } & Record<string, unknown>>
  /** Keep the button focusable while disabled (useful for tooltips explaining why). */
  focusableWhenDisabled?: boolean
  /** Shows a spinner, sets `aria-busy` and blocks interaction. */
  loading?: boolean
  /** Text announced/rendered while loading; defaults to the children. */
  loadingText?: ReactNode
  leadingIcon?: ReactElement
  trailingIcon?: ReactElement
}

/**
 * Shalgam's primary interactive control. Built on Base UI's Button so it stays
 * a real `<button>` (or any element via `render`) with correct disabled/focus semantics.
 */
export function Button({
  className,
  variant,
  size,
  fullWidth,
  loading = false,
  loadingText,
  leadingIcon,
  trailingIcon,
  disabled,
  children,
  type = 'button',
  render,
  focusableWhenDisabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className)
  const content = (
    <>
      {loading ? <LoaderCircle aria-hidden className="animate-spin" /> : leadingIcon}
      {loading && loadingText !== undefined ? loadingText : children}
      {!loading && trailingIcon}
    </>
  )

  if (isValidElement(render) && render.type !== 'button') {
    const inert = disabled || loading
    return cloneElement(
      render,
      {
        ...props,
        className: cn(classes, inert && 'pointer-events-none opacity-50', render.props.className),
        'aria-disabled': inert || undefined,
        'aria-busy': loading || undefined,
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
      data-loading={loading ? '' : undefined}
      className={classes}
      {...props}
    >
      {content}
    </BaseButton>
  )
}
