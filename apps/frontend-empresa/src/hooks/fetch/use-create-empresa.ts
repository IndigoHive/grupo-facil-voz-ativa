import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { CreateEmpresaCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useCreateEmpresa() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.createEmpresa'],
    mutationFn: async (command: CreateEmpresaCommand) => await client.admin.createEmpresa(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listEmpresas'] })
      toast.success('Empresa criada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao criar empresa')
    }
  })
}
