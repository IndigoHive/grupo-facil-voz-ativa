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
    empresas: usuario.usuarioEmpresas.map(ue => ({
      id: ue.empresa_id,
      slug: ue.empresa.slug
    }))
  }))
}
