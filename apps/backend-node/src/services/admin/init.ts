import { prisma } from '@voz-ativa/database'
import { hashPassword } from '../../lib/password'
import { slugify } from '../../lib/slugify'
import { BadRequestError } from '../../lib/errors'

export async function initLocal () {
  const existingData = await prisma.usuario.findFirst({})

  if (existingData) {
    throw new BadRequestError('Dados já populados')
  }

  const senhaHash = await hashPassword('admin')

  const usuario = await prisma.usuario.create({
    data: {
      email: 'admin@admin.com',
      senha: senhaHash,
      is_superadmin: true
    }
  })

  const empresas = await prisma.empresa.create({
    data: {
      nome: 'Empresa 1',
      slug: slugify('Empresa 1')
    }
  })

  await prisma.usuarioEmpresa.create({
    data: {
      empresa_id: empresas.id,
      usuario_id: usuario.id,
      is_admin: true
    }
  })
}
