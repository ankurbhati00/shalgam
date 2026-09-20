import { storefrontQueries } from '@shalgam/query'
import { useQuery } from '@tanstack/react-query'

export function useLocations() {
  return useQuery(storefrontQueries.locations())
}
