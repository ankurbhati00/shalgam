import type { ProductTag } from '@shalgam/types'
import {
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Heading,
  Slider,
  Switch,
  cn,
} from '@shalgam/ui'
import { countLabel, formatINR } from '@shalgam/utils'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { FILTER_TAGS, PRICE_MAX, type useListingParams } from '../hooks/use-listing-params'

type Listing = ReturnType<typeof useListingParams>

function FilterFields({ listing }: { listing: Listing }) {
  const { params, setPrice, setTags, setInStock } = listing
  const [range, setRange] = useState<[number, number]>([
    params.minPrice ?? 0,
    params.maxPrice ?? PRICE_MAX,
  ])
  const toggleTag = (tag: ProductTag, checked: boolean) =>
    setTags(checked ? [...params.tags, tag] : params.tags.filter((t) => t !== tag))
  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-text">Price</legend>
        <Slider
          value={range}
          min={0}
          max={PRICE_MAX}
          step={10}
          thumbLabels={['Minimum price', 'Maximum price']}
          format={(v) => (v >= PRICE_MAX ? `${formatINR(v)}+` : formatINR(v))}
          showValue
          onValueChange={(value) =>
            Array.isArray(value) && setRange([value[0] ?? 0, value[1] ?? PRICE_MAX])
          }
          onValueCommitted={(value) =>
            Array.isArray(value) && setPrice([value[0] ?? 0, value[1] ?? PRICE_MAX])
          }
        />
      </fieldset>
      {/* Touch screens get taller rows from the checkbox itself, so the list spacing collapses. */}
      <fieldset className="space-y-2.5 pointer-coarse:space-y-0">
        <legend className="mb-1 text-sm font-semibold text-text">Highlights</legend>
        {FILTER_TAGS.map((tag) => (
          <Checkbox
            key={tag.value}
            label={tag.label}
            checked={params.tags.includes(tag.value)}
            onCheckedChange={(checked) => toggleTag(tag.value, checked)}
          />
        ))}
      </fieldset>
      <Switch
        label="In stock only"
        checked={params.inStock}
        onCheckedChange={setInStock}
        labelPosition="start"
      />
    </div>
  )
}

export interface FilterSidebarProps {
  listing: Listing
  className?: string
}

/** Desktop filter column. State lives in the URL, so it stays in sync with the mobile sheet. */
export function FilterSidebar({ listing, className }: FilterSidebarProps) {
  const { activeFilterCount, clearFilters } = listing
  return (
    <aside className={cn('hidden w-60 shrink-0 lg:block', className)} aria-label="Filters">
      <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <Heading level={2} size="sm">
            Filters
          </Heading>
          {activeFilterCount > 0 && (
            <Button variant="link" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>
        <FilterFields listing={listing} />
      </div>
    </aside>
  )
}

export interface MobileFiltersProps {
  listing: Listing
  /** Number of matching products, shown on the sheet's confirm button. */
  resultCount?: number
  className?: string
}

/** "Filters (n)" button that opens a bottom sheet on phones and tablets. */
export function MobileFilters({ listing, resultCount, className }: MobileFiltersProps) {
  const [open, setOpen] = useState(false)
  const { activeFilterCount, clearFilters } = listing
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            leadingIcon={<SlidersHorizontal />}
            className={className}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        }
      />
      <DrawerContent side="bottom">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <FilterFields listing={listing} />
        </DrawerBody>
        <DrawerFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={clearFilters}
            disabled={activeFilterCount === 0}
          >
            Clear
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            {resultCount === undefined
              ? 'Show results'
              : `Show ${countLabel(resultCount, 'product')}`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
