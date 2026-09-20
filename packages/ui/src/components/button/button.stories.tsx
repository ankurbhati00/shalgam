import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Plus, ShoppingCart, Trash } from 'lucide-react'

import { Button } from './button'
import { IconButton } from './icon-button'

const meta = {
  title: 'Components/Buttons/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Add to cart',
    variant: 'primary',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'soft',
        'danger',
        'danger-outline',
        'link',
      ],
    },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The primary interactive control. Use `primary` for the single most important action on a screen, `outline`/`ghost` for secondary actions, and `danger` for destructive ones. Built on Base UI Button so it keeps native semantics and can render as a link via `render`.',
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="soft">
        Soft
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="danger-outline">
        Danger outline
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">
        Extra small
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} leadingIcon={<ShoppingCart />}>
        Add to cart
      </Button>
      <Button {...args} variant="outline" trailingIcon={<ArrowRight />}>
        Continue
      </Button>
      <Button {...args} variant="danger-outline" leadingIcon={<Trash />}>
        Remove
      </Button>
    </div>
  ),
}

export const Loading: Story = {
  args: { loading: true, loadingText: 'Placing order…' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const FullWidth: Story = {
  args: { fullWidth: true, size: 'lg' },
  parameters: { layout: 'padded' },
}

export const AsLink: Story = {
  name: 'Rendered as a link',
  render: (args) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content -- content comes from Button
    <Button {...args} variant="outline" render={<a href="#orders" />}>
      View orders
    </Button>
  ),
}

export const IconButtons: Story = {
  name: 'IconButton',
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton aria-label="Add" icon={<Plus />} variant="primary" />
      <IconButton aria-label="Add" icon={<Plus />} variant="outline" />
      <IconButton aria-label="Add" icon={<Plus />} variant="ghost" />
      <IconButton aria-label="Add" icon={<Plus />} variant="soft" />
      <IconButton aria-label="Delete" icon={<Trash />} variant="danger" />
      <IconButton aria-label="Add" icon={<Plus />} size="sm" variant="outline" shape="square" />
      <IconButton aria-label="Loading" icon={<Plus />} loading variant="outline" />
    </div>
  ),
}
