import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useCleanUsuarioSenha() {
  const client = useClient()

  return useMutation({
    mutationKey: ['admin.cleanUsuarioSenha'],
    mutationFn: async (id: string) => await client.admin.cleanUsuarioSenha(id)
  })
}
