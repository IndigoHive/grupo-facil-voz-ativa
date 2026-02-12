import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateChaveApiCommand } from '../../client/clients/chaves-api/chaves-api-types'

export function useCreateChaveApi() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['chaveApi.create'],
    mutationFn: async (command: CreateChaveApiCommand) => await client.chavesApi.create(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chaveApi.list'] })
    }
  })
}
