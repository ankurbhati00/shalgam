import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { FormField, FormLabel, FormMessage } from '../form-field'
import { Slider } from '../slider'
import { MultiSelect } from './multi-select'
import { Select, type SelectOptions } from './select'

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Discount' },
  { value: 'rating', label: 'Rating' },
] as const

type SortValue = (typeof sortOptions)[number]['value']

const groupedOptions: SelectOptions = [
  {
    label: 'Fresh',
    options: [
      { value: 'fresh-vegetables', label: 'Fresh Vegetables' },
      { value: 'fresh-fruits', label: 'Fresh Fruits' },
    ],
  },
  {
    label: 'Dairy & Bread',
    options: [
      { value: 'milk', label: 'Milk' },
      { value: 'curd-paneer', label: 'Curd & Paneer' },
      { value: 'bread-bakery', label: 'Bread & Bakery', disabled: true },
    ],
  },
]

const statusOptions = [
  { value: 'placed', label: 'Placed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'packed', label: 'Packed' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-sm space-y-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

function ControlledSelect() {
  const [value, setValue] = useState<SortValue | null>('relevance')
  return (
    <FormField name="sort">
      <FormLabel>Sort by</FormLabel>
      <Select
        options={sortOptions}
        value={value}
        onValueChange={setValue}
        aria-label="Sort products"
      />
    </FormField>
  )
}

export const Default: Story = {
  args: { options: sortOptions, placeholder: 'Sort by' },
  render: () => <ControlledSelect />,
}

export const Grouped: Story = {
  args: { options: groupedOptions },
  render: (args) => (
    <FormField name="subcategory">
      <FormLabel>Subcategory</FormLabel>
      <Select {...args} placeholder="Choose a subcategory" />
    </FormField>
  ),
}

export const Sizes: Story = {
  args: { options: sortOptions },
  render: (args) => (
    <>
      <Select {...args} size="sm" defaultValue="relevance" aria-label="Small" />
      <Select {...args} size="md" defaultValue="relevance" aria-label="Medium" />
      <Select {...args} size="lg" defaultValue="relevance" aria-label="Large" />
    </>
  ),
}

export const InvalidAndDisabled: Story = {
  args: { options: sortOptions },
  render: (args) => (
    <>
      <FormField name="a" invalid>
        <FormLabel>Category</FormLabel>
        <Select {...args} invalid placeholder="Required" />
        <FormMessage>Choose a category.</FormMessage>
      </FormField>
      <Select {...args} disabled defaultValue="relevance" aria-label="Disabled" />
    </>
  ),
}

function MultiDemo() {
  const [value, setValue] = useState<string[]>(['placed', 'packed'])
  return (
    <FormField name="status">
      <FormLabel>Order status</FormLabel>
      <MultiSelect
        options={statusOptions}
        value={value}
        onValueChange={setValue}
        placeholder="Any status"
      />
      <p className="text-xs text-text-muted">{value.length} selected</p>
    </FormField>
  )
}

export const MultiSelectStory: Story = {
  name: 'MultiSelect',
  args: { options: statusOptions },
  render: () => <MultiDemo />,
}

function SliderDemo() {
  const [range, setRange] = useState<number | number[]>([50, 400])
  return (
    <div className="space-y-6">
      <FormField name="price">
        <FormLabel>Price range</FormLabel>
        <Slider
          value={range}
          onValueChange={setRange}
          min={0}
          max={1000}
          step={10}
          thumbLabels={['Minimum price', 'Maximum price']}
          format={(v) => `₹${v}`}
          showValue
        />
      </FormField>
      <FormField name="radius">
        <FormLabel>Delivery radius</FormLabel>
        <Slider
          defaultValue={3}
          min={1}
          max={8}
          step={0.5}
          thumbLabels={['Radius in km']}
          format={(v) => `${v} km`}
          showValue
        />
      </FormField>
    </div>
  )
}

export const SliderStory: Story = {
  name: 'Slider',
  args: { options: sortOptions },
  render: () => <SliderDemo />,
}
