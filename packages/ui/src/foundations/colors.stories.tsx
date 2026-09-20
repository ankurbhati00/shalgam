import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

const scales: Record<string, number[]> = {
  brand: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  neutral: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  success: [50, 100, 200, 500, 600, 700, 900],
  warning: [50, 100, 200, 500, 600, 700, 900],
  danger: [50, 100, 200, 500, 600, 700, 900],
  info: [50, 100, 200, 500, 600, 700, 900],
}

function Swatch({ name, value, dark }: { name: string; value: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 rounded-lg border border-border-subtle shadow-xs"
        style={{ background: value }}
      />
      <div className="text-xs">
        <div className={dark ? 'font-medium text-text' : 'font-medium text-text'}>{name}</div>
        <code className="text-2xs text-text-subtle">{value}</code>
      </div>
    </div>
  )
}

export const Palette: Story = {
  render: () => (
    <div className="space-y-8">
      {Object.entries(scales).map(([scale, steps]) => (
        <section key={scale} className="space-y-3">
          <h3 className="text-sm font-semibold text-text capitalize">{scale}</h3>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
            {steps.map((step) => (
              <Swatch
                key={step}
                name={`${scale}-${step}`}
                value={`var(--color-${scale}-${step})`}
              />
            ))}
          </div>
        </section>
      ))}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text">Tints</h3>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {['lime', 'mint', 'sky', 'lavender', 'peach', 'butter', 'rose'].map((tint) => (
            <Swatch key={tint} name={`tint-${tint}`} value={`var(--color-tint-${tint})`} />
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text">Chart palette</h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Swatch key={n} name={`chart-${n}`} value={`var(--color-chart-${n})`} />
          ))}
        </div>
      </section>
    </div>
  ),
}

const semantic = [
  ['background', 'Page background'],
  ['surface', 'Cards, sheets'],
  ['surface-muted', 'Tiles, secondary'],
  ['surface-subtle', 'Table header'],
  ['border', 'Default border'],
  ['border-strong', 'Inputs'],
  ['text', 'Primary text'],
  ['text-muted', 'Secondary text'],
  ['text-subtle', 'Placeholders'],
  ['primary', 'CTA'],
  ['primary-strong', 'Links'],
  ['primary-muted', 'Selection'],
  ['success', 'Positive'],
  ['warning', 'Attention'],
  ['danger', 'Destructive'],
  ['info', 'Informational'],
] as const

export const SemanticTokens: Story = {
  name: 'Semantic tokens',
  render: () => (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-text-muted">
        Components only reference semantic tokens. Switch the theme in the toolbar to see every
        value re-map without touching a component.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {semantic.map(([token, use]) => (
          <div
            key={token}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3"
          >
            <span
              className="size-10 shrink-0 rounded-md border border-border-subtle"
              style={{ background: `var(--color-${token})` }}
            />
            <div className="min-w-0 text-xs">
              <code className="block truncate font-medium text-text">--color-{token}</code>
              <span className="text-text-muted">{use}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

export const ContrastPairs: Story = {
  name: 'Text on surfaces',
  render: () => (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-primary p-5 text-primary-foreground">
        <p className="font-semibold">Primary surface</p>
        <p className="text-sm">Dark text on lime passes AA at all sizes.</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="font-semibold text-text">Default surface</p>
        <p className="text-sm text-text-muted">
          Muted text is neutral-600 (≈7:1); subtle text is neutral-500 (≈4.6:1).
        </p>
        <a className="text-sm font-medium text-primary-strong underline" href="/orders">
          Links use primary-strong
        </a>
      </div>
      <div className="rounded-xl bg-surface-inverse p-5 text-text-inverse">
        <p className="font-semibold">Inverse surface</p>
        <p className="text-sm opacity-80">Tooltips and the secondary button.</p>
      </div>
    </div>
  ),
}
