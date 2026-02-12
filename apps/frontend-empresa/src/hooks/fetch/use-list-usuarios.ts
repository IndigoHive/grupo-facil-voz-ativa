import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useListUsuarios() {
  const client = useClient()

  return useQuery({
    queryKey: ['usuarios.list'],
    queryFn: async () => await client.usuarios.list()
  })
}
