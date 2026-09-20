import { createQueryClient } from '@shalgam/query'

/** Single QueryClient for the admin; route loaders use it to prefetch. */
export const queryClient = createQueryClient()
