import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateGatilhoCommand } from '../../client/clients/gatilhos/gatilhos-types'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../lib/error-handler'

export function useCreateGatilho() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['gatilhos.create'],
    mutationFn: async (command: CreateGatilhoCommand) => await client.gatilhos.create(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatilhos.list'] })
      toast.success('Gatilho criado com sucesso')
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error)
      toast.error(errorMessage)
    }
  })
}
