import * as yup from "yup";
import { validateOrThrow } from '../../lib/validateOrThrow'
import { BadRequestError } from '../../lib/errors'
import { hashPassword } from '../../lib/password'
import { UsuarioResult } from '../../lib/types/usuario-result'
import { prisma } from '@voz-ativa/database'
import { validateIsAdminOrSuperAdmin } from '../../lib/validateIsAdminOrSuperAdmin'

const commandSchema = yup.object({
  email: yup.string().email().required(),
  isAdmin: yup.boolean().optional()
})

export type CreateUsuarioCommand = yup.InferType<typeof commandSchema>


export async function createUsuarioService(
  authenticatedUsuario: UsuarioResult,
  command: CreateUsuarioCommand
): Promise<void> {
  validateIsAdminOrSuperAdmin(authenticatedUsuario)

  const { email, isAdmin } = validateOrThrow<CreateUsuarioCommand>(commandSchema, command)

  const existingUser = await prisma.usuario.findFirst({
    where: {
      email: {
        equals: email
      }
    }
  })

  if (existingUser) {
    await prisma.usuarioEmpresa.create({
      data: {
        usuario_id: existingUser.id,
        empresa_id: authenticatedUsuario.empresa!.id,
        is_admin: isAdmin
      }
    })

    return
  }

  const senhaHash = await hashPassword(email);

  const usuario = await prisma.usuario.create({
    data: {
      email,
      senha: senhaHash
    }
  })

  await prisma.usuarioEmpresa.create({
    data: {
      usuario_id: usuario.id,
      empresa_id: authenticatedUsuario.empresa!.id,
      is_admin: isAdmin
    }
  })
}
