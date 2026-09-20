import type { Meta, StoryObj } from '@storybook/react-vite'
import { Ellipsis, Filter, Pencil, Trash } from 'lucide-react'
import { useState } from 'react'

import { Button, IconButton } from '../button'
import { Checkbox } from '../checkbox'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../drawer'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { FormField, FormLabel } from '../form-field'
import { Input } from '../input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '../popover'
import { toast, ToastProvider } from '../toast'
import { Tooltip, TooltipProvider } from '../tooltip'
import {
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const meta = {
  title: 'Components/Overlays/Dialog',
  component: DialogContent,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <TooltipProvider delay={300}>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: null },
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Edit address</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit address</DialogTitle>
          <DialogDescription>Changes apply to future orders only.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <FormField name="line1">
            <FormLabel>Flat, house no., building</FormLabel>
            <Input defaultValue="Flat 604, Sunrise Residency" />
          </FormField>
          <FormField name="landmark">
            <FormLabel optional>Landmark</FormLabel>
            <Input defaultValue="Near the metro station" />
          </FormField>
          <Checkbox label="Make this my default address" defaultChecked />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={() => toast.success('Address saved')}>Save address</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

function ConfirmDemo() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <>
      <Button variant="danger-outline" leadingIcon={<Trash />} onClick={() => setOpen(true)}>
        Delete product
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Delete “Gokul Fresh Paneer 200 g”?"
        description="The product will disappear from the storefront immediately. Existing orders keep their line items."
        confirmLabel="Delete product"
        loading={loading}
        onConfirm={async () => {
          setLoading(true)
          await new Promise((r) => setTimeout(r, 900))
          setLoading(false)
          setOpen(false)
          toast.success(
            'Product deleted',
            'Gokul Fresh Paneer 200 g was removed from the catalogue.',
          )
        }}
      />
    </>
  )
}

export const Confirm: Story = {
  name: 'ConfirmDialog',
  args: { children: null },
  render: () => <ConfirmDemo />,
}

export const DrawerStory: Story = {
  name: 'Drawer',
  args: { children: null },
  render: () => (
    <div className="flex gap-3">
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" leadingIcon={<Filter />} />}>
          Filters (right)
        </DrawerTrigger>
        <DrawerContent side="right" size="sm">
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Narrow down 1,204 orders.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="space-y-3">
            <Checkbox label="Placed" defaultChecked />
            <Checkbox label="Packed" />
            <Checkbox label="Out for delivery" />
            <Checkbox label="Delivered" />
          </DrawerBody>
          <DrawerFooter className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Reset
            </Button>
            <Button className="flex-1">Apply</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>Bottom sheet</DrawerTrigger>
        <DrawerContent side="bottom">
          <DrawerHeader>
            <DrawerTitle>Choose a delivery slot</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-text-muted">Slots render here.</p>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

/** Same markup as `Default`, previewed at a phone width where the dialog rises as a bottom sheet. */
export const MobileSheet: Story = {
  name: 'Dialog on a phone',
  args: { children: null },
  globals: { viewport: { value: 'phone', isRotated: false } },
  render: Default.render,
}

/** The right-hand drawer takes the full width below `sm`; bottom sheets cap at 85dvh. */
export const MobileDrawer: Story = {
  name: 'Drawer on a phone',
  args: { children: null },
  globals: { viewport: { value: 'phone', isRotated: false } },
  render: DrawerStory.render,
}

export const PopoverAndTooltip: Story = {
  name: 'Popover & Tooltip',
  args: { children: null },
  render: () => (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Delivery info</PopoverTrigger>
        <PopoverContent arrow className="max-w-xs space-y-1">
          <PopoverTitle>Free delivery above ₹299</PopoverTitle>
          <PopoverDescription>
            Orders below that carry a ₹29 delivery fee. Handling fee of ₹9 applies to all orders.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
      <Tooltip content="Edit product">
        <IconButton aria-label="Edit product" icon={<Pencil />} variant="outline" />
      </Tooltip>
      <Tooltip content="Delete product" side="bottom">
        <IconButton aria-label="Delete product" icon={<Trash />} variant="danger" />
      </Tooltip>
    </div>
  ),
}

export const DropdownMenuStory: Story = {
  name: 'DropdownMenu',
  args: { children: null },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<IconButton aria-label="Order actions" icon={<Ellipsis />} variant="outline" />}
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Order SHL-260918-0042</DropdownMenuGroupLabel>
          <DropdownMenuItem icon={<Pencil />} onClick={() => toast.info('Opening editor')}>
            Edit order
          </DropdownMenuItem>
          <DropdownMenuItem shortcut="⌘P">Print invoice</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem defaultChecked>Notify customer</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Mark as priority</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          tone="danger"
          icon={<Trash />}
          onClick={() => toast.error('Order cancelled')}
        >
          Cancel order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const Toasts: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() => toast.success('Added to cart', 'Tomato Hybrid 500 g')}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('Payment failed', 'Your bank declined the transaction. Try UPI instead.')
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info('Rider assigned', 'Manjunath K is on the way.')}
      >
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning('Low stock', 'Only 3 units of Gokul Paneer left.')}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.show({
            title: 'Order cancelled',
            description: 'SHL-260918-0042 was cancelled.',
            action: { label: 'Undo', onClick: () => toast.success('Order restored') },
            timeout: 8000,
          })
        }
      >
        With action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          void toast.promise(new Promise((r) => setTimeout(r, 1500)), {
            loading: 'Placing order…',
            success: 'Order placed',
            error: 'Could not place order',
          })
        }
      >
        Promise
      </Button>
    </div>
  ),
}
