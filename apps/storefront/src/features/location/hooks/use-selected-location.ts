import type { Location } from '@shalgam/types'

import { useLocations } from '../api/queries'
import { useLocationStore } from '../store/location-store'

export function useSelectedLocation(): { location: Location | undefined; isPending: boolean } {
  const { data, isPending } = useLocations()
  const locationId = useLocationStore((s) => s.locationId)
  const location = data?.find((l) => l.id === locationId) ?? data?.[0]
  return { location, isPending }
}
