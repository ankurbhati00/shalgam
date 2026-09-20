import type { Meta, StoryObj } from '@storybook/react-vite'
import { IndianRupee, Mail, Phone } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../button'
import { FormDescription, FormField, FormLabel, FormMessage } from '../form-field'
import { SearchInput } from '../search-input'
import { Textarea } from '../textarea'
import { Input } from './input'

const meta = {
  title: 'Components/Forms/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Flat, house no., building', size: 'md' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: (args) => (
    <div className="space-y-3">
      <Input {...args} size="sm" placeholder="Small" />
      <Input {...args} size="md" placeholder="Medium" />
      <Input {...args} size="lg" placeholder="Large" />
    </div>
  ),
}

export const WithIconsAndPrefix: Story = {
  render: (args) => (
    <div className="space-y-3">
      <Input {...args} leadingIcon={<Mail />} placeholder="you@example.com" type="email" />
      <Input
        {...args}
        prefix="+91"
        leadingIcon={<Phone />}
        placeholder="98765 43210"
        inputMode="tel"
      />
      <Input
        {...args}
        prefix="₹"
        placeholder="0"
        inputMode="decimal"
        trailingElement={<span className="text-xs">per kg</span>}
      />
      <Input {...args} leadingIcon={<IndianRupee />} placeholder="Enter MRP" />
    </div>
  ),
}

export const States: Story = {
  render: (args) => (
    <div className="space-y-3">
      <Input {...args} defaultValue="Ananya Rao" />
      <Input {...args} invalid defaultValue="98765" />
      <Input {...args} disabled defaultValue="Disabled" />
      <Input {...args} readOnly defaultValue="Read only" />
    </div>
  ),
}

export const InsideFormField: Story = {
  name: 'With FormField (label, description, error)',
  render: () => (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <FormField name="name">
        <FormLabel required>Recipient name</FormLabel>
        <Input placeholder="Who should we hand the bag to?" />
        <FormDescription>Shown to the delivery partner.</FormDescription>
      </FormField>
      <FormField name="pincode" invalid>
        <FormLabel required>Pincode</FormLabel>
        <Input defaultValue="5600" inputMode="numeric" />
        <FormMessage>Enter a 6-digit pincode.</FormMessage>
      </FormField>
      <FormField name="note">
        <FormLabel optional>Delivery note</FormLabel>
        <Textarea placeholder="Leave at the door, call on arrival…" />
      </FormField>
      <Button type="submit">Save address</Button>
    </form>
  ),
}

function SearchDemo() {
  const [value, setValue] = useState('')
  return (
    <div className="space-y-3">
      <SearchInput
        value={value}
        onValueChange={setValue}
        placeholder="Search for milk, atta, bananas…"
      />
      <SearchInput
        value={value}
        onValueChange={setValue}
        rounded
        size="lg"
        placeholder="Search Shalgam"
      />
      <p className="text-sm text-text-muted">Value: {value || '—'}</p>
    </div>
  )
}

export const SearchInputStory: Story = {
  name: 'SearchInput',
  render: () => <SearchDemo />,
}
