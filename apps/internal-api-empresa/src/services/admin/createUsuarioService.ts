import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'
import { prisma } from '@voz-ativa/database'
import { hashPassword } from '../../lib/password'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  isAdmin: yup.boolean(),
  isSuperAdmin: yup.boolean(),
  empresaIds: yup.array().of(yup.string().uuid().required()).optional().nullable()
})

export type CreateUsuarioCommand = yup.InferType<typeof commandSchema>

export type CreateUsuarioResult = {
  id: string
}

export async function createUsuarioService(command: CreateUsuarioCommand): Promise<CreateUsuarioResult> {
  const { email, isAdmin, isSuperAdmin, empresaIds } = validateOrThrow<CreateUsuarioCommand>(commandSchema, command)

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

  if (isAdmin && !empresaIds) {
    throw new BadRequestError('Empresa é obrigatória para usuários administradores')
  }

  if (!isSuperAdmin && !empresaIds) {
    throw new BadRequestError('Empresa é obrigatória para usuários que não são super admin')
  }

  if (isSuperAdmin && empresaIds) {
    throw new BadRequestError('Não é permitido associar uma empresa a um super admin')
  }

  const senhaHash = await hashPassword(email);

  const usuario = await prisma.$transaction(async (tx) => {
    const novoUsuario = await tx.usuario.create({
      data: {
        email,
        senha: senhaHash,
        is_superadmin: isSuperAdmin
      }
    })

    if (empresaIds) {
      await tx.usuarioEmpresa.createMany({
        data: empresaIds.map(empresaId => ({
          usuario_id: novoUsuario.id,
          empresa_id: empresaId,
          is_admin: isAdmin
        }))
      })
    }

    return novoUsuario
  })

  return {
    id: usuario.id
  }
}
