import { Tooltip as BaseTooltip } from '@base-ui-components/react/tooltip'
import type { ReactElement, ReactNode } from 'react'

import { cn } from '../../lib/cn'

/** Mount once near the app root so tooltips share hover delay and grouping. */
export const TooltipProvider = BaseTooltip.Provider

export interface TooltipProps extends Omit<BaseTooltip.Root.Props, 'children'> {
  content: ReactNode
  /** The trigger element. Must accept a ref and spread props (all Shalgam buttons do). */
  children: ReactElement<Record<string, unknown>>
  side?: BaseTooltip.Positioner.Props['side']
  align?: BaseTooltip.Positioner.Props['align']
  sideOffset?: number
  className?: string
}

/**
 * Supplementary text on hover/focus. Never put essential information in a
 * tooltip — icon-only buttons still need `aria-label`.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  sideOffset = 6,
  className,
  ...props
}: TooltipProps) {
  return (
    <BaseTooltip.Root {...props}>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="z-[60]"
        >
          <BaseTooltip.Popup
            className={cn(
              'max-w-64 rounded-md bg-surface-inverse px-2.5 py-1.5 text-xs font-medium text-text-inverse shadow-md',
              'origin-[var(--transform-origin)] transition-[transform,opacity] duration-100 ease-out-soft',
              'data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              className,
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
