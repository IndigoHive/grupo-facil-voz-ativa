import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAuthenticationMe() {
  const client = useClient()

  return useQuery({
    queryKey: ['auth.getMe'],
    queryFn: async () => client.authentication.me()
  })
}
