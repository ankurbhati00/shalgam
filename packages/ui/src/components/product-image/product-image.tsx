import { ImageOff } from 'lucide-react'
import { type ComponentPropsWithoutRef, useState } from 'react'

import { cn } from '../../lib/cn'

export interface ProductImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> {
  src: string | null | undefined
  alt: string
  /** Aspect ratio of the frame. */
  ratio?: 'square' | '4/3' | '3/2' | '16/9' | 'auto'
  fit?: 'cover' | 'contain'
  /** Frame corner radius. */
  rounded?: 'md' | 'lg' | 'xl' | 'none'
  /** Tinted background behind transparent or letterboxed images. */
  tint?: boolean
  /** Eager-load above-the-fold hero imagery. */
  priority?: boolean
  className?: string
  imgClassName?: string
}

const ratioClass = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '16/9': 'aspect-video',
  auto: '',
} as const

const roundedClass = { none: '', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl' } as const

/**
 * Product/category imagery with a fixed aspect ratio (no layout shift), lazy
 * loading, a shimmer while loading and a branded fallback when the image is
 * missing or fails.
 */
export function ProductImage({
  src,
  alt,
  ratio = 'square',
  fit = 'cover',
  rounded = 'lg',
  tint = true,
  priority = false,
  className,
  imgClassName,
  sizes,
  ...props
}: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(src ? 'loading' : 'error')
  const showFallback = !src || status === 'error'
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        ratioClass[ratio],
        roundedClass[rounded],
        tint ? 'bg-surface-muted' : 'bg-transparent',
        className,
      )}
    >
      {!showFallback && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          sizes={sizes}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={cn(
            'size-full transition-opacity duration-300',
            fit === 'cover' ? 'object-cover' : 'object-contain p-2',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          {...props}
        />
      )}
      {status === 'loading' && !showFallback && (
        <div aria-hidden className="absolute inset-0 skeleton" />
      )}
      {showFallback && (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-text-muted"
        >
          <ImageOff aria-hidden className="size-6" />
          <span className="text-2xs font-medium">No image</span>
        </div>
      )}
    </div>
  )
}
