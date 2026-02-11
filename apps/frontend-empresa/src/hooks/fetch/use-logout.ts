import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useLogout() {
  const client = useClient()

  return useMutation({
    mutationKey: ['auth.logout'],
    mutationFn: async () => {
      await client.authentication.logout()
    }
  })
}
