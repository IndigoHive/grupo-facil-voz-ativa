import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '@voz-ativa/database'
import { hashPassword } from '../../lib/password'
import { BadRequestError } from '../../lib/errors'

const commandSchema = yup.object({
  novaSenha: yup.string().required(),
  email: yup.string().email().required()
})

type ResetUsuarioSenhaCommand = yup.InferType<typeof commandSchema>

export async function resetUsuarioSenhaCommand(command: ResetUsuarioSenhaCommand) {
  const { novaSenha, email } = validateOrThrow<ResetUsuarioSenhaCommand>(commandSchema, command);

  const usuario = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email
      },
      senha: {
        equals: null
      }
    }
  })

  if (!usuario) {
    throw new BadRequestError('Usuário não encontrado ou já possui senha definida');
  }
  const senhaHash = await hashPassword(novaSenha)

  await prisma.usuario.update({
    where: {
      id: usuario.id
    },
    data: {
      senha: senhaHash
    }
  })
}
