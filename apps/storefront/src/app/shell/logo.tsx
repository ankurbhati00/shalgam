import { cn } from '@shalgam/ui'
import { Link } from 'react-router'

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Shalgam home"
      className={cn(
        'inline-flex min-h-11 min-w-10 items-center justify-center gap-2 rounded-md focus-ring',
        className,
      )}
    >
      <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-neutral-950 text-primary">
        <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden>
          <path
            d="M11 21c1.2 1.6 3 2.4 5 2.4 2.8 0 4.6-1.4 4.6-3.6 0-2-1.3-3-4.3-3.8-3.4-.9-5-2.3-5-4.9 0-2.7 2.2-4.6 5.5-4.6 2.1 0 3.8.7 5 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-neutral-950">Shalgam</span>
      )}
    </Link>
  )
}
