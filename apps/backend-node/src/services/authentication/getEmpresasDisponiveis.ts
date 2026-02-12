import { Empresa, prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function getEmpresasDisponiveis(
  authenticatedUsuario: UsuarioResult
): Promise<Empresa[]> {
  const empresas = await prisma.empresa.findMany({
    include: {
      usuarioEmpresas: true
    },
    where: {
      usuarioEmpresas: {
        every: {
          usuario_id: authenticatedUsuario.id
        }
      }
    }
  })

  return empresas
}
