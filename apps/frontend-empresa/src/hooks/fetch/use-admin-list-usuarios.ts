import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAdminListUsuarios() {
  const client = useClient()

  return useQuery({
    queryKey: ['admin.listUsuarios'],
    queryFn: async () => await client.admin.listUsuarios()
  })
}
