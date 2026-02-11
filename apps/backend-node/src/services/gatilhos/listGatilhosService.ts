import { Gatilho, prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function listGatilhosService (
  authenticatedUsuario: UsuarioResult
): Promise<Gatilho[]> {
  const gatilhos = await prisma.gatilho.findMany({
    where: {
      empresa_id: authenticatedUsuario.empresa_id
    }
  })

  return gatilhos;
}
