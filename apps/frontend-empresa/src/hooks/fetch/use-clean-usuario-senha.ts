import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'
import { toast } from 'sonner'

export function useCleanUsuarioSenha() {
  const client = useClient()

  return useMutation({
    mutationKey: ['admin.cleanUsuarioSenha'],
    mutationFn: async (id: string) => await client.admin.cleanUsuarioSenha(id),
    onSuccess: () => {
      toast.success('Senha do usuário limpa com sucesso')
    },
    onError: () => {
      toast.error('Erro ao limpar senha do usuário')
    }
  })
}
