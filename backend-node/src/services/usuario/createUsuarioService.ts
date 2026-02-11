import * as yup from "yup";
import { prisma } from '../../lib/prisma'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'
import { hashPassword } from '../../lib/password'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required()
})

export type CreateUsuarioCommand = yup.InferType<typeof commandSchema>


export async function createUsuarioService(data: CreateUsuarioCommand): Promise<void> {
  const { email, senha } = validateOrThrow<CreateUsuarioCommand>(commandSchema, data)

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
      senha: senhaHash
    }
  })
}
