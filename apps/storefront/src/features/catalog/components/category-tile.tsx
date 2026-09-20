import type { Category } from '@shalgam/types'
import { ProductImage, cn } from '@shalgam/ui'
import { Link } from 'react-router'

const tintClass: Record<Category['tint'], string> = {
  lime: 'bg-tint-lime',
  mint: 'bg-tint-mint',
  sky: 'bg-tint-sky',
  lavender: 'bg-tint-lavender',
  peach: 'bg-tint-peach',
  butter: 'bg-tint-butter',
  rose: 'bg-tint-rose',
}

export interface CategoryTileProps {
  category: Category
  size?: 'sm' | 'md'
}

/** Tinted category card with imagery, used on the home grid. */
export function CategoryTile({ category, size = 'md' }: CategoryTileProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl focus-ring transition-transform duration-150 ease-out-soft hover:-translate-y-0.5',
        tintClass[category.tint],
      )}
    >
      <span
        className={cn(
          'px-2.5 pt-2.5 text-xs leading-tight font-semibold text-text sm:px-3 sm:pt-3 sm:text-sm',
          size === 'sm' && 'sm:text-xs',
        )}
      >
        {category.name}
      </span>
      <ProductImage
        src={category.imageUrl}
        alt=""
        tint={false}
        rounded="none"
        ratio="4/3"
        className="mt-2"
        imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
      />
    </Link>
  )
}
