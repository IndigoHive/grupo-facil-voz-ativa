import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import { toast } from 'sonner'

export function useRevogarUsuarioAcesso() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['revogar-usuario-acesso'],
    mutationFn: async (usuarioId: string) => await client.usuarios.revogarAcesso(usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios.list'] })
      toast.success('Acesso do usuário revogado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao revogar acesso do usuário')
    }
  })
}
