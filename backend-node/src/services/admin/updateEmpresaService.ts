import * as  yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '../../lib/prisma'
import { Empresa } from '../../../generated/prisma/client'
import { slugify } from '../../lib/slugify'

const commandSchema = yup.object({
  nome: yup.string().optional(),
  status: yup.boolean().optional()
})

type UpdateEmpresaCommand = yup.InferType<typeof commandSchema>

export async function updateEmpresaService(id: string, data: UpdateEmpresaCommand): Promise<void> {
  const { nome, status } = validateOrThrow<UpdateEmpresaCommand>(commandSchema, data)

  var newData: Partial<Empresa> = {}

  if (nome) {
    newData.nome = nome
    newData.slug = slugify(nome)
  }

  if (status !== undefined) {
    newData.status = status
  }

  await prisma.empresa.update({
    where: { id },
    data: {
      ...newData
    }
  })
}
