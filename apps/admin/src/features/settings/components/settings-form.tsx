import { isApiError } from '@shalgam/api-client'
import type { StoreSettings } from '@shalgam/types'
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Switch,
  Textarea,
} from '@shalgam/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { useUpdateSettings } from '../api/queries'
import {
  formValuesToSettingsInput,
  type SettingsFormValues,
  settingsSchema,
  settingsToFormValues,
} from '../schemas/settings-schema'

const NOTIFICATIONS = [
  {
    key: 'orderPlaced',
    label: 'New order placed',
    description: 'Ping the ops channel for every order.',
  },
  {
    key: 'orderDelayed',
    label: 'Delivery running late',
    description: 'Alert when an ETA is missed.',
  },
  {
    key: 'lowStock',
    label: 'Low stock',
    description: 'Warn when a SKU dips below its reorder level.',
  },
  {
    key: 'dailyDigest',
    label: 'Daily digest',
    description: 'A summary email every morning at 8 am.',
  },
] as const

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const update = useUpdateSettings()
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settingsToFormValues(settings),
    mode: 'onTouched',
  })
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isDirty },
  } = form
  const pincodeCount = useWatch({ control, name: 'serviceablePincodes' })
    .split(/[\n,\s]+/)
    .filter((line) => line.trim()).length

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = await update.mutateAsync(formValuesToSettingsInput(values))
      reset(settingsToFormValues(saved))
    } catch (error) {
      if (isApiError(error) && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof SettingsFormValues, { type: 'server', message: messages[0] })
        }
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Store</CardTitle>
          <CardDescription>Shown on receipts, emails and the storefront footer.</CardDescription>
        </CardHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField name="storeName" invalid={!!errors.storeName}>
            <FormLabel required>Store name</FormLabel>
            <Input {...register('storeName')} />
            <FormMessage>{errors.storeName?.message}</FormMessage>
          </FormField>
          <FormField name="supportEmail" invalid={!!errors.supportEmail}>
            <FormLabel required>Support email</FormLabel>
            <Input type="email" autoComplete="email" {...register('supportEmail')} />
            <FormMessage>{errors.supportEmail?.message}</FormMessage>
          </FormField>
          <FormField name="supportPhone" invalid={!!errors.supportPhone}>
            <FormLabel required>Support phone</FormLabel>
            <Input type="tel" autoComplete="tel" {...register('supportPhone')} />
            <FormMessage>{errors.supportPhone?.message}</FormMessage>
          </FormField>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery & fees</CardTitle>
          <CardDescription>Applied at checkout for every new order.</CardDescription>
        </CardHeader>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField name="deliveryFee" invalid={!!errors.deliveryFee}>
            <FormLabel required>Delivery fee</FormLabel>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              prefix="₹"
              {...register('deliveryFee', { valueAsNumber: true })}
            />
            <FormMessage>{errors.deliveryFee?.message}</FormMessage>
          </FormField>
          <FormField name="freeDeliveryThreshold" invalid={!!errors.freeDeliveryThreshold}>
            <FormLabel required>Free delivery above</FormLabel>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              prefix="₹"
              {...register('freeDeliveryThreshold', { valueAsNumber: true })}
            />
            <FormMessage>{errors.freeDeliveryThreshold?.message}</FormMessage>
          </FormField>
          <FormField name="handlingFee" invalid={!!errors.handlingFee}>
            <FormLabel required>Handling fee</FormLabel>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              prefix="₹"
              {...register('handlingFee', { valueAsNumber: true })}
            />
            <FormMessage>{errors.handlingFee?.message}</FormMessage>
          </FormField>
          <FormField name="minimumOrderValue" invalid={!!errors.minimumOrderValue}>
            <FormLabel required>Minimum order value</FormLabel>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              prefix="₹"
              {...register('minimumOrderValue', { valueAsNumber: true })}
            />
            <FormMessage>{errors.minimumOrderValue?.message}</FormMessage>
          </FormField>
        </div>
        <div className="mt-4 border-t border-border-subtle pt-4">
          <Controller
            control={control}
            name="expressDeliveryEnabled"
            render={({ field }) => (
              <Switch
                label="Express delivery"
                description="Offer the 10–20 minute express slot at checkout."
                checked={field.value}
                onCheckedChange={field.onChange}
                labelPosition="start"
              />
            )}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <div className="mt-4">
            <FormField name="lowStockThreshold" invalid={!!errors.lowStockThreshold}>
              <FormLabel required>Low-stock threshold</FormLabel>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className="sm:max-w-40"
                {...register('lowStockThreshold', { valueAsNumber: true })}
              />
              <FormDescription>New products get this as their reorder level.</FormDescription>
              <FormMessage>{errors.lowStockThreshold?.message}</FormMessage>
            </FormField>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <div className="mt-4 space-y-4">
            {NOTIFICATIONS.map((item) => (
              <Controller
                key={item.key}
                control={control}
                name={`notifications.${item.key}`}
                render={({ field }) => (
                  <Switch
                    label={item.label}
                    description={item.description}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    labelPosition="start"
                    size="sm"
                  />
                )}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Serviceable pincodes</CardTitle>
          <CardDescription>
            Checkout rejects addresses outside this list. {pincodeCount} pincodes configured.
          </CardDescription>
        </CardHeader>
        <div className="mt-4">
          <FormField name="serviceablePincodes" invalid={!!errors.serviceablePincodes}>
            <FormLabel>Pincodes</FormLabel>
            <Textarea
              rows={5}
              placeholder={'560001\n560034'}
              className="font-mono text-sm"
              {...register('serviceablePincodes')}
            />
            <FormDescription>One per line, or separated by commas or spaces.</FormDescription>
            <FormMessage>{errors.serviceablePincodes?.message}</FormMessage>
          </FormField>
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || update.isPending}
          onClick={() => reset()}
        >
          Discard changes
        </Button>
        <Button type="submit" loading={update.isPending} loadingText="Saving…" disabled={!isDirty}>
          Save settings
        </Button>
      </div>
    </form>
  )
}
