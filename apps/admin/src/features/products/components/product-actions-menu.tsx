import type { Product } from '@shalgam/types'
import {
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@shalgam/ui'
import { Archive, ArchiveRestore, Ellipsis, Pencil, Trash } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { useDeleteProduct, useUpdateProduct } from '../api/queries'

export function ProductActionsMenu({ product }: { product: Product }) {
  const update = useUpdateProduct()
  const remove = useDeleteProduct()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const archived = product.status === 'archived'
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <IconButton
              aria-label={`Actions for ${product.name}`}
              icon={<Ellipsis />}
              size="sm"
              variant="ghost"
            />
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem icon={<Pencil />} render={<Link to={`/products/${product.id}/edit`} />}>
            Edit product
          </DropdownMenuItem>
          <DropdownMenuItem
            icon={archived ? <ArchiveRestore /> : <Archive />}
            onClick={() =>
              update.mutate({ id: product.id, input: { status: archived ? 'active' : 'archived' } })
            }
          >
            {archived ? 'Activate' : 'Archive'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem icon={<Trash />} tone="danger" onClick={() => setConfirmOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        title={`Delete ${product.name}?`}
        description="The product and its inventory record are removed. Past orders keep their line items."
        confirmLabel="Delete product"
        loading={remove.isPending}
        onConfirm={async () => {
          try {
            await remove.mutateAsync(product.id)
            setConfirmOpen(false)
          } catch {
            // Toasted by the hook.
          }
        }}
      />
    </>
  )
}
