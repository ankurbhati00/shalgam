import { cva } from 'class-variance-authority'

/** Shared chrome for text-like controls: Input, Textarea, Select trigger, NumberField. */
export const fieldControlVariants = cva(
  [
    'w-full rounded-md border border-border-strong bg-surface text-text outline-none',
    'placeholder:text-text-subtle',
    'transition-[border-color,box-shadow,background-color] duration-150 ease-out-soft',
    'hover:border-neutral-400',
    'focus-visible:border-brand-600 focus-visible:ring-[3px] focus-visible:ring-brand-400/40',
    'data-[focused]:border-brand-600 data-[focused]:ring-[3px] data-[focused]:ring-brand-400/40',
    'aria-invalid:border-danger aria-invalid:focus-visible:ring-danger/25 data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger/25',
    'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted data-[disabled]:cursor-not-allowed data-[disabled]:bg-surface-muted data-[disabled]:text-text-muted',
    'read-only:bg-surface-subtle',
  ],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm pointer-coarse:h-10',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export const checkableVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center border border-border-strong bg-surface text-primary-foreground outline-none',
    'transition-[background-color,border-color,box-shadow] duration-150 ease-out-soft',
    'hover:border-neutral-400',
    'focus-visible:border-brand-600 focus-visible:ring-[3px] focus-visible:ring-brand-400/40',
    'data-[checked]:border-primary data-[checked]:bg-primary data-[indeterminate]:border-primary data-[indeterminate]:bg-primary',
    'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    'aria-invalid:border-danger data-[invalid]:border-danger',
  ],
  {
    variants: {
      size: {
        sm: 'size-4 rounded-xs [&_svg]:size-3',
        md: 'size-5 rounded-xs [&_svg]:size-3.5',
      },
    },
    defaultVariants: { size: 'md' },
  },
)
