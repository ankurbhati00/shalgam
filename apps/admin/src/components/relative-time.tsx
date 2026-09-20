import { formatDateTime, formatRelativeTime } from '@shalgam/utils'

export interface RelativeTimeProps {
  value: string | null | undefined
  /** Show the absolute time instead, with the relative one as a tooltip. */
  absolute?: boolean
  className?: string
}

/** `<time>` element: relative label by default, absolute date/time on hover and for assistive tech. */
export function RelativeTime({ value, absolute = false, className }: RelativeTimeProps) {
  if (!value) return <span className={className}>—</span>
  const relative = formatRelativeTime(value)
  const exact = formatDateTime(value)
  return (
    <time dateTime={value} title={absolute ? relative : exact} className={className}>
      {absolute ? exact : relative}
    </time>
  )
}
