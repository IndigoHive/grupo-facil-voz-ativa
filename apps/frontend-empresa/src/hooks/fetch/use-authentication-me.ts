import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAuthenticationMe() {
  const client = useClient()

  return useQuery({
    queryKey: ['auth.getMe'],
    queryFn: async () => {
      try {
        return await client.authentication.me()
      } catch (error: any) {
        // Se receber 401, retorna undefined (não autenticado)
        if (error?.response?.status === 401) {
          return undefined
        }
        throw error
      }
    },
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    staleTime: 0
  })
}
