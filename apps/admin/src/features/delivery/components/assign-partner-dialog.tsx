import type { Delivery } from '@shalgam/types'
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

import { partnerAvailabilityMap, VEHICLE_LABELS } from '../../../components/status-maps'
import { useAssignDeliveryPartner, useDeliveryPartners } from '../api/queries'

export interface AssignPartnerDialogProps {
  delivery: Delivery | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignPartnerDialog({ delivery, open, onOpenChange }: AssignPartnerDialogProps) {
  const { data: partners, isPending } = useDeliveryPartners()
  const assign = useAssignDeliveryPartner()
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [syncedId, setSyncedId] = useState(delivery?.id)
  if (delivery?.id !== syncedId) {
    setSyncedId(delivery?.id)
    setPartnerId(delivery?.partnerId ?? null)
  }

  const options = (partners ?? [])
    .slice()
    .sort(
      (a, b) =>
        Number(a.availability !== 'available') - Number(b.availability !== 'available') ||
        a.name.localeCompare(b.name),
    )
    .map((partner) => ({
      value: partner.id,
      label: partner.name,
      description: `${partnerAvailabilityMap[partner.availability].label} · ${VEHICLE_LABELS[partner.vehicle]} · ${partner.zone}`,
      disabled: partner.availability === 'offline',
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Assign a partner</DialogTitle>
          <DialogDescription>
            {delivery
              ? `${delivery.orderNumber} · ${delivery.zone} · ${delivery.distanceKm.toFixed(1)} km`
              : ''}
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
              <FormDescription>
                Available partners are listed first; offline partners are disabled.
              </FormDescription>
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
            disabled={!partnerId || partnerId === delivery?.partnerId}
            onClick={async () => {
              if (!delivery || !partnerId) return
              try {
                await assign.mutateAsync({ id: delivery.id, partnerId })
                onOpenChange(false)
              } catch {
                // Toasted by the hook.
              }
            }}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
