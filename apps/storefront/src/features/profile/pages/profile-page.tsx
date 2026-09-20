import type { Address } from '@shalgam/types'
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Container,
  EmptyState,
  Heading,
  IconButton,
  Skeleton,
  Text,
  toast,
} from '@shalgam/ui'
import { ClipboardList, LogOut, Pencil, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { useAddresses, useDeleteAddress } from '../../addresses/api/queries'
import { AddressDialog } from '../../addresses/components/address-dialog'
import { AddressSummary } from '../../addresses/components/address-summary'
import { addressIcon } from '../../addresses/components/address-utils'
import { useCurrentUser } from '../../session/api/queries'

export function ProfilePage() {
  const { data: user, isPending } = useCurrentUser()
  const { data: addresses, isPending: addressesPending } = useAddresses()
  const deleteAddress = useDeleteAddress()
  const [dialog, setDialog] = useState<{ open: boolean; address?: Address }>({ open: false })
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null)

  return (
    <Container size="md" className="space-y-5 py-6 sm:py-8">
      <Heading level={1} size="xl">
        Profile
      </Heading>
      <Card className="flex items-center gap-4">
        {isPending || !user ? (
          <>
            <Skeleton shape="circle" className="size-14" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton shape="text" className="w-56" />
            </div>
          </>
        ) : (
          <>
            <Avatar name={user.name} src={user.avatarUrl} size="xl" />
            <div className="min-w-0 flex-1">
              <Text as="p" size="lg" weight="semibold">
                {user.name}
              </Text>
              <Text as="p" size="sm" tone="muted" className="truncate">
                {user.email}
              </Text>
              <Text as="p" size="sm" tone="muted">
                {user.phone}
              </Text>
            </div>
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<ClipboardList />}
              render={<Link to="/orders" />}
              className="hidden sm:inline-flex"
            >
              Orders
            </Button>
          </>
        )}
      </Card>

      <Card>
        <CardHeader
          actions={
            <Button
              size="sm"
              variant="outline"
              leadingIcon={<Plus />}
              onClick={() => setDialog({ open: true })}
            >
              Add
            </Button>
          }
        >
          <CardTitle>Saved addresses</CardTitle>
        </CardHeader>
        <div className="mt-4">
          {addressesPending ? (
            <div className="space-y-2">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <EmptyState
              size="sm"
              title="No addresses yet"
              description="Add one to speed up checkout."
            />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {addresses.map((address) => (
                <li key={address.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-text-muted [&_svg]:size-4">
                    {addressIcon(address.label)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <AddressSummary address={address} />
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <IconButton
                      aria-label={`Edit ${address.label} address`}
                      icon={<Pencil />}
                      size="sm"
                      onClick={() => setDialog({ open: true, address })}
                    />
                    <IconButton
                      aria-label={`Delete ${address.label} address`}
                      icon={<Trash />}
                      size="sm"
                      variant="danger"
                      onClick={() => setPendingDelete(address)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="flex items-center justify-between gap-3">
        <div>
          <Text as="p" size="sm" weight="semibold">
            Session
          </Text>
          <Text as="p" size="xs" tone="muted">
            Authentication is mocked in this demo.
          </Text>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<LogOut />}
          onClick={() =>
            toast.info('Sign-out is simulated', 'You are always signed in as Ananya in this demo.')
          }
        >
          Sign out
        </Button>
      </Card>

      <AddressDialog
        open={dialog.open}
        address={dialog.address}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        tone="danger"
        title="Delete this address?"
        description={
          pendingDelete
            ? `${pendingDelete.line1} will be removed from your saved addresses.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) deleteAddress.mutate(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </Container>
  )
}

export const route = { Component: ProfilePage }
