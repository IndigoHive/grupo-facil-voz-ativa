import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateEmpresaCommand } from '../../client/clients/admin/admin-types'
import { toast } from 'sonner'

export function useUpdateEmpresa() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.updateEmpresa'],
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmpresaCommand }) =>
      await client.admin.updateEmpresa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listEmpresas'] })
      toast.success('Empresa atualizada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao atualizar empresa')
    }
  })
}
