import { useQuery } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { LigacoesPageQuery } from '../../client/clients/ligacoes/ligacoes-types'

export function useLigacoesPage(query?: LigacoesPageQuery) {
  const client = useClient()

  return useQuery({
    queryKey: ['ligacoes.getPage', query],
    queryFn: async () => await client.ligacoes.getPage(query)
  })
}
