import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdatePropriedadeItemCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminUpdatePropriedadeItem() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.updatePropriedadeItem'],
    mutationFn: async ({ id, data }: { id: string, data: UpdatePropriedadeItemCommand }) =>
      await client.admin.updatePropriedadeItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listPropriedadeItems'] })
      toast.success('Item de propriedade atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar item de propriedade')
    }
  })
}
