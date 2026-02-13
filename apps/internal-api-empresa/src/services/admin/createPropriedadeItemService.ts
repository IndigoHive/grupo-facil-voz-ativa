import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '@voz-ativa/database'

const commandSchema = yup.object({
  tipoPropriedadeId: yup.string().uuid().required(),
  nome: yup.string().required(),
  descricao: yup.string().required(),
})

type CreatePropriedadeItemCommand = yup.InferType<typeof commandSchema>

type CreatePropriedadeItemResult = {
  id: string
}

export async function createPropriedadeItem(
  command: CreatePropriedadeItemCommand
): Promise<CreatePropriedadeItemResult> {
  const { nome, tipoPropriedadeId, descricao } = validateOrThrow<CreatePropriedadeItemCommand>(commandSchema, command)

  const propriedade = await prisma.tipoPropriedade.findFirst({
    where: {
      id: tipoPropriedadeId
    }
  })

  if (!propriedade) {
    throw new Error('Propriedade não encontrada')
  }

  const item = await prisma.propriedadeItem.create({
    data: {
      nome,
      descricao,
      tipo_propriedade_id: tipoPropriedadeId
    }
  })

  return {
    id: item.id
  }
}
