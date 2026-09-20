import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorState,
  OrderStatus,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { RelativeTime } from '../../../components/relative-time'
import { useOrders } from '../../orders/api/queries'

const PARAMS = { pageSize: 8, sort: 'placedAt', order: 'desc' } as const

/** The eight most recent orders, linking into the order detail. */
export function RecentOrders() {
  const { data, isPending, isError, refetch } = useOrders(PARAMS)
  return (
    <Card padding="none">
      <CardHeader
        className="px-4 pt-4 sm:px-5"
        actions={
          <Button
            variant="ghost"
            size="sm"
            trailingIcon={<ArrowRight />}
            render={<Link to="/orders" />}
          >
            All orders
          </Button>
        }
      >
        <CardTitle>Recent orders</CardTitle>
        <CardDescription>The latest eight orders placed.</CardDescription>
      </CardHeader>
      <div className="mt-3">
        {isError ? (
          <ErrorState size="sm" onRetry={() => void refetch()} />
        ) : (
          <TableContainer className="rounded-none border-x-0 border-b-0">
            <Table density="compact">
              <caption className="sr-only">Recent orders</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="end">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Placed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 8 }, (_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 5 }, (_, cell) => (
                          <TableCell
                            key={cell}
                            className={cell === 4 ? 'hidden sm:table-cell' : undefined}
                          >
                            <Skeleton shape="text" className="w-20" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data.data.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            to={`/orders/${order.id}`}
                            className="rounded-xs font-medium text-text tabular focus-ring hover:text-primary-strong hover:underline"
                          >
                            {order.number}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-40 truncate">{order.customer.name}</TableCell>
                        <TableCell>
                          <OrderStatus status={order.status} size="sm" />
                        </TableCell>
                        <TableCell align="end" numeric className="font-medium">
                          {formatINR(order.pricing.total)}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-text-muted sm:table-cell">
                          <RelativeTime value={order.placedAt} />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </Card>
  )
}
