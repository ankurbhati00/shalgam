import { AlertDialog as BaseAlertDialog } from '@base-ui-components/react/alert-dialog'
import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button, type ButtonProps, IconButton } from '../button'

/** Root: owns open state. Controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`). */
export const Dialog = BaseDialog.Root
export const DialogTrigger = BaseDialog.Trigger
export const DialogClose = BaseDialog.Close

export const backdropClassName = cn(
  'fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]',
  'transition-opacity duration-200 ease-out-soft data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
)

export const dialogPopupVariants = cva(
  [
    'relative flex w-full flex-col bg-surface text-text shadow-xl outline-none',
    'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)]',
    'rounded-t-2xl sm:rounded-2xl',
    'transition-[transform,opacity] duration-200 ease-out-soft',
    'data-[ending-style]:translate-y-6 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-6 data-[starting-style]:opacity-0',
    'sm:data-[ending-style]:translate-y-0 sm:data-[ending-style]:scale-95 sm:data-[starting-style]:translate-y-0 sm:data-[starting-style]:scale-95',
  ],
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-lg',
        lg: 'sm:max-w-2xl',
        xl: 'sm:max-w-4xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

export interface DialogContentProps
  extends Omit<BaseDialog.Popup.Props, 'className'>, VariantProps<typeof dialogPopupVariants> {
  className?: string
  children: ReactNode
  /** Hide the corner close button (e.g. when the footer already offers one). */
  hideClose?: boolean
}

/**
 * Portal + backdrop + popup. On phones it rises as a bottom sheet; on larger
 * screens it is centred. Focus is trapped and restored by Base UI.
 */
export function DialogContent({
  className,
  size,
  children,
  hideClose,
  ...props
}: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={backdropClassName} />
      <BaseDialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-6">
        <BaseDialog.Popup className={cn(dialogPopupVariants({ size }), className)} {...props}>
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
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

export function DialogHeader({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-1 px-5 pt-5 pr-14 sm:px-6 sm:pt-6', className)}
      {...props}
    />
  )
}

export interface DialogTitleProps extends Omit<BaseDialog.Title.Props, 'className'> {
  className?: string
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      className={cn('text-lg leading-tight font-semibold text-text', className)}
      {...props}
    />
  )
}

export interface DialogDescriptionProps extends Omit<BaseDialog.Description.Props, 'className'> {
  className?: string
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <BaseDialog.Description className={cn('text-sm text-text-muted', className)} {...props} />
}

/** Scrollable middle section. */
export function DialogBody({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6', className)} {...props} />
  )
}

export function DialogFooter({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-border-subtle px-5 py-4 safe-bottom sm:flex-row sm:justify-end sm:px-6',
        className,
      )}
      {...props}
    />
  )
}

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode
  /** `danger` styles the confirm button for destructive actions. */
  tone?: 'default' | 'danger'
  /** Return a promise to keep the dialog open with a spinner until it settles. */
  onConfirm: () => unknown
  loading?: boolean
  confirmProps?: Partial<ButtonProps>
}

/**
 * Alert dialog for confirmations. Cannot be dismissed by clicking outside,
 * per the WAI-ARIA alertdialog pattern, so the user must make a choice.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  loading = false,
  confirmProps,
}: ConfirmDialogProps) {
  return (
    <BaseAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop className={backdropClassName} />
        <BaseAlertDialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto sm:items-center sm:p-6">
          <BaseAlertDialog.Popup className={cn(dialogPopupVariants({ size: 'sm' }), 'sm:max-w-md')}>
            <div className="flex flex-col gap-1 px-5 pt-5 sm:px-6 sm:pt-6">
              <BaseAlertDialog.Title className="text-lg leading-tight font-semibold text-text">
                {title}
              </BaseAlertDialog.Title>
              {description && (
                <BaseAlertDialog.Description className="text-sm text-text-muted">
                  {description}
                </BaseAlertDialog.Description>
              )}
            </div>
            <DialogFooter className="mt-5 border-t-0 pt-0">
              <BaseAlertDialog.Close render={<Button variant="outline" disabled={loading} />}>
                {cancelLabel}
              </BaseAlertDialog.Close>
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                loading={loading}
                onClick={() => void onConfirm()}
                {...confirmProps}
              >
                {confirmLabel}
              </Button>
            </DialogFooter>
          </BaseAlertDialog.Popup>
        </BaseAlertDialog.Viewport>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  )
}
