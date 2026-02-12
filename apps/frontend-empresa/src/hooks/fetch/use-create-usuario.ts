import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateUsuarioCommand } from '../../client/clients/usuarios/usuarios-types'

export function useCreateUsuario() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['usuarios.create'],
    mutationFn: async (command: CreateUsuarioCommand) => await client.usuarios.create(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios.list'] })
    }
  })
}
