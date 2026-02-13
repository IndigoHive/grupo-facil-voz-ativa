import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAdminGetTipoPropriedadeById(id?: string) {
  const client = useClient()

  return useQuery({
    queryKey: ['admin.getTipoPropriedadeById', id],
    queryFn: async () => {
      if (!id) return

      return await client.admin.getTipoPropriedadeById(id)
    },
    enabled: !!id
  })
}
