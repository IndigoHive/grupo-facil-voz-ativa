import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { BadRequestError } from '../../lib/errors'

export async function deleteGatilhoService(
  authenticatedUsuario: UsuarioResult,
  id: string
): Promise<void> {
  await prisma.gatilho.delete({
    where: {
      empresa_id: authenticatedUsuario.empresa!.id,
      id
    }
  })
}
