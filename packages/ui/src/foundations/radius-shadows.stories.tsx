import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Radius',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const RadiusScale: Story = {
  name: 'Radius',
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
      {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'].map((r) => (
        <div key={r} className="flex flex-col items-center gap-2">
          <div
            className="size-20 border border-border-strong bg-surface-muted"
            style={{ borderRadius: `var(--radius-${r})` }}
          />
          <code className="text-xs text-text-muted">rounded-{r}</code>
        </div>
      ))}
    </div>
  ),
}
