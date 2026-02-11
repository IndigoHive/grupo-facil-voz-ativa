import * as yup from 'yup'
import { prisma } from '../../lib/prisma'
import { Usuario } from '../../../generated/prisma/browser'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import { IResult } from '../../lib/interface/result'
import { validateOrThrow } from '../../lib/validateOrThrow'


const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required()
})

export type LoginCommand = yup.InferType<typeof commandSchema>

export async function loginService(command: LoginCommand): Promise<Usuario> {
  const { email, senha } = validateOrThrow<LoginCommand>(commandSchema, command);

  const user = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email,
      }
    }
  })

  if (!user) {
    throw new NotFoundError('Usuário não encontrado');
  }

  const isValid = user.senha === senha;
  if (!isValid) {
    throw new BadRequestError('Senha inválida');
  }

  return user
}
