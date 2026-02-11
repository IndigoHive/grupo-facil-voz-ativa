
import { EmpresaChaveApi } from '../../../generated/prisma/client'
import { UsuarioResult } from '../../lib/types/usuario-result'
import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '../../lib/prisma'
import crypto from 'crypto'

const commandSchema = yup.object({
  nome: yup.string().required()
})

type CreateChaveApiCommand = yup.InferType<typeof commandSchema>

export async function createEmpresaChaveApiService (
  authenticatedUsuario: UsuarioResult,
  command: CreateChaveApiCommand
): Promise<EmpresaChaveApi> {
  const { nome } = validateOrThrow<CreateChaveApiCommand>(commandSchema, command)

  // Gera um hash seguro de 32 bytes em hexadecimal
  const chaveHash = crypto.randomBytes(32).toString('hex')

  const chaveUltimosDigitos = chaveHash.slice(-4)

  return await prisma.empresaChaveApi.create({
    data: {
      usuario_id: authenticatedUsuario.id,
      empresa_id: authenticatedUsuario.empresa_id!,
      chave_hash: chaveHash,
      chave_ultimos_digitos: chaveUltimosDigitos,
    }
  })
}
