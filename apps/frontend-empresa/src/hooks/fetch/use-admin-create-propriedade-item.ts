import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreatePropriedadeItemCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminCreatePropriedadeItem() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.createPropriedadeItem'],
    mutationFn: async (command: CreatePropriedadeItemCommand) => await client.admin.createPropriedadeItem(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listPropriedadeItems'] })
      toast.success('Item de propriedade criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar item de propriedade')
    }
  })
}
