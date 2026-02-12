import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useRevokeChaveApi() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['chaveApi.revoke'],
    mutationFn: async (id: string) => await client.chavesApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chaveApi.list'] })
    }
  })
}
