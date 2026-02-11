import * as yup from "yup";
import { prisma } from '../../lib/prisma'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'
import { hashPassword } from '../../lib/password'
import { UsuarioResult } from '../../lib/types/usuario-result'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required(),
  isAdmin: yup.boolean().optional()
})

export type CreateUsuarioCommand = yup.InferType<typeof commandSchema>


export async function createUsuarioService(
  authenticatedUsuario: UsuarioResult,
  command: CreateUsuarioCommand
): Promise<void> {
  const { email, senha, isAdmin } = validateOrThrow<CreateUsuarioCommand>(commandSchema, command)

  const existingUser = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email
      }
    }
  })

  if (existingUser) {
    throw new BadRequestError(`Usuário já existe com o email "${email}"`)
  }

  const senhaHash = await hashPassword(senha);
  await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash,
      is_admin: isAdmin,
      empresa_id: authenticatedUsuario.empresa_id
    }
  })
}
