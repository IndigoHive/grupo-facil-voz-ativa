import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { slugify } from '../../lib/slugify'
import { BadRequestError } from '../../lib/errors'
import { prisma } from '@voz-ativa/database'

const commandSchema = yup.object({
  nome: yup.string().required()
})

export type CreateEmpresaCommand = yup.InferType<typeof commandSchema>

export async function createEmpresaService (
  command: CreateEmpresaCommand
): Promise<void> {
  const { nome } = validateOrThrow<CreateEmpresaCommand>(commandSchema, command)
  const slug = slugify(nome)

  const existingEmpresa = await prisma.empresa.findUnique({
    where: {
      slug
    }
  })

  if (existingEmpresa) {
    throw new BadRequestError('Empresa já existe')
  }

  await prisma.empresa.create({
    data: {
      nome,
      slug
    }
  })
}
