import { EmpresaChaveApi, prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function listEmpresaChaveApiService (
  authenticatedUsuario: UsuarioResult
): Promise<EmpresaChaveApi[]> {
  return await prisma.empresaChaveApi.findMany({
    where: {
      empresa_id: authenticatedUsuario.empresa_id!
    }
  })
}
