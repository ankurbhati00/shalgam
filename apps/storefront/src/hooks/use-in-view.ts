import { type RefObject, useEffect, useState } from 'react'

/**
 * Whether the referenced element is at least partly inside the viewport.
 * Starts as `true` so dependent UI (e.g. a sticky "Add to cart" bar) does not
 * flash before the first layout. Uses one IntersectionObserver, no scroll listeners.
 */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = '0px') {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => setInView(entries.some((entry) => entry.isIntersecting)),
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])
  return inView
}
