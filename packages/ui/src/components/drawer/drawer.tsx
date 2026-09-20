import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { IconButton } from '../button'
import { backdropClassName } from '../dialog/dialog'

export const Drawer = BaseDialog.Root
export const DrawerTrigger = BaseDialog.Trigger
export const DrawerClose = BaseDialog.Close

export const drawerPopupVariants = cva(
  [
    'fixed z-50 flex flex-col bg-surface text-text shadow-xl outline-none',
    'transition-transform duration-250 ease-out-soft',
  ],
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-dvh w-full data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full sm:border-l sm:border-border',
        left: 'inset-y-0 left-0 h-dvh w-full data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full sm:border-r sm:border-border',
        bottom:
          'inset-x-0 bottom-0 max-h-[85dvh] w-full rounded-t-2xl data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    compoundVariants: [
      { side: ['right', 'left'], size: 'sm', className: 'sm:max-w-sm' },
      { side: ['right', 'left'], size: 'md', className: 'sm:max-w-md' },
      { side: ['right', 'left'], size: 'lg', className: 'sm:max-w-xl' },
    ],
    defaultVariants: { side: 'right', size: 'md' },
  },
)

export interface DrawerContentProps
  extends Omit<BaseDialog.Popup.Props, 'className'>, VariantProps<typeof drawerPopupVariants> {
  className?: string
  children: ReactNode
  hideClose?: boolean
}

/** Side sheet (or bottom sheet) built on Dialog: cart, filters, detail panels. */
export function DrawerContent({
  className,
  side,
  size,
  children,
  hideClose,
  ...props
}: DrawerContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={backdropClassName} />
      <BaseDialog.Popup className={cn(drawerPopupVariants({ side, size }), className)} {...props}>
        {!hideClose && (
          <BaseDialog.Close
            render={
              <IconButton
                aria-label="Close"
                icon={<X />}
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 z-10"
              />
            }
          />
        )}
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function DrawerHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-border-subtle px-5 py-4 pr-14', className)}
      {...props}
    />
  )
}

export interface DrawerTitleProps extends Omit<BaseDialog.Title.Props, 'className'> {
  className?: string
}

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <BaseDialog.Title
      className={cn('text-base leading-tight font-semibold text-text', className)}
      {...props}
    />
  )
}

export interface DrawerDescriptionProps extends Omit<BaseDialog.Description.Props, 'className'> {
  className?: string
}

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return <BaseDialog.Description className={cn('text-sm text-text-muted', className)} {...props} />
}

export function DrawerBody({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)} {...props} />
}

export function DrawerFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('border-t border-border-subtle px-5 py-4 safe-bottom', className)}
      {...props}
    />
  )
}
