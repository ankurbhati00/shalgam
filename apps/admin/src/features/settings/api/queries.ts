import { api, getErrorMessage, isApiError } from '@shalgam/api-client'
import { queryKeys, settingsQueries } from '@shalgam/query'
import type { StoreSettingsInput } from '@shalgam/types'
import { toast } from '@shalgam/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useStoreSettings() {
  return useQuery(settingsQueries.store())
}

export function useAdminMe() {
  return useQuery(settingsQueries.adminMe())
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StoreSettingsInput) => api.settings.update(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.store, settings)
      toast.success('Settings saved')
    },
    onError: (error) => {
      if (!isApiError(error) || !error.isValidationError)
        toast.error('Could not save settings', getErrorMessage(error))
    },
  })
}
