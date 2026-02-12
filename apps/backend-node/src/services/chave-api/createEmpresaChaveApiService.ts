
import { UsuarioResult } from '../../lib/types/usuario-result'
import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import crypto from 'crypto'
import { EmpresaChaveApi, prisma } from '@voz-ativa/database'
import { BadRequestError } from '../../lib/errors'

const commandSchema = yup.object({
  nome: yup.string().required()
})

type CreateChaveApiCommand = yup.InferType<typeof commandSchema>

type CreateChaveApiResult = {
  chaveApi: string
}

export async function createEmpresaChaveApiService (
  authenticatedUsuario: UsuarioResult,
  command: CreateChaveApiCommand
): Promise<CreateChaveApiResult> {
  const { nome } = validateOrThrow<CreateChaveApiCommand>(commandSchema, command)

  const chaveApiPlainText = crypto.randomBytes(32).toString('hex')

  const chaveHash = crypto
    .createHash('sha256')
    .update(chaveApiPlainText)
    .digest('hex')

  const chaveUltimosDigitos = chaveApiPlainText.slice(-4)

  await prisma.empresaChaveApi.create({
    data: {
      usuario_id: authenticatedUsuario.id,
      empresa_id: authenticatedUsuario.empresa!.id,
      chave_hash: chaveHash,
      chave_ultimos_digitos: chaveUltimosDigitos,
      nome
    }
  })

  return {
    chaveApi: chaveApiPlainText
  }
}
