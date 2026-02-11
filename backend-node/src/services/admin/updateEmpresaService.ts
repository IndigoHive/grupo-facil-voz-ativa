import * as  yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '../../lib/prisma'

const commandSchema = yup.object({
  nome: yup.string().optional(),
  status: yup.boolean().optional()
})

type UpdateEmpresaCommand = yup.InferType<typeof commandSchema>

export async function updateEmpresaService(id: string, data: UpdateEmpresaCommand): Promise<void> {
  const { nome, status } = validateOrThrow<UpdateEmpresaCommand>(commandSchema, data)

  await prisma.empresa.update({
    where: { id },
    data: {
      nome,
      status
    }
  })
}
