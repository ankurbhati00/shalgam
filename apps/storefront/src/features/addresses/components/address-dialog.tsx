import type { Address } from '@shalgam/types'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shalgam/ui'

import { AddressForm } from './address-form'

export interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: Address
  onSaved?: (address: Address) => void
}

export function AddressDialog({ open, onOpenChange, address, onSaved }: AddressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit address' : 'Add a new address'}</DialogTitle>
          <DialogDescription>We deliver across serviceable Bengaluru pincodes.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <AddressForm
            address={address}
            onCancel={() => onOpenChange(false)}
            onSaved={(saved) => {
              onOpenChange(false)
              onSaved?.(saved)
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
