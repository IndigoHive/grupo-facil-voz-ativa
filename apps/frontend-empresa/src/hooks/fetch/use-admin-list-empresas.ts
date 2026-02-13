import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAdminListEmpresas() {
  const client = useClient()

  return useQuery({
    queryKey: ['admin.listEmpresas'],
    queryFn: async () => await client.admin.listEmpresas()
  })
}
