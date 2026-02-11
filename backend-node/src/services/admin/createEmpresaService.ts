import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '../../lib/prisma'

const commandSchema = yup.object({
  nome: yup.string().required()
})

export type CreateEmpresaCommand = yup.InferType<typeof commandSchema>

export async function createEmpresaService (
  command: CreateEmpresaCommand
): Promise<void> {
  const { nome } = validateOrThrow<CreateEmpresaCommand>(commandSchema, command)

  await prisma.empresa.create({
    data: {
      nome
    }
  })
}
