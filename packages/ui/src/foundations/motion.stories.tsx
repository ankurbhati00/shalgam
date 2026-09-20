import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '../components/button'

const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

function MotionDemo() {
  const [key, setKey] = useState(0)
  const animations = ['fade-in', 'scale-in', 'slide-up', 'slide-down', 'slide-in-right', 'pop']
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
          Replay
        </Button>
        <p className="text-sm text-text-muted">
          Entrances use <code>--ease-out-soft</code>; exits are ~30% shorter. Reduced-motion users
          see instant changes.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {animations.map((name) => (
          <div
            key={`${name}-${key}`}
            className="flex flex-col items-center gap-2 overflow-hidden rounded-lg border border-border p-4"
          >
            <div className={`size-12 rounded-lg bg-primary animate-${name}`} />
            <code className="text-2xs text-text-subtle">animate-{name}</code>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-4">
        <div className="h-4 w-2/3 skeleton rounded-sm" />
        <code className="mt-2 block text-2xs text-text-subtle">skeleton (shimmer)</code>
      </div>
    </div>
  )
}

export const Animations: Story = { render: () => <MotionDemo /> }
