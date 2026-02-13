import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../lib/error-handler'

export function useDeleteGatilho() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['gatilhos.delete'],
    mutationFn: async (id: string) => await client.gatilhos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gatilhos.list'] })
      toast.success('Gatilho excluído com sucesso')
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error)
      toast.error(errorMessage)
    }
  })
}
