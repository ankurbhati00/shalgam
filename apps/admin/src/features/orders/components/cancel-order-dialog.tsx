import type { Order } from '@shalgam/types'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Radio,
  RadioGroup,
} from '@shalgam/ui'
import { useState } from 'react'

import { useCancelOrder } from '../api/queries'

const REASONS = [
  'Customer requested cancellation',
  'Items out of stock',
  'Address not serviceable',
  'Payment issue',
  'Cancelled by Shalgam',
] as const

export interface CancelOrderDialogProps {
  order: Pick<Order, 'id' | 'number'> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Asks for a cancellation reason before cancelling; the reason lands on the order timeline. */
export function CancelOrderDialog({ order, open, onOpenChange }: CancelOrderDialogProps) {
  const cancel = useCancelOrder()
  const [reason, setReason] = useState<string>(REASONS[0])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Cancel order {order?.number}?</DialogTitle>
          <DialogDescription>
            Stock is released and any prepaid amount is refunded to the original method.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <RadioGroup aria-label="Cancellation reason" value={reason} onValueChange={setReason}>
            {REASONS.map((option) => (
              <Radio key={option} value={option} label={option} />
            ))}
          </RadioGroup>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={cancel.isPending}>
            Keep order
          </Button>
          <Button
            variant="danger"
            loading={cancel.isPending}
            loadingText="Cancelling…"
            onClick={async () => {
              if (!order) return
              try {
                await cancel.mutateAsync({ id: order.id, reason })
                onOpenChange(false)
              } catch {
                // The mutation hook already toasts the failure.
              }
            }}
          >
            Cancel order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
