import type { StoreSettings, StoreSettingsInput } from '@shalgam/types'
import { z } from 'zod'

const money = (label: string) =>
  z.number({ error: `Enter the ${label}.` }).min(0, 'Must be zero or more.')

export const settingsSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, 'Store name is required.')
    .max(60, 'Keep the name under 60 characters.'),
  supportEmail: z.email('Enter a valid email address.'),
  supportPhone: z
    .string()
    .trim()
    .min(6, 'Enter a support phone number.')
    .max(24, 'Keep the phone number short.'),
  deliveryFee: money('delivery fee'),
  freeDeliveryThreshold: money('free-delivery threshold'),
  handlingFee: money('handling fee'),
  minimumOrderValue: money('minimum order value'),
  lowStockThreshold: z
    .number({ error: 'Enter the low-stock threshold.' })
    .int('Use a whole number.')
    .min(0, 'Must be zero or more.'),
  expressDeliveryEnabled: z.boolean(),
  /** One pincode per line; validated as 6 digits each. */
  serviceablePincodes: z.string().refine(
    (text) =>
      text
        .split(/[\n,\s]+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .every((line) => /^\d{6}$/.test(line)),
    'Every pincode must be exactly 6 digits.',
  ),
  notifications: z.object({
    orderPlaced: z.boolean(),
    orderDelayed: z.boolean(),
    lowStock: z.boolean(),
    dailyDigest: z.boolean(),
  }),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

export function settingsToFormValues(settings: StoreSettings): SettingsFormValues {
  return {
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    deliveryFee: settings.deliveryFee,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    handlingFee: settings.handlingFee,
    minimumOrderValue: settings.minimumOrderValue,
    lowStockThreshold: settings.lowStockThreshold,
    expressDeliveryEnabled: settings.expressDeliveryEnabled,
    serviceablePincodes: settings.serviceablePincodes.join('\n'),
    notifications: { ...settings.notifications },
  }
}

export function formValuesToSettingsInput(values: SettingsFormValues): StoreSettingsInput {
  return {
    storeName: values.storeName,
    supportEmail: values.supportEmail,
    supportPhone: values.supportPhone,
    deliveryFee: values.deliveryFee,
    freeDeliveryThreshold: values.freeDeliveryThreshold,
    handlingFee: values.handlingFee,
    minimumOrderValue: values.minimumOrderValue,
    lowStockThreshold: values.lowStockThreshold,
    expressDeliveryEnabled: values.expressDeliveryEnabled,
    serviceablePincodes: Array.from(
      new Set(
        values.serviceablePincodes
          .split(/[\n,\s]+/)
          .map((line) => line.trim())
          .filter(Boolean),
      ),
    ),
    notifications: values.notifications,
  }
}
