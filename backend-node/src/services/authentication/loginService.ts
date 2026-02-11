import * as yup from 'yup'
import { prisma } from '../../lib/prisma'
import { IResult } from '../../lib/interface/result'
import { Usuario } from '../../../generated/prisma/browser'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  senha: yup.string().required()
})

export type LoginCommand = yup.InferType<typeof commandSchema>

export type LoginResult = IResult<Usuario>

export async function loginService(command: LoginCommand): Promise<LoginResult> {
  try {
    const { email, senha } = commandSchema.validateSync(command);

    const user = await prisma.usuario.findFirst({
      where: {
        email: {
          equals: email,
        }
      }
    })

    if (!user) {
      return {
        isError: true,
        errorMessage: 'Usuário não encontrado'
      }
    }

    const isValid = user.senha === senha

    if (!isValid) {
      return {
        isError: true,
        errorMessage: 'Senha inválida'
      }
    }

    return {
      isError: false,
      data: user
    }
  } catch (e) {
    return {
      isError: true,
      errorMessage: e
    }
  }
}
