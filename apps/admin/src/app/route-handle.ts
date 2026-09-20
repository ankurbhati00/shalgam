import { useMatches } from 'react-router'

/** Per-route metadata used by the navbar breadcrumb and the document title. */
export interface RouteHandle {
  title: string
  parent?: { label: string; to: string }
}

export function isRouteHandle(handle: unknown): handle is RouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    typeof (handle as { title?: unknown }).title === 'string'
  )
}

/** The deepest matched route's handle, or `null` outside the shell. */
export function useRouteHandle(): RouteHandle | null {
  const matches = useMatches()
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle
    if (isRouteHandle(handle)) return handle
  }
  return null
}
