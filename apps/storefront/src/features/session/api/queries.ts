import { customerQueries } from '@shalgam/query'
import { useQuery } from '@tanstack/react-query'

/** The signed-in shopper. Authentication is mocked: the API always returns the demo customer. */
export function useCurrentUser() {
  return useQuery(customerQueries.me())
}
