import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateUsuarioCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminUpdateUsuario() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.updateUsuario'],
    mutationFn: async ({ id, data }: { id: string; data: UpdateUsuarioCommand }) =>
      await client.admin.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listUsuarios'] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar usuário')
    }
  })
}
