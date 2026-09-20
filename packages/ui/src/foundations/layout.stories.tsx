import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

const spacing = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]

export const SpacingScale: Story = {
  name: 'Spacing',
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        A 4px base unit. Cards use 16–24px padding; page gutters are 16px on phones and 24px on
        larger screens.
      </p>
      {spacing.map((step) => (
        <div key={step} className="flex items-center gap-4 text-xs">
          <code className="w-10 text-text-muted">{step}</code>
          <span className="w-14 text-text-subtle tabular">{step * 4}px</span>
          <div className="h-4 rounded-xs bg-brand-400" style={{ width: `${step * 4}px` }} />
        </div>
      ))}
    </div>
  ),
}
