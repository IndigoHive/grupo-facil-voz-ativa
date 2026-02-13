import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'
import { prisma } from '@voz-ativa/database'

const commandSchema = yup.object({
  isSuperAdmin: yup.boolean().required(),
  empresaIds: yup.array().of(yup.string().uuid().required()).optional().nullable()
})

type UpdateUsuarioCommand = yup.InferType<typeof commandSchema>

type UpdateUsuarioResult = {
  id: string
}

export async function updateUsuarioService(id: string, command: UpdateUsuarioCommand): Promise<UpdateUsuarioResult> {
  const { isSuperAdmin, empresaIds } = validateOrThrow<UpdateUsuarioCommand>(commandSchema, command)

  if (!isSuperAdmin && !empresaIds) {
    throw new BadRequestError('Empresa é obrigatória para usuários que não são super admin')
  }

  if (isSuperAdmin && empresaIds) {
    throw new BadRequestError('Não é permitido associar uma empresa a um super admin')
  }

  await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.findUnique({
      where: { id }
    })

    if (!usuario) {
      throw new BadRequestError('Usuário não encontrado')
    }


    await tx.usuarioEmpresa.deleteMany({
      where: {
        usuario_id: usuario.id
      }
    })
    
    if (empresaIds) {

      await tx.usuarioEmpresa.createMany({
        data: empresaIds.map(empresaId => ({
          usuario_id: usuario.id,
          empresa_id: empresaId,
          is_admin: true
        }))
      })
    }

    await tx.usuario.update({
      where: { id },
      data: {
        is_superadmin: isSuperAdmin,
      }
    })
  })

  return {
    id
  }
}
