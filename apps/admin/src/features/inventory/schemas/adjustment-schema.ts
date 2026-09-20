import { z } from 'zod'

export const ADJUSTMENT_TYPES = [
  { value: 'restock', label: 'Restock', description: 'Goods received; adds to stock.' },
  {
    value: 'adjustment',
    label: 'Adjustment',
    description: 'Cycle-count correction; positive or negative.',
  },
  { value: 'damage', label: 'Damage', description: 'Spoiled or broken; removes from stock.' },
] as const

export const adjustmentSchema = z
  .object({
    type: z.enum(['restock', 'adjustment', 'damage']),
    quantity: z
      .number({ error: 'Enter a quantity.' })
      .int('Use a whole number.')
      .refine((value) => value !== 0, 'Quantity must not be zero.'),
    note: z.string().trim().max(200, 'Keep the note under 200 characters.'),
  })
  .refine((values) => values.type === 'adjustment' || values.quantity > 0, {
    message: 'Enter a positive quantity; the direction comes from the type.',
    path: ['quantity'],
  })

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>

export const adjustmentDefaults: AdjustmentFormValues = {
  type: 'restock',
  quantity: Number.NaN,
  note: '',
}
