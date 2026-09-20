import { z } from 'zod'

export const addressSchema = z.object({
  label: z.enum(['home', 'work', 'other']),
  recipientName: z.string().trim().min(2, 'Enter the recipient’s name.'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, 'Enter a valid 10-digit Indian mobile number.'),
  line1: z.string().trim().min(3, 'Flat, house no. and building are required.'),
  line2: z.string().trim().max(120, 'Keep this under 120 characters.').optional(),
  landmark: z.string().trim().max(80, 'Keep this under 80 characters.').optional(),
  city: z.string().trim().min(2, 'City is required.'),
  state: z.string().trim().min(2, 'State is required.'),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter a 6-digit pincode.'),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

export const addressDefaults: AddressFormValues = {
  label: 'home',
  recipientName: '',
  phone: '',
  line1: '',
  line2: '',
  landmark: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '',
  isDefault: false,
}
