import * as yup from 'yup'
import { prisma } from '../../lib/prisma'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { verifyPassword } from '../../lib/password'
import { UsuarioResult } from '../../lib/types/usuario-result'


const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required(),
  empresaSlug: yup.string().required()
})

export type LoginCommand = yup.InferType<typeof commandSchema>

export async function loginService(command: LoginCommand): Promise<UsuarioResult> {
  const { email, senha, empresaSlug } = validateOrThrow<LoginCommand>(commandSchema, command);

  const empresa = await prisma.empresa.findFirst({
    where: {
      slug: { //TO-DO: implementar slug
        equals: empresaSlug
      }
    }
  })

  if (!empresa) {
    throw new NotFoundError('Empresa não encontrada');
  }

  var user = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email,
      }
    }
  })

  if (!user) {
    throw new NotFoundError('Usuário não encontrado');
  }

  if (user.senha === null) {
    throw new BadRequestError('Usuário não possui senha definida');
  }

  const isValid = await verifyPassword(senha, user.senha);

  if (!isValid) {
    throw new BadRequestError('Senha inválida');
  }

  if (user.is_superadmin) {
    user.empresa_id = empresa.id
  }

  const { senha: _, ...userWithoutPassword } = user;

  return userWithoutPassword
}
