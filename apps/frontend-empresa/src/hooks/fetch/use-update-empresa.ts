import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useClient } from '../use-client'
import type { UpdateEmpresaCommand } from '../../client/clients/admin/admin-types'

export function useUpdateEmpresa() {
  const client = useClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['admin.updateEmpresa'],
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmpresaCommand }) =>
      await client.admin.updateEmpresa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.listEmpresas'] })
    }
  })
}
