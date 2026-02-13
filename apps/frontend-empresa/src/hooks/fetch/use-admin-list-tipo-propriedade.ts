import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useAdminListTipoPropriedade() {
  const client = useClient()

  return useQuery({
    queryKey: ['tipo-propriedade.list'],
    queryFn: async () => await client.admin.listTipoPropriedades()
  })
}
