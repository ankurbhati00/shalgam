import type { Address } from '@shalgam/types'
import { Button, EmptyState, IconButton, RadioCard, RadioGroup, Skeleton } from '@shalgam/ui'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'

import { useAddresses } from '../../addresses/api/queries'
import { AddressDialog } from '../../addresses/components/address-dialog'
import { addressIcon, formatAddressLines } from '../../addresses/components/address-utils'

export interface AddressStepProps {
  value: string | null
  onChange: (addressId: string) => void
}

export function AddressStep({ value, onChange }: AddressStepProps) {
  const { data: addresses, isPending } = useAddresses()
  const [dialog, setDialog] = useState<{ open: boolean; address?: Address }>({ open: false })

  return (
    <div className="space-y-3">
      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-20 rounded-lg" />
        </div>
      ) : addresses && addresses.length > 0 ? (
        <RadioGroup aria-label="Delivery address" value={value ?? ''} onValueChange={onChange}>
          {addresses.map((address) => (
            <div key={address.id} className="relative">
              <RadioCard
                value={address.id}
                icon={addressIcon(address.label)}
                title={`${address.label === 'home' ? 'Home' : address.label === 'work' ? 'Work' : 'Other'} · ${address.recipientName}`}
                description={formatAddressLines(address)}
                className="pr-24"
              />
              <IconButton
                aria-label={`Edit ${address.label} address`}
                icon={<Pencil />}
                size="sm"
                variant="ghost"
                className="absolute top-1/2 right-10 -translate-y-1/2"
                onClick={() => setDialog({ open: true, address })}
              />
            </div>
          ))}
        </RadioGroup>
      ) : (
        <EmptyState
          size="sm"
          title="No saved addresses"
          description="Add where we should deliver."
        />
      )}
      <Button
        variant="outline"
        size="sm"
        leadingIcon={<Plus />}
        onClick={() => setDialog({ open: true })}
      >
        Add new address
      </Button>
      <AddressDialog
        open={dialog.open}
        address={dialog.address}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        onSaved={(saved) => onChange(saved.id)}
      />
    </div>
  )
}
