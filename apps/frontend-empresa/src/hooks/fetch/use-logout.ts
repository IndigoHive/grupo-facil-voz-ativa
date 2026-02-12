import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'
import { toast } from 'sonner'

export function useLogout() {
  const client = useClient()

  return useMutation({
    mutationKey: ['auth.logout'],
    mutationFn: async () => {
      await client.authentication.logout()
    },
    onSuccess: () => {
      toast.success('Logout realizado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao realizar logout')
    }
  })
}
