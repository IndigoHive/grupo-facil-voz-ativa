import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '@voz-ativa/database'

const commandSchema = yup.object({
  nome: yup.string().required(),
  descricao: yup.string().required(),
  isAtivo: yup.boolean().required()
})

export type UpdateTipoPropriedadeCommand = yup.InferType<typeof commandSchema>

export type UpdateTipoPropriedadeResult = {
  id: string
}

export async function updateTipoPropriedadeService(
  id: string,
  data: UpdateTipoPropriedadeCommand
): Promise<UpdateTipoPropriedadeResult> {
  const { nome, descricao, isAtivo } = validateOrThrow<UpdateTipoPropriedadeCommand>(commandSchema, data)

  await prisma.tipoPropriedade.update({
    where: { id },
    data: { nome, descricao, isAtivo }
  })

  return { id }
}
