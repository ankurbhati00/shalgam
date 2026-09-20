import { CircleAlert, Inbox, RefreshCw, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../button'
import { Spinner } from '../spinner'

export interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Primary call to action. */
  action?: ReactNode
  /** Secondary action rendered next to the primary one. */
  secondaryAction?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Optional illustration or image rendered above the title instead of the icon. */
  illustration?: ReactNode
  /** Heading level for the title; defaults to `h2` so it follows a page `h1`. */
  headingLevel?: 'h2' | 'h3' | 'h4'
}

/** Friendly empty state with a clear next step. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  illustration,
  headingLevel: Heading = 'h2',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm'
          ? 'gap-2 px-4 py-8'
          : size === 'lg'
            ? 'gap-4 px-6 py-14 sm:py-20'
            : 'gap-3 px-6 py-10 sm:py-14',
        className,
      )}
    >
      {illustration ?? (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-surface-muted text-text-subtle',
            size === 'sm' ? 'size-10 [&_svg]:size-5' : 'size-14 [&_svg]:size-7',
          )}
        >
          {icon ?? <Inbox aria-hidden />}
        </span>
      )}
      <div className="max-w-sm space-y-1">
        <Heading className={cn('font-semibold text-text', size === 'sm' ? 'text-sm' : 'text-base')}>
          {title}
        </Heading>
        {description && (
          <p className={cn('text-text-muted', size === 'sm' ? 'text-xs' : 'text-sm')}>
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export interface ErrorStateProps {
  title?: ReactNode
  /** Message from `getErrorMessage(error)`. */
  description?: ReactNode
  onRetry?: () => void
  retrying?: boolean
  className?: string
  size?: 'sm' | 'md'
  /** Distinguish connectivity problems from server errors. */
  kind?: 'error' | 'offline'
  headingLevel?: 'h2' | 'h3' | 'h4'
}

/** Error boundary / failed query fallback with a retry affordance. Announced as an alert. */
export function ErrorState({
  title,
  description = 'Something went wrong on our side. Please try again.',
  onRetry,
  retrying = false,
  className,
  size = 'md',
  kind = 'error',
  headingLevel: Heading = 'h2',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'sm' ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-10 sm:py-14',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-danger-muted text-danger-text',
          size === 'sm' ? 'size-10 [&_svg]:size-5' : 'size-14 [&_svg]:size-7',
        )}
      >
        {kind === 'offline' ? <WifiOff aria-hidden /> : <CircleAlert aria-hidden />}
      </span>
      <div className="max-w-sm space-y-1">
        <Heading className={cn('font-semibold text-text', size === 'sm' ? 'text-sm' : 'text-base')}>
          {title ?? (kind === 'offline' ? 'You appear to be offline' : 'Could not load this')}
        </Heading>
        <p className={cn('text-text-muted', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {description}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          leadingIcon={<RefreshCw />}
          loading={retrying}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}

export interface LoadingStateProps {
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Cover the parent (which must be `relative`) with a translucent overlay. */
  overlay?: boolean
}

/** Centered spinner for regions without a skeleton. Prefer skeletons for initial page loads. */
export function LoadingState({
  label = 'Loading',
  className,
  size = 'md',
  overlay = false,
}: LoadingStateProps) {
  return (
    <div
      aria-busy
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-text-muted',
        overlay
          ? 'absolute inset-0 z-10 bg-surface/60 backdrop-blur-[1px]'
          : size === 'sm'
            ? 'py-6'
            : size === 'lg'
              ? 'py-24'
              : 'py-14',
        className,
      )}
    >
      <Spinner size={size === 'lg' ? 'lg' : 'md'} label={label} />
      {!overlay && <span aria-hidden>{label}</span>}
    </div>
  )
}
