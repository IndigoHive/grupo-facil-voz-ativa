import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { SelectEmpresaCommand } from '../../client/clients/authentication/authentication-types'

export function useSelectEmpresa() {
  const client = useClient()

  return useMutation({
    mutationFn: async (command: SelectEmpresaCommand) => {
      return await client.authentication.selectEmpresa(command)
    },
    mutationKey: ['select-empresa']
  })
}
