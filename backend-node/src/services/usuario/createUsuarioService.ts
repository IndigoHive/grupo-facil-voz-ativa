import * as yup from "yup";
import { prisma } from '../../lib/prisma'
import { IResult } from '../../lib/interface/result'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required()
})

export type CreateUsuarioCommand = yup.InferType<typeof commandSchema>

export type CreateUsuarioResult = IResult<void>

export async function createUsuarioService(data: CreateUsuarioCommand): Promise<CreateUsuarioResult> {
  const { email, senha } = commandSchema.validateSync(data)

  try {
    await prisma.usuario.create({
      data: {
        email,
        senha
      }
    })

    return {
      isError: false
    }
  } catch (e) {
    return {
      isError: true,
      errorMessage: e
    }
  }
}
