import {
  Avatar,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  Skeleton,
  StatusBadge,
} from '@shalgam/ui'
import { Star } from 'lucide-react'

import { partnerAvailabilityMap, VEHICLE_LABELS } from '../../../components/status-maps'
import { useDeliveryPartners } from '../api/queries'

/** Who is on shift, where, and how busy they are. */
export function PartnerRoster() {
  const { data: partners, isPending, isError, refetch } = useDeliveryPartners()
  const available = partners?.filter((partner) => partner.availability === 'available').length ?? 0
  return (
    <Card padding="none">
      <CardHeader className="px-4 pt-4 sm:px-5">
        <CardTitle>Partner roster</CardTitle>
        <CardDescription>
          {partners ? `${available} of ${partners.length} available right now` : 'Riders on shift'}
        </CardDescription>
      </CardHeader>
      <div className="mt-3 border-t border-border-subtle">
        {isError ? (
          <ErrorState size="sm" onRetry={() => void refetch()} />
        ) : isPending ? (
          <ul className="divide-y divide-border-subtle" aria-busy>
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                <Skeleton shape="circle" className="size-8" />
                <Skeleton shape="text" className="w-32" />
              </li>
            ))}
          </ul>
        ) : (
          <ul
            // The list scrolls, so it must be keyboard-reachable (axe: scrollable-region-focusable).
            // jsx-a11y cannot see the overflow and flags the tabIndex.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            aria-label="Delivery partners"
            className="max-h-[32rem] scrollbar-thin divide-y divide-border-subtle overflow-y-auto focus-ring"
          >
            {partners
              .slice()
              .sort(
                (a, b) =>
                  a.availability.localeCompare(b.availability) || a.name.localeCompare(b.name),
              )
              .map((partner) => (
                <li key={partner.id} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                  <Avatar name={partner.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{partner.name}</p>
                    <p className="truncate text-xs text-text-muted">
                      {VEHICLE_LABELS[partner.vehicle]} · {partner.zone} · {partner.deliveriesToday}{' '}
                      today
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-xs text-text-muted tabular">
                    <Star aria-hidden className="size-3 text-warning-600" />
                    {partner.rating.toFixed(1)}
                  </span>
                  <StatusBadge
                    status={partner.availability}
                    map={partnerAvailabilityMap}
                    size="sm"
                  />
                </li>
              ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
