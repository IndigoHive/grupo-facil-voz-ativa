import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateUsuarioCommand } from '../../client/clients/usuarios/usuarios-types'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../lib/error-handler'

export function useUpdateUsuario() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['usuarios.update'],
    mutationFn: async ({data, id}: {data: UpdateUsuarioCommand, id: string}) => await client.usuarios.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios.list'] })
      toast.success('Usuário atualizado com sucesso')
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(error)
      toast.error(errorMessage)
    }
  })
}
