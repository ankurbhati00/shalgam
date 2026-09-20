import { getErrorMessage, isApiError } from '@shalgam/api-client'
import type { PaymentMethod } from '@shalgam/types'
import {
  Button,
  Card,
  Container,
  FormField,
  FormLabel,
  Heading,
  ProductImage,
  Text,
  Textarea,
  toast,
} from '@shalgam/ui'
import { formatINR } from '@shalgam/utils'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import { MobileActionBar } from '../../../app/shell/mobile-action-bar'
import { useAddresses } from '../../addresses/api/queries'
import { CartSummary } from '../../cart/components/cart-summary'
import { useCartBill } from '../../cart/hooks/use-cart-bill'
import { useCartLines, useCartStore, useCartTotals } from '../../cart/store/cart-store'
import { usePlaceOrder } from '../api/mutations'
import { AddressStep } from '../components/address-step'
import { PaymentStep } from '../components/payment-step'
import { SlotStep } from '../components/slot-step'
import { TipSelector } from '../components/tip-selector'

const UPI_PATTERN = /^[\w.-]{2,}@[a-z]{2,}$/i

function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-surface-inverse text-xs font-bold text-text-inverse">
          {number}
        </span>
        <Heading level={2} size="sm">
          {title}
        </Heading>
      </div>
      {children}
    </Card>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const lines = useCartLines()
  const totals = useCartTotals()
  const clearCart = useCartStore((s) => s.clear)
  const { data: addresses } = useAddresses()
  const placeOrder = usePlaceOrder()

  // Checkout-local state: nothing outside this page needs it. Address and slot
  // fall back to sensible defaults until the shopper picks one explicitly.
  const [chosenAddressId, setAddressId] = useState<string | null>(null)
  const [chosenSlotId, setSlotId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('upi')
  const [upiId, setUpiId] = useState('')
  const [tip, setTip] = useState(0)
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const bill = useCartBill(totals, tip)
  const { options, isPending: optionsPending } = bill
  const addressId =
    chosenAddressId ?? (addresses?.find((a) => a.isDefault) ?? addresses?.[0])?.id ?? null
  const slotId = chosenSlotId ?? options?.slots.find((s) => s.isAvailable)?.id ?? null

  if (lines.length === 0 && !placeOrder.isSuccess) return <Navigate to="/cart" replace />

  const belowMinimum = options ? totals.subtotal < options.minimumOrderValue : false
  const upiError =
    paymentMethod === 'upi' && upiId && !UPI_PATTERN.test(upiId)
      ? 'Enter a valid UPI ID such as name@upi.'
      : undefined

  const submit = async () => {
    setFormError(null)
    if (!addressId) return setFormError('Choose a delivery address.')
    if (!slotId) return setFormError('Choose a delivery slot.')
    if (!paymentMethod) return setFormError('Choose a payment method.')
    if (paymentMethod === 'upi' && !UPI_PATTERN.test(upiId))
      return setFormError('Enter a valid UPI ID to pay with UPI.')
    try {
      const order = await placeOrder.mutateAsync({
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        addressId,
        slotId,
        paymentMethod,
        tip,
        note: note.trim() || null,
      })
      clearCart()
      toast.success('Order placed', `We're picking your items. Order ${order.number}.`)
      void navigate(`/orders/${order.id}/confirmation`, { replace: true })
    } catch (error) {
      const details =
        isApiError(error) && error.details ? Object.values(error.details).flat().join(' ') : ''
      setFormError(`${getErrorMessage(error)} ${details}`.trim())
    }
  }

  // Rendered in the summary card on desktop and in the sticky bar on smaller
  // screens; CSS hides the inactive copy, so assistive tech sees only one.
  const actions = (
    <div className="space-y-3">
      {belowMinimum && options && (
        <Text size="sm" tone="danger" role="alert">
          Minimum order value is {formatINR(options.minimumOrderValue)}.{' '}
          <Link to="/" className="underline">
            Add more items
          </Link>
          .
        </Text>
      )}
      {formError && (
        <Text size="sm" tone="danger" role="alert">
          {formError}
        </Text>
      )}
      <Button
        fullWidth
        size="lg"
        leadingIcon={<Lock />}
        loading={placeOrder.isPending}
        loadingText="Placing your order…"
        disabled={belowMinimum || optionsPending}
        onClick={() => void submit()}
      >
        Place order · {formatINR(bill.total)}
      </Button>
      <Text size="xs" tone="subtle" align="center">
        Payments are simulated. This is a portfolio demo.
      </Text>
    </div>
  )

  return (
    <Container className="py-6 sm:py-8">
      <Heading level={1} size="xl" className="mb-5">
        Checkout
      </Heading>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="space-y-4">
          <Step number={1} title="Delivery address">
            <AddressStep value={addressId} onChange={setAddressId} />
          </Step>
          <Step number={2} title="Delivery slot">
            <SlotStep
              slots={options?.slots}
              loading={optionsPending}
              value={slotId}
              onChange={setSlotId}
            />
          </Step>
          <Step number={3} title="Payment">
            <PaymentStep
              value={paymentMethod}
              onChange={setPaymentMethod}
              upiId={upiId}
              onUpiIdChange={setUpiId}
              upiError={upiError}
            />
          </Step>
          <Step number={4} title="Extras">
            <div className="space-y-4">
              <div className="space-y-2">
                <Text size="sm" weight="medium">
                  Tip your rider
                </Text>
                <TipSelector value={tip} onChange={setTip} />
                <Text size="xs" tone="muted">
                  100% of the tip goes to your delivery partner.
                </Text>
              </div>
              <FormField name="note">
                <FormLabel optional>Delivery instructions</FormLabel>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Leave at the door, call on arrival…"
                  maxLength={200}
                  rows={2}
                />
              </FormField>
            </div>
          </Step>
        </div>

        <Card className="space-y-4 lg:sticky lg:top-24">
          <Heading level={2} size="sm">
            Order summary
          </Heading>
          <ul className="max-h-64 scrollbar-thin space-y-3 overflow-y-auto pr-1">
            {lines.map((line) => (
              <li key={line.productId} className="flex items-center gap-3 text-sm">
                <ProductImage
                  src={line.imageUrl}
                  alt=""
                  className="size-11 shrink-0"
                  rounded="md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-text">{line.name}</span>
                  <span className="text-xs text-text-muted">
                    {line.unit} × {line.quantity}
                  </span>
                </span>
                <span className="tabular">{formatINR(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <CartSummary totals={totals} tip={tip} showNudge={false} />
          <div className="hidden lg:block">{actions}</div>
        </Card>
      </div>
      <MobileActionBar className="mt-6">{actions}</MobileActionBar>
    </Container>
  )
}

export const route = { Component: CheckoutPage }
