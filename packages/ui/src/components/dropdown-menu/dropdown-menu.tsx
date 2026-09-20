import { Menu as BaseMenu } from '@base-ui-components/react/menu'
import { Check } from 'lucide-react'
import type { ReactElement, ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { popupSurfaceClassName } from '../popover/popover'

export const DropdownMenu = BaseMenu.Root
export const DropdownMenuTrigger = BaseMenu.Trigger
export const DropdownMenuGroup = BaseMenu.Group
export const DropdownMenuRadioGroup = BaseMenu.RadioGroup

export interface DropdownMenuContentProps extends Omit<BaseMenu.Positioner.Props, 'className'> {
  className?: string
  children: ReactNode
}

export function DropdownMenuContent({
  className,
  children,
  side = 'bottom',
  align = 'end',
  sideOffset = 6,
  ...props
}: DropdownMenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-50 outline-none"
        {...props}
      >
        <BaseMenu.Popup className={cn(popupSurfaceClassName, 'min-w-48 p-1', className)}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

export const menuItemClassName = cn(
  'flex w-full cursor-default items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-text outline-none select-none',
  'data-[disabled]:opacity-50 data-[highlighted]:bg-surface-muted [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-text-muted',
)

export interface DropdownMenuItemProps extends Omit<BaseMenu.Item.Props, 'className'> {
  className?: string
  icon?: ReactElement
  /** Right-aligned hint such as a keyboard shortcut. */
  shortcut?: string
  tone?: 'default' | 'danger'
}

export function DropdownMenuItem({
  className,
  icon,
  shortcut,
  tone = 'default',
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <BaseMenu.Item
      className={cn(
        menuItemClassName,
        tone === 'danger' &&
          'text-danger-text data-[highlighted]:bg-danger-muted [&_svg]:text-danger-text',
        className,
      )}
      {...props}
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <span className="text-xs text-text-subtle">{shortcut}</span>}
    </BaseMenu.Item>
  )
}

export interface DropdownMenuCheckboxItemProps extends Omit<
  BaseMenu.CheckboxItem.Props,
  'className'
> {
  className?: string
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem className={cn(menuItemClassName, 'pl-2', className)} {...props}>
      <span
        aria-hidden
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-xs border border-border-strong bg-surface [[data-checked]_&]:border-primary [[data-checked]_&]:bg-primary"
      >
        <BaseMenu.CheckboxItemIndicator className="text-primary-foreground [&_svg]:size-3 [&_svg]:text-primary-foreground">
          <Check strokeWidth={3} aria-hidden />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      <span className="flex-1 truncate">{children}</span>
    </BaseMenu.CheckboxItem>
  )
}

export interface DropdownMenuRadioItemProps extends Omit<BaseMenu.RadioItem.Props, 'className'> {
  className?: string
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem className={cn(menuItemClassName, 'pl-2', className)} {...props}>
      <span aria-hidden className="inline-flex size-4 shrink-0 items-center justify-center">
        <BaseMenu.RadioItemIndicator className="size-2 rounded-full bg-primary-strong" />
      </span>
      <span className="flex-1 truncate">{children}</span>
    </BaseMenu.RadioItem>
  )
}

export interface DropdownMenuGroupLabelProps extends Omit<BaseMenu.GroupLabel.Props, 'className'> {
  className?: string
}

export function DropdownMenuGroupLabel({ className, ...props }: DropdownMenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel
      className={cn(
        'px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wide text-text-subtle uppercase',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <BaseMenu.Separator className={cn('my-1 h-px bg-border', className)} />
}
