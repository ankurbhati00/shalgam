import { storefrontQueries } from '@shalgam/query'
import { useQuery } from '@tanstack/react-query'

/** Delivery fee, thresholds and slots for a given subtotal — server-owned pricing rules. */
export function useCheckoutOptions(subtotal: number) {
  return useQuery(storefrontQueries.checkoutOptions(subtotal))
}
