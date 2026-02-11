import * as yup from "yup";
import { prisma } from '../../lib/prisma'
import { IResult } from '../../lib/interface/result'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'

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

  await prisma.usuario.create({
    data: {
      email,
      senha
    }
  })
}
