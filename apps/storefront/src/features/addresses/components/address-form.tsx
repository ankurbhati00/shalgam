import { isApiError } from '@shalgam/api-client'
import type { Address, AddressInput } from '@shalgam/types'
import {
  Button,
  Checkbox,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  Radio,
  RadioGroup,
} from '@shalgam/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { useCreateAddress, useUpdateAddress } from '../api/queries'
import { addressDefaults, type AddressFormValues, addressSchema } from '../schemas/address-schema'

export interface AddressFormProps {
  /** When provided the form edits this address; otherwise it creates one. */
  address?: Address
  onSaved: (address: Address) => void
  onCancel?: () => void
}

/** React Hook Form + Zod address form. Server-side validation errors map back onto fields. */
export function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const create = useCreateAddress()
  const update = useUpdateAddress()
  const isSubmitting = create.isPending || update.isPending

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label,
          recipientName: address.recipientName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? '',
          landmark: address.landmark ?? '',
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault,
        }
      : addressDefaults,
    mode: 'onTouched',
  })
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = form

  const onSubmit = handleSubmit(async (values) => {
    const input: AddressInput = {
      ...values,
      line2: values.line2?.trim() ? values.line2.trim() : null,
      landmark: values.landmark?.trim() ? values.landmark.trim() : null,
    }
    try {
      const saved = address
        ? await update.mutateAsync({ id: address.id, input })
        : await create.mutateAsync(input)
      onSaved(saved)
    } catch (error) {
      if (isApiError(error) && error.details) {
        for (const [field, messages] of Object.entries(error.details)) {
          setError(field as keyof AddressFormValues, { type: 'server', message: messages[0] })
        }
      }
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FormField name="label" invalid={!!errors.label}>
        <FormLabel>Save as</FormLabel>
        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <RadioGroup
              orientation="horizontal"
              value={field.value}
              onValueChange={field.onChange}
              aria-label="Address label"
            >
              <Radio value="home" label="Home" />
              <Radio value="work" label="Work" />
              <Radio value="other" label="Other" />
            </RadioGroup>
          )}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="recipientName" invalid={!!errors.recipientName}>
          <FormLabel required>Recipient name</FormLabel>
          <Input autoComplete="name" {...register('recipientName')} />
          <FormMessage>{errors.recipientName?.message}</FormMessage>
        </FormField>
        <FormField name="phone" invalid={!!errors.phone}>
          <FormLabel required>Phone</FormLabel>
          <Input
            prefix="+91"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98450 12345"
            {...register('phone')}
          />
          <FormMessage>{errors.phone?.message}</FormMessage>
        </FormField>
      </div>
      <FormField name="line1" invalid={!!errors.line1}>
        <FormLabel required>Flat, house no., building</FormLabel>
        <Input autoComplete="address-line1" {...register('line1')} />
        <FormMessage>{errors.line1?.message}</FormMessage>
      </FormField>
      <FormField name="line2" invalid={!!errors.line2}>
        <FormLabel optional>Area, street</FormLabel>
        <Input autoComplete="address-line2" {...register('line2')} />
        <FormMessage>{errors.line2?.message}</FormMessage>
      </FormField>
      <FormField name="landmark" invalid={!!errors.landmark}>
        <FormLabel optional>Landmark</FormLabel>
        <Input placeholder="Near the metro station" {...register('landmark')} />
        <FormDescription>Helps the rider find you faster.</FormDescription>
        <FormMessage>{errors.landmark?.message}</FormMessage>
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField name="city" invalid={!!errors.city}>
          <FormLabel required>City</FormLabel>
          <Input autoComplete="address-level2" {...register('city')} />
          <FormMessage>{errors.city?.message}</FormMessage>
        </FormField>
        <FormField name="state" invalid={!!errors.state}>
          <FormLabel required>State</FormLabel>
          <Input autoComplete="address-level1" {...register('state')} />
          <FormMessage>{errors.state?.message}</FormMessage>
        </FormField>
        <FormField name="pincode" invalid={!!errors.pincode}>
          <FormLabel required>Pincode</FormLabel>
          <Input
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            {...register('pincode')}
          />
          <FormMessage>{errors.pincode?.message}</FormMessage>
        </FormField>
      </div>
      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <Checkbox
            label="Make this my default address"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} loadingText="Saving…">
          {address ? 'Save changes' : 'Save address'}
        </Button>
      </div>
    </form>
  )
}
