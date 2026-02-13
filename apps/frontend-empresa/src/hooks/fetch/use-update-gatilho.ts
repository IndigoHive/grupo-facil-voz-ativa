import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateGatilhoCommand } from '../../client/clients/gatilhos/gatilhos-types'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../lib/error-handler'

export function useUpdateGatilho() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['gatilhos.update'],
    mutationFn: async ({ id, data }: { id: string; data: UpdateGatilhoCommand }) =>
      await client.gatilhos.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatilhos.list'] })
      toast.success('Gatilho atualizado com sucesso')
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error)
      toast.error(errorMessage)
    }
  })
}
