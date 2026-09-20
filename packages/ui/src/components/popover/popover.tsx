import { Popover as BasePopover } from '@base-ui-components/react/popover'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

export const Popover = BasePopover.Root
export const PopoverTrigger = BasePopover.Trigger
export const PopoverClose = BasePopover.Close

export const popupSurfaceClassName = cn(
  'z-50 rounded-lg border border-border bg-surface text-text shadow-lg outline-none',
  'origin-[var(--transform-origin)] transition-[transform,opacity] duration-150 ease-out-soft',
  'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
)

export interface PopoverContentProps extends Omit<BasePopover.Positioner.Props, 'className'> {
  className?: string
  children: ReactNode
  /** Show a small arrow pointing at the trigger. */
  arrow?: boolean
  /** Where focus goes on open; `false` keeps it on the trigger (typeahead lists). */
  initialFocus?: BasePopover.Popup.Props['initialFocus']
  finalFocus?: BasePopover.Popup.Props['finalFocus']
}

/** Non-modal floating panel anchored to its trigger (filters, quick actions, pickers). */
export function PopoverContent({
  className,
  children,
  arrow = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  initialFocus,
  finalFocus,
  ...props
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 outline-none"
        {...props}
      >
        <BasePopover.Popup
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(popupSurfaceClassName, 'p-4', className)}
        >
          {arrow && (
            <BasePopover.Arrow className="data-[side=bottom]:-top-[7px] data-[side=left]:right-[-11px] data-[side=left]:rotate-90 data-[side=right]:left-[-11px] data-[side=right]:-rotate-90 data-[side=top]:-bottom-[7px] data-[side=top]:rotate-180">
              <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden className="text-border">
                <path
                  d="M0 8L8 0L16 8"
                  fill="var(--color-surface)"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </BasePopover.Arrow>
          )}
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

export interface PopoverTitleProps extends Omit<BasePopover.Title.Props, 'className'> {
  className?: string
}

export function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <BasePopover.Title className={cn('text-sm font-semibold text-text', className)} {...props} />
  )
}

export interface PopoverDescriptionProps extends Omit<BasePopover.Description.Props, 'className'> {
  className?: string
}

export function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <BasePopover.Description className={cn('text-sm text-text-muted', className)} {...props} />
}
