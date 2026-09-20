import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Bell,
  Bike,
  Boxes,
  ChartColumn,
  Check,
  CircleAlert,
  ClipboardList,
  CreditCard,
  Ellipsis,
  Funnel,
  House,
  LayoutDashboard,
  Leaf,
  MapPin,
  Package,
  Pencil,
  Percent,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Timer,
  Trash,
  Truck,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'

const meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

const icons = {
  House,
  Search,
  ShoppingCart,
  User,
  MapPin,
  Timer,
  Zap,
  Leaf,
  Star,
  Percent,
  Plus,
  Check,
  X,
  Pencil,
  Trash,
  Ellipsis,
  Funnel,
  LayoutDashboard,
  ClipboardList,
  Package,
  Boxes,
  Users,
  Truck,
  Bike,
  ChartColumn,
  Settings,
  Bell,
  CreditCard,
  Wallet,
  CircleAlert,
}

export const IconSet: Story = {
  name: 'Icons',
  render: () => (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-text-muted">
        Lucide, 1.75px stroke, sized with the `size-4/5/6` utilities. Icons inside buttons inherit
        size via `[&_svg]:size-*`. Icon-only controls always carry an <code>aria-label</code>;
        decorative icons are <code>aria-hidden</code>.
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {Object.entries(icons).map(([name, Icon]) => (
          <div
            key={name}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface p-3"
          >
            <Icon className="size-5 text-text" aria-hidden />
            <code className="text-2xs text-text-subtle">{name}</code>
          </div>
        ))}
      </div>
    </div>
  ),
}
