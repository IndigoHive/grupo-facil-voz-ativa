import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateGatilhoCommand } from '../../client/clients/gatilhos/gatilhos-types'
import { toast } from 'sonner'

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
    onError: () => {
      toast.error('Erro ao atualizar gatilho')
    }
  })
}
