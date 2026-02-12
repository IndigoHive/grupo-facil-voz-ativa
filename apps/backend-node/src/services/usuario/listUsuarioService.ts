import { prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function listUsuarioService(authenticatedUsuario: UsuarioResult): Promise<UsuarioResult[]> {
  const usuarios = await prisma.usuario.findMany({
    where: {
      usuarioEmpresas: {
        every: {
          empresa_id: authenticatedUsuario.empresa!.id
        }
      }
    },
    include: {
      usuarioEmpresas: {
        include: {
          empresa: true
        }
      }
    }
  })

  return usuarios.map(usuario => ({
    dataCriacao: usuario.data_criacao,
    email: usuario.email,
    id: usuario.id,
    isSuperAdmin: usuario.is_superadmin,
    empresa: usuario.usuarioEmpresas[0]?.empresa ? {
      id: usuario.usuarioEmpresas[0].empresa.id,
      slug: usuario.usuarioEmpresas[0].empresa.slug,
      isAdmin: usuario.usuarioEmpresas[0].is_admin
    } : undefined
  }))
}
