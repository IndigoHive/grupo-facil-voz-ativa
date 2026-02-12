import { UsuarioResult } from '../../lib/types/usuario-result'
import { prisma } from '@voz-ativa/database'
import { NotFoundError } from '../../lib/errors'

export async function cleanUsuarioSenhaService (
  authenticatedUsuario: UsuarioResult,
  usuarioId: string
) {
  const usuarioEmpresa = await prisma.usuarioEmpresa.findFirst({
    where: {
      usuario_id: usuarioId,
      empresa_id: authenticatedUsuario.empresa!.id
    }
  })

  if (!usuarioEmpresa) {
    throw new NotFoundError('Usuário não encontrado')
  }

  await prisma.usuario.update({
    where: {
      id: usuarioEmpresa?.usuario_id
    },
    data: {
      senha: null
    }
  })
}
