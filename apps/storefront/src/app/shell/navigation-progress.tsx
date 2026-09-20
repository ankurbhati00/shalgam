import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router'

/**
 * Thin progress bar under the header while a route module or loader is pending.
 * Only appears for transitions longer than ~150 ms so quick navigations stay silent.
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const pending = navigation.state !== 'idle'
  const [delayedPending, setDelayedPending] = useState(false)

  // Reset synchronously (derived state) when navigation settles, so the next transition delays again.
  if (!pending && delayedPending) setDelayedPending(false)

  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => setDelayedPending(true), 150)
    return () => clearTimeout(timer)
  }, [pending])

  if (!(pending && delayedPending)) return null
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-valuetext="Loading"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-brand-200"
    >
      <div className="h-full w-1/3 animate-[shimmer_1s_linear_infinite] bg-brand-700 [background-size:200%_100%]" />
    </div>
  )
}
