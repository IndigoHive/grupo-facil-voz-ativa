import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useListChavesApi() {
  const client = useClient()

  return useQuery({
    queryKey: ['chaveApi.list'],
    queryFn: async () => await client.chavesApi.list()
  })
}
