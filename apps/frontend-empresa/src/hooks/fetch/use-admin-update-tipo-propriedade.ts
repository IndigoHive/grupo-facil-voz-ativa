import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateTipoPropriedadeCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminUpdateTipoPropriedade() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['tipo-propriedade.update'],
    mutationFn: async ({ data, id }: { data: UpdateTipoPropriedadeCommand, id: string }) => await client.admin.updateTipoPropriedade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipo-propriedade.list']
      })
      toast.success('Tipo de Propriedade atualizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao atualizar Tipo de Propriedade.')
    }
  })
}
