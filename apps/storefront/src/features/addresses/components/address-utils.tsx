import type { Address } from '@shalgam/types'
import { Briefcase, House, MapPin } from 'lucide-react'

export function addressIcon(label: Address['label']) {
  return label === 'home' ? <House /> : label === 'work' ? <Briefcase /> : <MapPin />
}

export function formatAddressLines(address: Address): string {
  return [address.line1, address.line2, address.landmark, `${address.city} ${address.pincode}`]
    .filter(Boolean)
    .join(', ')
}
