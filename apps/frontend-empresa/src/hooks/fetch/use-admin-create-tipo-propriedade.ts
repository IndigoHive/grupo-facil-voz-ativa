import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateTipoPropriedadeCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminCreateTipoPropriedade() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['tipo-propriedade.create'],
    mutationFn: async (data: CreateTipoPropriedadeCommand) => await client.admin.createTipoPropriedade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tipo-propriedade.list']
      })
      toast.success('Tipo de Propriedade criado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao criar Tipo de Propriedade.')
    }
  })
}
