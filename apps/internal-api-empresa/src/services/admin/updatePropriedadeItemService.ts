import { prisma } from '@voz-ativa/database'
import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'

const commandSchema = yup.object({
  nome: yup.string().required(),
  descricao: yup.string().required(),
  isAtivo: yup.boolean().optional().nullable()
})

type UpdatePropriedadeItemCommand = yup.InferType<typeof commandSchema>

type UpdatePropriedadeItemResult = {
  id: string
}

export async function updatePropriedadeItem(
  id: string,
  command: UpdatePropriedadeItemCommand
): Promise<UpdatePropriedadeItemResult> {
  const { nome, descricao, isAtivo } = validateOrThrow<UpdatePropriedadeItemCommand>(commandSchema, command)

  const item = await prisma.propriedadeItem.update({
    where: {
      id
    },
    data: {
      nome,
      descricao,
      is_ativo: isAtivo ?? true
    }
  })

  return {
    id: item.id
  }
}
