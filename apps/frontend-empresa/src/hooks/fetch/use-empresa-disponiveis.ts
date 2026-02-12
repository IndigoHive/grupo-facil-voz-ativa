import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'

export function useEmpresaDisponiveis(){
  const client = useClient()

  return useQuery({
    queryKey: ['empresas-disponiveis'],
    queryFn: async () => {
      return await client.authentication.getEmpresasDisponiveis()
    }
  })
}
