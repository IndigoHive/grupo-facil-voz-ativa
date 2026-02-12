import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { BadRequestError } from '../../lib/errors'

export async function revokeUsuarioService (
  authenticatedUsuario: UsuarioResult,
  usuarioId: string
): Promise<void> {
  if (authenticatedUsuario.empresa?.isAdmin !== true) {
    throw new BadRequestError('Apenas administradores da empresa podem revogar usuários')
  }

  const usuarioEmpresa = await prisma.usuarioEmpresa.findFirst({
    where: {
      empresa_id: authenticatedUsuario.empresa!.id,
      usuario_id: usuarioId
    }
  })

  if (!usuarioEmpresa) {
    throw new BadRequestError('Usuário não encontrado')
  }

  await prisma.usuarioEmpresa.update({
    where: {
      id: usuarioEmpresa.id
    },
    data: {
      is_ativo: false
    }
  })
}
