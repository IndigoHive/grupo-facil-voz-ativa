import { Gatilho, prisma } from '@voz-ativa/database'
import * as yup from 'yup'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { validateIsAdminOrSuperAdmin } from '../../lib/validateIsAdminOrSuperAdmin'

const commandSchema = yup.object({
  descricao: yup.string().required('A descrição é obrigatória')
})

export type UpdateGatilhoCommand = yup.InferType<typeof commandSchema>

export async function updateGatilhoService(
  authenticatedUsuario: UsuarioResult,
  id: string,
  command: UpdateGatilhoCommand
): Promise<Gatilho> {
  validateIsAdminOrSuperAdmin(authenticatedUsuario)
  const validateValues = validateOrThrow<UpdateGatilhoCommand>(commandSchema, command)

  const result = await prisma.gatilho.update({
    where: {
      id,
      empresa_id: authenticatedUsuario.empresa!.id
    },
    data: {
      ...validateValues
    }
  })

  return result
}
