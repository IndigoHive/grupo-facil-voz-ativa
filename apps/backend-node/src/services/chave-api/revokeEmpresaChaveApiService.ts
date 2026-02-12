
import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function revokeEmpresaChaveApiService(
  authenticatedUsuario: UsuarioResult,
  id: string
): Promise<void> {
  await prisma.empresaChaveApi.update({
    where: {
      id,
      usuario_id: authenticatedUsuario.id,
      empresa_id: authenticatedUsuario.empresa!.id
    },
    data: {
      data_revogacao: new Date()
    }
  })
}
