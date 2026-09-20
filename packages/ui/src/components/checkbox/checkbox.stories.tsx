import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bike, CreditCard, Smartphone, Wallet } from 'lucide-react'
import { useState } from 'react'

import { FormDescription, FormField, FormLabel } from '../form-field'
import { Radio, RadioCard, RadioGroup } from '../radio'
import { Switch } from '../switch'
import { Checkbox } from './checkbox'

const meta = {
  title: 'Components/Forms/Checkbox, Radio & Switch',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Checkboxes: Story = {
  render: () => (
    <div className="space-y-3">
      <Checkbox label="Send me order updates on WhatsApp" defaultChecked />
      <Checkbox label="No-contact delivery" description="The rider leaves the bag at your door." />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Invalid" invalid />
      <Checkbox size="sm" label="Small checkbox" />
    </div>
  ),
}

function IndeterminateDemo() {
  const [items, setItems] = useState([true, false, true])
  const all = items.every(Boolean)
  const some = items.some(Boolean) && !all
  return (
    <div className="space-y-2">
      <Checkbox
        label="Select all orders"
        checked={all}
        indeterminate={some}
        onCheckedChange={(checked) => setItems(items.map(() => checked))}
      />
      <div className="ml-6 space-y-2">
        {items.map((checked, index) => (
          <Checkbox
            key={index}
            label={`SHL-260918-00${index + 1}`}
            checked={checked}
            onCheckedChange={(next) => setItems(items.map((v, i) => (i === index ? next : v)))}
          />
        ))}
      </div>
    </div>
  )
}

export const IndeterminateSelection: Story = { render: () => <IndeterminateDemo /> }

export const Radios: Story = {
  render: () => (
    <FormField name="tip">
      <FormLabel>Tip your rider</FormLabel>
      <RadioGroup defaultValue="20" orientation="horizontal" aria-label="Tip amount">
        <Radio value="0" label="No tip" />
        <Radio value="10" label="₹10" />
        <Radio value="20" label="₹20" />
        <Radio value="30" label="₹30" />
      </RadioGroup>
      <FormDescription>100% of the tip goes to your delivery partner.</FormDescription>
    </FormField>
  ),
}

export const RadioCards: Story = {
  render: () => (
    <RadioGroup defaultValue="upi" aria-label="Payment method">
      <RadioCard
        value="upi"
        icon={<Smartphone />}
        title="UPI"
        description="Google Pay, PhonePe, Paytm"
        addon="Instant"
      />
      <RadioCard
        value="card"
        icon={<CreditCard />}
        title="Credit / debit card"
        description="Visa, Mastercard, RuPay"
      />
      <RadioCard
        value="cod"
        icon={<Wallet />}
        title="Cash on delivery"
        description="Pay the rider when your order arrives"
      />
      <RadioCard
        value="disabled"
        icon={<Bike />}
        title="Wallet"
        description="Coming soon"
        disabled
      />
    </RadioGroup>
  ),
}

export const Switches: Story = {
  render: () => (
    <div className="space-y-4">
      <Switch
        label="Express delivery"
        description="Deliver in 10–18 minutes when available."
        defaultChecked
      />
      <Switch label="Low stock alerts" labelPosition="start" />
      <Switch size="sm" label="Compact" />
      <Switch label="Disabled" disabled defaultChecked />
    </div>
  ),
}
