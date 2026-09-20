import { useCheckoutOptions } from '../api/queries'
import type { CartTotals } from '../store/cart-store'

/**
 * The bill for the current cart. Fees and thresholds are server-owned pricing
 * rules (GET /checkout/options), so every place that shows a total derives it here.
 */
export function useCartBill(totals: CartTotals, tip = 0) {
  const { data: options, isPending } = useCheckoutOptions(totals.subtotal)
  const deliveryFee = options?.deliveryFee ?? 0
  const handlingFee = options?.handlingFee ?? 0
  return {
    options,
    isPending,
    deliveryFee,
    handlingFee,
    freeDelivery: options ? deliveryFee === 0 : false,
    threshold: options?.freeDeliveryThreshold ?? 0,
    total: totals.subtotal + deliveryFee + handlingFee + tip,
  }
}
