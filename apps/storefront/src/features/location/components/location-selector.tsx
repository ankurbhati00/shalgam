import {
  Badge,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  RadioCard,
  RadioGroup,
  Skeleton,
} from '@shalgam/ui'
import { ChevronDown, MapPin, Timer } from 'lucide-react'
import { useState } from 'react'

import { useLocations } from '../api/queries'
import { useSelectedLocation } from '../hooks/use-selected-location'
import { useLocationStore } from '../store/location-store'

/** Header control: "Deliver in 12 min · Indiranagar". Opens a sheet with all serviceable zones. */
export function LocationSelector() {
  const [open, setOpen] = useState(false)
  const { data: locations, isPending } = useLocations()
  const { location } = useSelectedLocation()
  const setLocation = useLocationStore((s) => s.setLocation)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        aria-label={
          location ? `Delivery location: ${location.label}. Change` : 'Choose delivery location'
        }
        className="flex min-h-11 min-w-0 flex-col items-start justify-center rounded-md px-1.5 py-1 text-left text-primary-foreground focus-ring hover:bg-brand-300/60"
      >
        {isPending || !location ? (
          <>
            <Skeleton className="h-3.5 w-24 bg-brand-300" />
            <Skeleton className="mt-1 h-3 w-16 bg-brand-300" />
          </>
        ) : (
          <>
            <span className="flex items-center gap-1 text-sm leading-tight font-bold">
              <Timer className="size-3.5" aria-hidden />
              Delivery in {location.etaMinutes} min
            </span>
            <span className="flex max-w-[11rem] items-center gap-0.5 text-xs leading-tight opacity-80 sm:max-w-[16rem]">
              <span className="truncate">{location.area}</span>
              <ChevronDown className="size-3.5 shrink-0" aria-hidden />
            </span>
          </>
        )}
      </DrawerTrigger>
      <DrawerContent
        side="bottom"
        className="sm:inset-x-auto sm:top-20 sm:bottom-auto sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:rounded-2xl"
      >
        <DrawerHeader>
          <DrawerTitle>Where should we deliver?</DrawerTitle>
          <DrawerDescription>
            Shalgam currently serves these Bengaluru neighbourhoods.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <RadioGroup
            aria-label="Delivery location"
            value={location?.id ?? ''}
            onValueChange={(value) => {
              setLocation(value)
              setOpen(false)
            }}
          >
            {locations?.map((item) => (
              <RadioCard
                key={item.id}
                value={item.id}
                icon={<MapPin />}
                title={item.label}
                description={`${item.area} · ${item.pincode}`}
                addon={<Badge tone="brand">{item.etaMinutes} min</Badge>}
                disabled={!item.isServiceable}
              />
            ))}
          </RadioGroup>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
