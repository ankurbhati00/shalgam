import type { Order } from '@shalgam/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@shalgam/ui'
import { ArrowRight, Bike, CircleX, Ellipsis, Eye } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { useUpdateOrderStatus } from '../api/queries'
import { canCancelOrder, nextOrderStatus, statusLabel } from '../lib/order-status'
import { AssignRiderDialog } from './assign-rider-dialog'
import { CancelOrderDialog } from './cancel-order-dialog'

/** Row-level actions for the orders table. */
export function OrderActionsMenu({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [riderOpen, setRiderOpen] = useState(false)
  const next = nextOrderStatus(order.status)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              aria-label={`Actions for order ${order.number}`}
              icon={<Ellipsis />}
              size="sm"
              variant="ghost"
            />
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem icon={<Eye />} render={<Link to={`/orders/${order.id}`} />}>
            View order
          </DropdownMenuItem>
          {next && (
            <DropdownMenuItem
              icon={<ArrowRight />}
              onClick={() => updateStatus.mutate({ id: order.id, status: next })}
            >
              Mark {statusLabel(next).toLowerCase()}
            </DropdownMenuItem>
          )}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <DropdownMenuItem icon={<Bike />} onClick={() => setRiderOpen(true)}>
              Assign rider
            </DropdownMenuItem>
          )}
          {canCancelOrder(order.status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                icon={<CircleX />}
                tone="danger"
                onClick={() => setCancelOpen(true)}
              >
                Cancel order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CancelOrderDialog order={order} open={cancelOpen} onOpenChange={setCancelOpen} />
      <AssignRiderDialog order={order} open={riderOpen} onOpenChange={setRiderOpen} />
    </>
  )
}
