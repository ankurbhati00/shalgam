import type { PaymentMethod } from '@shalgam/types'
import {
  FormDescription,
  FormField,
  FormLabel,
  Input,
  RadioCard,
  RadioGroup,
  Text,
} from '@shalgam/ui'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'

export interface PaymentStepProps {
  value: PaymentMethod | null
  onChange: (method: PaymentMethod) => void
  upiId: string
  onUpiIdChange: (value: string) => void
  upiError?: string
}

const isPaymentMethod = (value: string): value is PaymentMethod =>
  value === 'upi' || value === 'card' || value === 'cod'

/** Mock payment selection. No real processing happens; the API marks UPI/card as paid instantly. */
export function PaymentStep({ value, onChange, upiId, onUpiIdChange, upiError }: PaymentStepProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        aria-label="Payment method"
        value={value ?? ''}
        onValueChange={(v) => isPaymentMethod(v) && onChange(v)}
      >
        <RadioCard
          value="upi"
          icon={<Smartphone />}
          title="UPI"
          description="Google Pay, PhonePe, Paytm or any UPI app"
          addon="Instant"
        />
        <RadioCard
          value="card"
          icon={<CreditCard />}
          title="Credit / debit card"
          description="Visa, Mastercard, RuPay"
        />
        <RadioCard
          value="cod"
          icon={<Banknote />}
          title="Cash on delivery"
          description="Pay the rider when your order arrives"
        />
      </RadioGroup>
      {value === 'upi' && (
        <FormField name="upiId" invalid={!!upiError}>
          <FormLabel>UPI ID</FormLabel>
          <Input
            placeholder="name@bank"
            autoComplete="off"
            value={upiId}
            onValueChange={onUpiIdChange}
          />
          <FormDescription>
            Test mode — any well-formed UPI ID is accepted, nothing is charged.
          </FormDescription>
          {upiError && (
            <Text size="xs" tone="danger" weight="medium" role="alert">
              {upiError}
            </Text>
          )}
        </FormField>
      )}
      {value === 'card' && (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface-muted p-3 text-sm text-text-muted">
          Test mode: a saved demo card ending in{' '}
          <span className="font-medium text-text tabular">4242</span> will be used. No real card is
          charged.
        </div>
      )}
      {value === 'cod' && (
        <div className="rounded-lg bg-surface-muted p-3 text-sm text-text-muted">
          Please keep exact change ready. UPI payment to the rider is also accepted.
        </div>
      )}
    </div>
  )
}
