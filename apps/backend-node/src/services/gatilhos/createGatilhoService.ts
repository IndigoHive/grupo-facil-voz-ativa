import * as yup from 'yup'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { Gatilho, prisma } from '@voz-ativa/database'
import { validateOrThrow } from '../../lib/validateOrThrow'

const commandSchema = yup.object({
  descricao: yup.string().required('A descrição é obrigatória'),
  destinatario: yup.string().required('O destinatário é obrigatório'),
  tipo: yup.string().oneOf(['email', 'whatsapp']).required('O tipo é obrigatório')
})

export type CreateGatilhoCommand = yup.InferType<typeof commandSchema>

export async function createGatilhoService(
  authenticatedUsuario: UsuarioResult,
  command: CreateGatilhoCommand
): Promise<Gatilho> {
  const validateValues = validateOrThrow<CreateGatilhoCommand>(commandSchema, command)

  const result = await prisma.gatilho.create({
    data: {
      empresa_id: authenticatedUsuario.empresa_id,
      usuario_id: authenticatedUsuario.id,
      ...validateValues
    }
  })

  return result
}
