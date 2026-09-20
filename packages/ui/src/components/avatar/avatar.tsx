import { Avatar as BaseAvatar } from '@base-ui-components/react/avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { initials } from '@shalgam/utils'

import { cn } from '../../lib/cn'

export const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted font-semibold text-text-muted select-none',
  {
    variants: {
      size: {
        xs: 'size-6 text-2xs',
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-12 text-base',
        xl: 'size-16 text-lg',
      },
      tint: {
        neutral: 'bg-surface-muted text-text-muted',
        lime: 'bg-tint-lime text-brand-900',
        mint: 'bg-tint-mint text-success-900',
        sky: 'bg-tint-sky text-info-900',
        lavender: 'bg-tint-lavender text-neutral-800',
        peach: 'bg-tint-peach text-warning-900',
        butter: 'bg-tint-butter text-warning-900',
        rose: 'bg-tint-rose text-danger-900',
      },
    },
    defaultVariants: { size: 'md', tint: 'neutral' },
  },
)

const tintOrder = ['lime', 'mint', 'sky', 'lavender', 'peach', 'butter', 'rose'] as const

/** Deterministic tint from a name so the same person always gets the same colour. */
export function tintForName(name: string): (typeof tintOrder)[number] {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return tintOrder[hash % tintOrder.length] ?? 'lime'
}

export interface AvatarProps
  extends Omit<BaseAvatar.Root.Props, 'className'>, VariantProps<typeof avatarVariants> {
  name: string
  src?: string | null
  className?: string
}

/** Person avatar with image, initials fallback and a stable per-name tint. */
export function Avatar({ name, src, size, tint, className, ...props }: AvatarProps) {
  const resolvedTint = tint ?? tintForName(name)
  return (
    <BaseAvatar.Root
      className={cn(avatarVariants({ size, tint: resolvedTint }), className)}
      {...props}
    >
      {src ? <BaseAvatar.Image src={src} alt={name} className="size-full object-cover" /> : null}
      <BaseAvatar.Fallback className="flex size-full items-center justify-center" aria-label={name}>
        {initials(name)}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
}
