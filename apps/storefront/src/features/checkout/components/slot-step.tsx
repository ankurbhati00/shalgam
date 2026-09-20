import type { DeliverySlot } from '@shalgam/types'
import { Badge, RadioCard, RadioGroup, Skeleton } from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { CalendarClock, Zap } from 'lucide-react'

export interface SlotStepProps {
  slots: DeliverySlot[] | undefined
  loading?: boolean
  value: string | null
  onChange: (slotId: string) => void
}

export function SlotStep({ slots, loading, value, onChange }: SlotStepProps) {
  if (loading || !slots) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
    )
  }
  return (
    <RadioGroup aria-label="Delivery slot" value={value ?? ''} onValueChange={onChange}>
      {slots.map((slot) => (
        <RadioCard
          key={slot.id}
          value={slot.id}
          disabled={!slot.isAvailable}
          icon={slot.isExpress ? <Zap /> : <CalendarClock />}
          title={slot.label}
          description={
            slot.isExpress
              ? 'Fastest option — a rider picks up as soon as we pack.'
              : 'Scheduled delivery'
          }
          addon={slot.fee > 0 ? formatINR(slot.fee) : <Badge tone="success">Free</Badge>}
        />
      ))}
    </RadioGroup>
  )
}
