import type { Address } from '@shalgam/types'
import { Badge } from '@shalgam/ui'
import { capitalize } from '@shalgam/utils'

import { formatAddressLines } from './address-utils'

export function AddressSummary({ address }: { address: Address }) {
  return (
    <div className="min-w-0 text-sm">
      <p className="flex items-center gap-2 font-semibold text-text">
        {capitalize(address.label)}
        {address.isDefault && (
          <Badge size="sm" tone="brand">
            Default
          </Badge>
        )}
      </p>
      <p className="text-text">
        {address.recipientName} · {address.phone}
      </p>
      <p className="text-text-muted">{formatAddressLines(address)}</p>
    </div>
  )
}
