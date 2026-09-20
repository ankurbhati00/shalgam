import type { Promotion } from '@shalgam/types'
import { Badge, Button, Heading, ProductImage, Text, cn } from '@shalgam/ui'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

const tintClass: Record<Promotion['tint'], string> = {
  lime: 'bg-tint-lime',
  mint: 'bg-tint-mint',
  sky: 'bg-tint-sky',
  lavender: 'bg-tint-lavender',
  peach: 'bg-tint-peach',
  butter: 'bg-tint-butter',
  rose: 'bg-tint-rose',
}

export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  return (
    <ul
      className="-mx-4 scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-[1.6fr_1fr_1fr] lg:overflow-visible lg:px-0"
      aria-label="Offers"
    >
      {promotions.map((promo, index) => (
        <li key={promo.id} className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-auto">
          <article
            className={cn(
              'relative flex h-full min-h-44 overflow-hidden rounded-2xl',
              tintClass[promo.tint],
            )}
          >
            <div
              className={cn(
                'relative z-10 flex flex-col justify-between gap-4 p-5 sm:p-6',
                index === 0 ? 'w-3/5' : 'w-2/3',
              )}
            >
              <div className="space-y-2">
                {promo.badge && <Badge tone="inverse">{promo.badge}</Badge>}
                <Heading
                  level={2}
                  size={index === 0 ? 'lg' : 'md'}
                  className={index === 0 ? 'lg:text-3xl' : undefined}
                >
                  {promo.title}
                </Heading>
                <Text size="sm" tone="muted" lines={2}>
                  {promo.subtitle}
                </Text>
              </div>
              <Button
                size="sm"
                variant="secondary"
                trailingIcon={<ArrowRight />}
                render={<Link to={promo.href} />}
                className="w-fit"
              >
                {promo.ctaLabel}
              </Button>
            </div>
            <ProductImage
              src={promo.imageUrl}
              alt=""
              ratio="auto"
              tint={false}
              rounded="none"
              priority={index === 0}
              className="absolute inset-y-0 right-0 w-1/2 [mask-image:linear-gradient(to_right,transparent,black_35%)]"
            />
          </article>
        </li>
      ))}
    </ul>
  )
}
