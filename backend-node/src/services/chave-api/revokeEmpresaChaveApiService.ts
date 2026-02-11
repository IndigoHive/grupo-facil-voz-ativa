import { prisma } from '../../lib/prisma'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function revokeEmpresaChaveApiService(
  authenticatedUsuario: UsuarioResult,
  id: string
): Promise<void> {
  await prisma.empresaChaveApi.update({
    where: {
      id,
      usuario_id: authenticatedUsuario.id
    },
    data: {
      data_revogacao: new Date()
    }
  })
}
