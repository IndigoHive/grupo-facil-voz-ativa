import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateGatilhoCommand } from '../../client/clients/gatilhos/gatilhos-types'

export function useCreateGatilho() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['gatilhos.create'],
    mutationFn: async (command: CreateGatilhoCommand) => await client.gatilhos.create(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatilhos.list'] })
    }
  })
}
