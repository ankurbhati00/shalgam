import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ProductBadge } from '../product-badge'
import { ProductImage } from '../product-image'
import { QuantitySelector } from '../quantity-selector'
import { Rating } from '../rating'
import { Price } from './price'

const meta = {
  title: 'Components/Commerce/Price & Product',
  component: Price,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Price>

export default meta
type Story = StoryObj<typeof meta>

export const Prices: Story = {
  args: { amount: 92, mrp: 105 },
  render: () => (
    <div className="space-y-3">
      <Price amount={24} mrp={32} size="sm" />
      <Price amount={92} mrp={105} />
      <Price amount={349} mrp={450} size="lg" />
      <Price amount={124999} mrp={149999} size="xl" />
      <Price amount={28} suffix="/ 500 ml" />
      <Price amount={72} mrp={72} />
    </div>
  ),
}

function StepperDemo() {
  const [value, setValue] = useState(1)
  const [other, setOther] = useState(3)
  return (
    <div className="flex flex-wrap items-center gap-4">
      <QuantitySelector value={value} onChange={setValue} max={5} label="Tomato Hybrid" />
      <QuantitySelector
        value={other}
        onChange={setOther}
        max={8}
        label="Paneer"
        variant="outline"
        size="md"
      />
      <QuantitySelector value={2} onChange={() => undefined} label="Disabled" disabled />
    </div>
  )
}

export const QuantitySelectorStory: Story = {
  name: 'QuantitySelector',
  args: { amount: 0 },
  render: () => <StepperDemo />,
}

export const Ratings: Story = {
  args: { amount: 0 },
  render: () => (
    <div className="space-y-3">
      <Rating value={4.4} count={2381} />
      <Rating value={3.5} count={12} size="md" />
      <Rating value={4.7} compact />
      <Rating value={4.7} count={1980} compact size="md" />
    </div>
  ),
}

export const ProductBadges: Story = {
  args: { amount: 0 },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          'bestseller',
          'new',
          'deal',
          'organic',
          'fresh',
          'imported',
          'shalgam-select',
          'low-stock',
          'out-of-stock',
          'veg',
          'non-veg',
        ] as const
      ).map((kind) => (
        <ProductBadge key={kind} kind={kind} discount={25} />
      ))}
    </div>
  ),
}

export const ProductImages: Story = {
  args: { amount: 0 },
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <ProductImage
        src="https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400"
        alt="Tomatoes"
      />
      <ProductImage src="https://invalid.example/missing.jpg" alt="Missing image" />
      <ProductImage src={null} alt="No image" ratio="4/3" />
      <ProductImage
        src="https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400"
        alt="Contain"
        fit="contain"
        ratio="16/9"
        rounded="xl"
      />
    </div>
  ),
}
