import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateUsuarioCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useAdminCreateUsuario() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.createUsuario'],
    mutationFn: async (command: CreateUsuarioCommand) => await client.admin.createUsuario(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listUsuarios'] })
      toast.success('Usuário criado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar usuário')
    }
  })
}
