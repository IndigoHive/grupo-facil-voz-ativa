import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { ListPropriedadeItemsQuery } from '../../client/clients/admin/admin-types'

export function useAdminListPropriedadeItems(query?: ListPropriedadeItemsQuery) {
  const client = useClient()

  return useQuery({
    queryKey: ['admin.listPropriedadeItems', query],
    queryFn: async () => await client.admin.listPropriedadeItems(query)
  })
}
