import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/**
 * Typed read/write helpers over URL search params. Filters, sorting, search
 * and pagination live here so every listing is shareable and bookmarkable.
 */
export function useSearchParamState() {
  const [searchParams, setSearchParams] = useSearchParams()

  const get = useCallback((key: string) => searchParams.get(key), [searchParams])
  const getAll = useCallback((key: string) => searchParams.getAll(key), [searchParams])

  const set = useCallback(
    (
      updates: Record<string, string | string[] | number | boolean | null | undefined>,
      options?: { replace?: boolean; resetPage?: boolean },
    ) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          for (const [key, value] of Object.entries(updates)) {
            next.delete(key)
            if (value === null || value === undefined || value === '' || value === false) continue
            if (Array.isArray(value)) value.forEach((item) => next.append(key, item))
            else next.set(key, String(value))
          }
          if (options?.resetPage) next.delete('page')
          return next
        },
        { replace: options?.replace ?? false, preventScrollReset: true },
      )
    },
    [setSearchParams],
  )

  return { searchParams, get, getAll, set }
}

export function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

export function parsePageSize(value: string | null, fallback: number): number {
  const size = Number(value)
  return PAGE_SIZE_OPTIONS.includes(size as (typeof PAGE_SIZE_OPTIONS)[number]) ? size : fallback
}
