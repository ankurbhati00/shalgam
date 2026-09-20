import { Leaf, Sparkles, Star, Tag, Zap } from 'lucide-react'
import type { ReactElement } from 'react'

import { Badge, type BadgeProps } from '../badge'

export type ProductBadgeKind =
  | 'bestseller'
  | 'new'
  | 'deal'
  | 'organic'
  | 'fresh'
  | 'imported'
  | 'veg'
  | 'non-veg'
  | 'shalgam-select'
  | 'low-stock'
  | 'out-of-stock'

const definitions: Record<
  ProductBadgeKind,
  { label: string; tone: NonNullable<BadgeProps['tone']>; icon?: ReactElement }
> = {
  bestseller: { label: 'Bestseller', tone: 'warning', icon: <Star className="fill-current" /> },
  new: { label: 'New', tone: 'info', icon: <Sparkles /> },
  deal: { label: 'Deal', tone: 'primary', icon: <Tag /> },
  organic: { label: 'Organic', tone: 'success', icon: <Leaf /> },
  fresh: { label: 'Fresh today', tone: 'success', icon: <Zap /> },
  imported: { label: 'Imported', tone: 'neutral' },
  veg: { label: 'Veg', tone: 'success' },
  'non-veg': { label: 'Non-veg', tone: 'danger' },
  'shalgam-select': { label: 'Shalgam Select', tone: 'brand' },
  'low-stock': { label: 'Only a few left', tone: 'warning' },
  'out-of-stock': { label: 'Out of stock', tone: 'neutral' },
}

export interface ProductBadgeProps extends Omit<BadgeProps, 'tone' | 'children' | 'icon'> {
  kind: ProductBadgeKind
  /** Discount percentage for the `deal` kind, e.g. 25 → "25% off". */
  discount?: number
}

/** Merchandising labels shown on product cards and detail pages. */
export function ProductBadge({ kind, discount, size = 'sm', ...props }: ProductBadgeProps) {
  const definition = definitions[kind]
  if (kind === 'veg' || kind === 'non-veg') {
    return (
      <span
        role="img"
        aria-label={definition.label}
        className={`inline-flex size-4 items-center justify-center rounded-xs border ${kind === 'veg' ? 'border-success' : 'border-danger'} bg-surface`}
      >
        <span className={`size-2 rounded-full ${kind === 'veg' ? 'bg-success' : 'bg-danger'}`} />
      </span>
    )
  }
  return (
    <Badge tone={definition.tone} size={size} icon={definition.icon} {...props}>
      {kind === 'deal' && discount ? `${discount}% off` : definition.label}
    </Badge>
  )
}
