import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedState {
  /** Product ids, most recent first. */
  ids: string[]
  track: (id: string) => void
}

const LIMIT = 12

/** Client-only history; the product data itself is fetched by id through TanStack Query. */
export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      track: (id) =>
        set((state) => ({
          ids: [id, ...state.ids.filter((existing) => existing !== id)].slice(0, LIMIT),
        })),
    }),
    { name: 'shalgam:recently-viewed:v1' },
  ),
)
