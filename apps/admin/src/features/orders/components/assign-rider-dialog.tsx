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
  FormDescription,
  FormField,
  FormLabel,
  Select,
  Skeleton,
} from '@shalgam/ui'
import { useState } from 'react'

import { partnerAvailabilityMap } from '../../../components/status-maps'
import { useDeliveryPartners } from '../../delivery/api/queries'
import { useAssignRider } from '../api/queries'

export interface AssignRiderDialogProps {
  order: Pick<Order, 'id' | 'number' | 'deliveryPartnerId'> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignRiderDialog({ order, open, onOpenChange }: AssignRiderDialogProps) {
  const { data: partners, isPending } = useDeliveryPartners()
  const assign = useAssignRider()
  const [partnerId, setPartnerId] = useState<string | null>(order?.deliveryPartnerId ?? null)
  const [syncedOrderId, setSyncedOrderId] = useState(order?.id)
  if (order?.id !== syncedOrderId) {
    setSyncedOrderId(order?.id)
    setPartnerId(order?.deliveryPartnerId ?? null)
  }

  const options = (partners ?? [])
    .slice()
    .sort(
      (a, b) =>
        (a.availability === 'available' ? -1 : 1) - (b.availability === 'available' ? -1 : 1) ||
        a.name.localeCompare(b.name),
    )
    .map((partner) => ({
      value: partner.id,
      label: partner.name,
      description: `${partnerAvailabilityMap[partner.availability].label} · ${partner.zone} · ★ ${partner.rating.toFixed(1)}`,
      disabled: partner.availability === 'offline',
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Assign a rider</DialogTitle>
          <DialogDescription>
            Order {order?.number}. Offline partners cannot be assigned.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isPending ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <FormField name="partnerId">
              <FormLabel>Delivery partner</FormLabel>
              <Select
                aria-label="Delivery partner"
                options={options}
                value={partnerId}
                onValueChange={setPartnerId}
                placeholder="Choose a partner"
              />
              <FormDescription>Available partners are listed first.</FormDescription>
            </FormField>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assign.isPending}>
            Cancel
          </Button>
          <Button
            loading={assign.isPending}
            loadingText="Assigning…"
            disabled={!partnerId || partnerId === order?.deliveryPartnerId}
            onClick={async () => {
              if (!order || !partnerId) return
              try {
                await assign.mutateAsync({ id: order.id, partnerId })
                onOpenChange(false)
              } catch {
                // Toasted by the hook.
              }
            }}
          >
            Assign rider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
