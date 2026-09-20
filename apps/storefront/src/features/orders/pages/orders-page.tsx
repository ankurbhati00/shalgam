import {
  Button,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  Pagination,
  Skeleton,
  Tab,
  Tabs,
  TabsList,
} from '@shalgam/ui'
import { PackageOpen } from 'lucide-react'
import { Link } from 'react-router'

import { parsePage, useSearchParamState } from '../../../hooks/use-search-param-state'
import { useMyOrders } from '../api/queries'
import { OrderCard } from '../components/order-card'

type TabValue = 'active' | 'past'

export function OrdersPage() {
  const { get, set } = useSearchParamState()
  const tab: TabValue = get('tab') === 'past' ? 'past' : 'active'
  const page = parsePage(get('page'))
  const { data, isPending, isError, refetch, isFetching } = useMyOrders({
    status:
      tab === 'active'
        ? ['placed', 'preparing', 'packed', 'out_for_delivery']
        : ['delivered', 'cancelled'],
    page,
    pageSize: 10,
  })

  return (
    <Container size="md" className="space-y-5 py-6 sm:py-8">
      <Heading level={1} size="xl">
        Your orders
      </Heading>
      <Tabs
        value={tab}
        onValueChange={(value) =>
          set({ tab: value === 'active' ? null : String(value), page: null })
        }
      >
        <TabsList aria-label="Order history">
          <Tab value="active">Active</Tab>
          <Tab value="past">Past orders</Tab>
        </TabsList>
      </Tabs>
      {isError ? (
        <ErrorState onRetry={() => void refetch()} retrying={isFetching} />
      ) : isPending ? (
        <div className="space-y-3" aria-busy>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={<PackageOpen />}
          title={tab === 'active' ? 'No active orders' : 'No past orders yet'}
          description={
            tab === 'active'
              ? 'Orders in progress will show up here with live tracking.'
              : 'Your delivered and cancelled orders will appear here.'
          }
          action={<Button render={<Link to="/" />}>Start shopping</Button>}
        />
      ) : (
        <>
          <ul className={isFetching ? 'space-y-3 opacity-70 transition-opacity' : 'space-y-3'}>
            {data.data.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                onPageChange={(next) => set({ page: next > 1 ? next : null })}
              />
            </div>
          )}
        </>
      )}
    </Container>
  )
}

export const route = { Component: OrdersPage }
