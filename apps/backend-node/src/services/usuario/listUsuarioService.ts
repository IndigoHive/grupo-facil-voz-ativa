import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function listUsuarioService(authenticatedUsuario: UsuarioResult): Promise<UsuarioResult[]> {
  const usuarios = await prisma.usuario.findMany({
    where: {
      empresa_id: authenticatedUsuario.empresa_id
    }
  })

  return usuarios.map(usuario => {
    const { senha, ...usuarioSemSenha } = usuario
    return usuarioSemSenha
  })
}
