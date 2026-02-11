import { UsuarioResult } from '../../lib/types/usuario-result'
import { prisma } from '@voz-ativa/database'
import { NotFoundError } from '../../lib/errors'

export async function cleanUsuarioSenhaService (
  authenticatedUsuario: UsuarioResult,
  usuarioId: string
) {
  const usuario = await prisma.usuario.findFirst({
    where: {
      empresa_id: authenticatedUsuario.empresa_id,
      id: usuarioId
    }
  })

  if (!usuario) {
    throw new NotFoundError('Usuário não encontrado')
  }

  await prisma.usuario.update({
    where: {
      id: usuario?.id
    },
    data: {
      senha: null
    }
  })
}
