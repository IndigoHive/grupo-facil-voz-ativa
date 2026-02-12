import { Empresa, prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function getEmpresasDisponiveis(
  authenticatedUsuario: UsuarioResult
): Promise<Empresa[]> {

  if (authenticatedUsuario.isSuperAdmin) {
    return await prisma.empresa.findMany({
      where: {
        status: true
      },
      orderBy: {
        nome: 'asc'
      }
    })
  }

  const usuarioEmpresas = await prisma.usuarioEmpresa.findMany({
    where: {
      usuario_id: authenticatedUsuario.id,
      is_ativo: true
    },
    include: {
      empresa: true
    },
    distinct: ['empresa_id']
  })

  return usuarioEmpresas.map(usuarioEmpresa => usuarioEmpresa.empresa)
}
