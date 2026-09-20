import { isApiError } from '@shalgam/api-client'
import type { InventoryItem } from '@shalgam/types'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Radio,
  RadioGroup,
  Textarea,
} from '@shalgam/ui'
import { formatNumber } from '@shalgam/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useAdjustStock } from '../api/queries'
import {
  ADJUSTMENT_TYPES,
  adjustmentDefaults,
  type AdjustmentFormValues,
  adjustmentSchema,
} from '../schemas/adjustment-schema'

export interface AdjustStockDialogProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AdjustStockForm({ item, onDone }: { item: InventoryItem; onDone: () => void }) {
  const adjust = useAdjustStock()
  const form = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: adjustmentDefaults,
    mode: 'onTouched',
  })
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = form
  const type = useWatch({ control, name: 'type' })
  const quantity = useWatch({ control, name: 'quantity' })
  const signed = Number.isFinite(quantity)
    ? type === 'damage'
      ? -Math.abs(quantity)
      : type === 'restock'
        ? Math.abs(quantity)
        : quantity
    : 0
  const projected = item.onHand + signed

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adjust.mutateAsync({
        productId: item.productId,
        type: values.type,
        quantity: values.quantity,
        note: values.note || null,
      })
      onDone()
    } catch (error) {
      if (isApiError(error) && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof AdjustmentFormValues, { type: 'server', message: messages[0] })
        }
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="contents">
      <DialogBody className="space-y-4">
        <dl className="grid grid-cols-3 gap-2 rounded-lg bg-surface-muted p-3 text-center text-sm">
          <div>
            <dt className="text-xs text-text-muted">On hand</dt>
            <dd className="font-semibold text-text tabular">{formatNumber(item.onHand)}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Reserved</dt>
            <dd className="font-semibold text-text tabular">{formatNumber(item.reserved)}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">After change</dt>
            <dd
              className={
                projected < 0
                  ? 'font-semibold text-danger-text tabular'
                  : 'font-semibold text-text tabular'
              }
            >
              {formatNumber(projected)}
            </dd>
          </div>
        </dl>
        <FormField name="type" invalid={!!errors.type}>
          <FormLabel>Movement type</FormLabel>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <RadioGroup
                aria-label="Movement type"
                value={field.value}
                onValueChange={field.onChange}
              >
                {ADJUSTMENT_TYPES.map((option) => (
                  <Radio
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </RadioGroup>
            )}
          />
          <FormMessage>{errors.type?.message}</FormMessage>
        </FormField>
        <FormField name="quantity" invalid={!!errors.quantity}>
          <FormLabel required>Quantity</FormLabel>
          <Input
            type="number"
            inputMode="numeric"
            step={1}
            placeholder={type === 'adjustment' ? 'e.g. -3 or 12' : 'e.g. 24'}
            {...register('quantity', { valueAsNumber: true })}
          />
          <FormDescription>
            {type === 'adjustment'
              ? 'Use a negative number to remove stock.'
              : type === 'damage'
                ? 'Removed from stock.'
                : 'Added to stock; also records a restock date.'}
          </FormDescription>
          <FormMessage>{errors.quantity?.message}</FormMessage>
        </FormField>
        <FormField name="note" invalid={!!errors.note}>
          <FormLabel optional>Note</FormLabel>
          <Textarea
            rows={2}
            placeholder="Supplier invoice, cycle count, reason…"
            {...register('note')}
          />
          <FormMessage>{errors.note?.message}</FormMessage>
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={adjust.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={adjust.isPending} loadingText="Saving…">
          Apply adjustment
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AdjustStockDialog({ item, open, onOpenChange }: AdjustStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>{item ? `${item.productName} · ${item.sku}` : ''}</DialogDescription>
        </DialogHeader>
        {open && item && (
          <AdjustStockForm key={item.productId} item={item} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}
