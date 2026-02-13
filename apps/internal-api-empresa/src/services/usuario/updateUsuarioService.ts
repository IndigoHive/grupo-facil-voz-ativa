import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { BadRequestError } from '../../lib/errors'
import { prisma } from '@voz-ativa/database'

const updateSchema = yup.object({
  isAtivo: yup.boolean().optional(),
  isAdmin: yup.boolean().optional()
})

type UpdateUsuarioCommand = yup.InferType<typeof updateSchema>

export async function updateUsuarioService (authenticatedUsuario: UsuarioResult, id: string, data: UpdateUsuarioCommand) {
  const { isAdmin, isAtivo } = validateOrThrow<UpdateUsuarioCommand>(updateSchema, data)

  if (authenticatedUsuario.empresa?.isAdmin !== true) {
    throw new BadRequestError('Apenas administradores da empresa podem atualizar usuários')
  }

  const usuarioEmpresa = await prisma.usuarioEmpresa.findFirst({
    where: {
      empresa_id: authenticatedUsuario.empresa!.id,
      usuario_id: id
    }
  })

  if (!usuarioEmpresa) {
    throw new BadRequestError('Usuário não encontrado')
  }

  await prisma.usuarioEmpresa.update({
    where: {
      id: usuarioEmpresa.id
    },
    data: {
      is_ativo: isAtivo !== undefined ? isAtivo : usuarioEmpresa.is_ativo,
      is_admin: isAdmin !== undefined ? isAdmin : usuarioEmpresa.is_admin
    }
  })
}
