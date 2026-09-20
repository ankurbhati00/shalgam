import { useEffect, useRef, useState } from 'react'

/**
 * Local text state for a search box whose committed value lives elsewhere
 * (the URL). Typing updates the box immediately and commits after `delayMs`;
 * an external change to `value` (e.g. "clear filters") resets the box.
 */
export function useDebouncedSearch(value: string, onCommit: (next: string) => void, delayMs = 300) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setText(value)
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const commit = useRef(onCommit)
  useEffect(() => {
    commit.current = onCommit
  })
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [value])

  const onChange = (next: string) => {
    setText(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => commit.current(next), delayMs)
  }

  return [text, onChange] as const
}
