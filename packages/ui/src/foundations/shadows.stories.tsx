import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Shadows',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

export const Elevation: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 bg-background p-4 sm:grid-cols-3 lg:grid-cols-6">
      {['xs', 'sm', 'md', 'lg', 'xl', 'brand'].map((s) => (
        <div key={s} className="flex flex-col items-center gap-3">
          <div
            className="size-24 rounded-xl bg-surface"
            style={{ boxShadow: `var(--shadow-${s})` }}
          />
          <code className="text-xs text-text-muted">shadow-{s}</code>
        </div>
      ))}
    </div>
  ),
}
