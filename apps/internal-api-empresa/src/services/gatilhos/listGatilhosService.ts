import { Gatilho, prisma } from '@voz-ativa/database'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { BadRequestError } from '../../lib/errors'

export async function listGatilhosService (
  authenticatedUsuario: UsuarioResult
): Promise<Gatilho[]> {
  const gatilhos = await prisma.gatilho.findMany({
    where: {
      empresa_id: authenticatedUsuario.empresa!.id
    }
  })

  return gatilhos;
}
