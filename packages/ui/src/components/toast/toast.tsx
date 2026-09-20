import { Toast as BaseToast } from '@base-ui-components/react/toast'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { IconButton } from '../button'

export type ToastTone = 'neutral' | 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title: ReactNode
  description?: ReactNode
  tone?: ToastTone
  /** Milliseconds before auto-dismiss; `0` keeps it until closed. */
  timeout?: number
  action?: { label: string; onClick: () => void }
}

/**
 * Module-level manager so non-React code (query error handlers, stores) can
 * raise toasts. React code prefers `useToast()` for the same API.
 */
export const toastManager = BaseToast.createToastManager()

function add(options: ToastOptions): string {
  return toastManager.add({
    title: options.title,
    description: options.description,
    type: options.tone ?? 'neutral',
    timeout: options.timeout,
    actionProps: options.action
      ? { children: options.action.label, onClick: options.action.onClick }
      : undefined,
  })
}

export const toast = {
  show: add,
  success: (title: ReactNode, description?: ReactNode) =>
    add({ title, description, tone: 'success' }),
  error: (title: ReactNode, description?: ReactNode) =>
    add({ title, description, tone: 'error', timeout: 8000 }),
  info: (title: ReactNode, description?: ReactNode) => add({ title, description, tone: 'info' }),
  warning: (title: ReactNode, description?: ReactNode) =>
    add({ title, description, tone: 'warning' }),
  dismiss: (id: string) => toastManager.close(id),
  /** Tracks a promise: loading → success/error. */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: ReactNode
      success: ReactNode | ((value: T) => ReactNode)
      error: ReactNode | ((error: unknown) => ReactNode)
    },
  ) =>
    toastManager.promise(promise, {
      loading: { title: messages.loading, type: 'neutral' },
      success: (value) => ({
        title: typeof messages.success === 'function' ? messages.success(value) : messages.success,
        type: 'success',
      }),
      error: (error: unknown) => ({
        title: typeof messages.error === 'function' ? messages.error(error) : messages.error,
        type: 'error',
      }),
    }),
}

/** Hook form of the same API for components. */
export function useToast() {
  return toast
}

const toneStyles: Record<ToastTone, { icon: ReactNode; className: string }> = {
  neutral: { icon: null, className: '' },
  success: { icon: <CircleCheck aria-hidden />, className: 'text-success' },
  error: { icon: <CircleAlert aria-hidden />, className: 'text-danger' },
  warning: { icon: <TriangleAlert aria-hidden />, className: 'text-warning-600' },
  info: { icon: <Info aria-hidden />, className: 'text-info' },
}

function ToastList({ viewportClassName }: { viewportClassName?: string }) {
  const { toasts } = BaseToast.useToastManager()
  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        className={cn(
          'fixed inset-x-4 bottom-4 z-[70] flex flex-col gap-2 safe-bottom sm:inset-x-auto sm:right-4 sm:w-96',
          viewportClassName,
        )}
      >
        {toasts.map((item) => {
          const tone = toneStyles[(item.type as ToastTone | undefined) ?? 'neutral']
          return (
            <BaseToast.Root
              key={item.id}
              toast={item}
              swipeDirection={['right', 'down']}
              className={cn(
                'relative flex w-full items-start gap-3 rounded-lg border border-border bg-surface p-3.5 pr-10 shadow-lg',
                'transition-[transform,opacity] duration-200 ease-out-soft',
                'data-[ending-style]:translate-x-6 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0',
                '[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-swipe-movement-y))]',
              )}
            >
              {tone.icon && (
                <span className={cn('mt-0.5 shrink-0 [&_svg]:size-5', tone.className)}>
                  {tone.icon}
                </span>
              )}
              <BaseToast.Content className="flex min-w-0 flex-1 flex-col gap-0.5">
                <BaseToast.Title className="text-sm font-semibold text-text" />
                <BaseToast.Description className="text-sm text-text-muted" />
                {item.actionProps && (
                  <BaseToast.Action className="mt-1.5 self-start rounded-xs text-sm font-semibold text-primary-strong underline-offset-4 focus-ring hover:underline" />
                )}
              </BaseToast.Content>
              <BaseToast.Close
                render={
                  <IconButton
                    aria-label="Dismiss"
                    icon={<X />}
                    size="xs"
                    variant="ghost"
                    className="absolute top-2 right-2"
                  />
                }
              />
            </BaseToast.Root>
          )
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  )
}

export interface ToastProviderProps {
  children: ReactNode
  /** Default auto-dismiss in milliseconds. */
  timeout?: number
  /** Maximum toasts shown at once; extras queue up. */
  limit?: number
  /** Extra classes for the viewport, e.g. to lift toasts above a bottom navigation bar. */
  viewportClassName?: string
}

/** Mount once at the app root. Renders the viewport and announces toasts politely. */
export function ToastProvider({
  children,
  timeout = 5000,
  limit = 3,
  viewportClassName,
}: ToastProviderProps) {
  return (
    <BaseToast.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
      {children}
      <ToastList viewportClassName={viewportClassName} />
    </BaseToast.Provider>
  )
}
