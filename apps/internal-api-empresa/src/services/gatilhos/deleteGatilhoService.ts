import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { BadRequestError } from '../../lib/errors'
import { validateIsAdminOrSuperAdmin } from '../../lib/validateIsAdminOrSuperAdmin'

export async function deleteGatilhoService(
  authenticatedUsuario: UsuarioResult,
  id: string
): Promise<void> {
  validateIsAdminOrSuperAdmin(authenticatedUsuario)

  await prisma.gatilho.delete({
    where: {
      empresa_id: authenticatedUsuario.empresa!.id,
      id
    }
  })
}
