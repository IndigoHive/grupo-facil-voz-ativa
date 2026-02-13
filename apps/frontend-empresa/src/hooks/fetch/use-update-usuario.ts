import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateUsuarioCommand } from '../../client/clients/usuarios/usuarios-types'
import { toast } from 'sonner'

export function useUpdateUsuario() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['usuarios.update'],
    mutationFn: ({data, id}: {data: UpdateUsuarioCommand, id: string}) => client.usuarios.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios.list'] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar usuário')
    }
  })
}
