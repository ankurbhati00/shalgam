import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

/** Reactive `window.matchMedia`, safe on the server (returns `fallback`). */
export function useMediaQuery(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}
