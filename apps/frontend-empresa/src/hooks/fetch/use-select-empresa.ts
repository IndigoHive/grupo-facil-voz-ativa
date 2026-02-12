import { useMutation } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { SelectEmpresaCommand } from '../../client/clients/authentication/authentication-types'
import { toast } from 'sonner'

export function useSelectEmpresa() {
  const client = useClient()

  return useMutation({
    mutationFn: async (command: SelectEmpresaCommand) => {
      return await client.authentication.selectEmpresa(command)
    },
    mutationKey: ['select-empresa'],
    onSuccess: () => {
      toast.success('Empresa selecionada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao selecionar empresa')
    }
  })
}
