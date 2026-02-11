import * as yup from 'yup'
import { BadRequestError, NotFoundError } from '../../lib/errors'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { verifyPassword } from '../../lib/password'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { prisma } from '@voz-ativa/database'


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

  return {
    id: user.id,
    empresa_slug: empresa.slug,
    data_criacao: user.data_criacao,
    email: user.email,
    empresa_id: user.empresa_id,
    is_admin: user.is_admin,
    is_admin_empresa: user.is_admin_empresa,
    is_superadmin: user.is_superadmin,
  }
}
