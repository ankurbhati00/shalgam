import type { Meta, StoryObj } from '@storybook/react-vite'

import { Heading } from '../components/text'
import { Text } from '../components/text'

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Scale: Story = {
  render: () => (
    <div className="space-y-6">
      <p className="text-sm text-text-muted">
        Plus Jakarta Sans Variable. Headings separate semantic level from visual size.
      </p>
      <div className="space-y-4">
        <Heading level={1} size="3xl">
          Fresh groceries in 10 minutes
        </Heading>
        <Heading level={2} size="2xl">
          Fruits & Vegetables
        </Heading>
        <Heading level={2} size="xl">
          Frequently bought together
        </Heading>
        <Heading level={3} size="lg">
          Order SHL-260918-0042
        </Heading>
        <Heading level={3} size="md">
          Delivery address
        </Heading>
        <Heading level={4} size="sm">
          Payment
        </Heading>
        <Heading level={5} size="xs">
          Section label
        </Heading>
      </div>
      <div className="space-y-2">
        <Text size="xl">Extra large body — promo copy.</Text>
        <Text size="lg">Large body — product descriptions.</Text>
        <Text>Base body — the default for paragraphs and forms.</Text>
        <Text size="sm" tone="muted">
          Small muted — metadata, helper text.
        </Text>
        <Text size="xs" tone="subtle">
          Extra small subtle — timestamps, captions.
        </Text>
        <Text size="2xs" weight="semibold" className="tracking-wider uppercase">
          2XS uppercase — table headers
        </Text>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <Text size="sm" tone="muted">
            Proportional numerals
          </Text>
          <Text size="xl" weight="semibold">
            ₹1,24,999.00 · 1234567890
          </Text>
        </div>
        <div className="rounded-lg border border-border p-4">
          <Text size="sm" tone="muted">
            Tabular numerals (`tabular`)
          </Text>
          <Text size="xl" weight="semibold" tabular>
            ₹1,24,999.00 · 1234567890
          </Text>
        </div>
      </div>
    </div>
  ),
}
