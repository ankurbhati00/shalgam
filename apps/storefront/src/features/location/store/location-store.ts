import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  /** Selected delivery zone id; `null` until the shopper picks one (server picks a default). */
  locationId: string | null
  setLocation: (id: string) => void
}

/** Client state: which zone the shopper wants to see. The zone data itself is server state. */
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locationId: null,
      setLocation: (id) => set({ locationId: id }),
    }),
    { name: 'shalgam:location:v1' },
  ),
)
