import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '@voz-ativa/database'
import { BadRequestError } from '../../lib/errors'
import { UsuarioResult } from '../../lib/types/usuario-result'

const schema = yup.object({
  empresaId: yup.string().required()
})

type SelectEmpresaCommand = yup.InferType<typeof schema>

export async function selectEmpresa (
  authenticatedUsuario: UsuarioResult,
  data: SelectEmpresaCommand
): Promise<UsuarioResult> {
  const { empresaId } = validateOrThrow<SelectEmpresaCommand>(schema, data)

  const empresaExists = await prisma.empresa.findFirst({
    where: {
      id: empresaId
    }
  })

  if (!empresaExists) {
    throw new BadRequestError(`Empresa com id "${empresaId}" não encontrada`)
  }

  const usuarioEmpresa = await prisma.usuarioEmpresa.findFirst({
    where: {
      empresa_id: empresaExists.id,
      usuario_id: authenticatedUsuario.id
    }
  })

  var isAdmin:boolean = usuarioEmpresa?.is_admin ?? false
  var isAtivo: boolean = usuarioEmpresa?.is_ativo ?? false

  if (authenticatedUsuario.isSuperAdmin) {
    isAdmin = true
    isAtivo = true
  }

  if (!usuarioEmpresa && !authenticatedUsuario.isSuperAdmin) {
    throw new BadRequestError(`Usuário não pertence à empresa com id "${empresaId}"`)
  }

  const { empresa, ...rest } = authenticatedUsuario

  return {
    ...rest,
    empresa: {
      id: empresaExists.id,
      slug: empresaExists.slug,
      isAdmin,
      isAtivo
    }
  }
}
