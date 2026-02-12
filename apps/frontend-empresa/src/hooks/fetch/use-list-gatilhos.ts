import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useListGatilhos() {
  const client = useClient()

  return useQuery({
    queryKey: ['gatilhos.list'],
    queryFn: async () => await client.gatilhos.list()
  })
}
