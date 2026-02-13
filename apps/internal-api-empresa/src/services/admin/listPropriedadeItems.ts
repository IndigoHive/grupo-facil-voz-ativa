import { prisma, PropriedadeItem, Prisma } from '@voz-ativa/database'
import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'

const querySchema = yup.object({
  tipoPropriedadeId: yup.string().uuid().optional().nullable()
})

type ListPropriedadeItemsQuery = yup.InferType<typeof querySchema>

export async function listPropriedadeItems(query: ListPropriedadeItemsQuery): Promise<PropriedadeItem[]> {
  const { tipoPropriedadeId } = validateOrThrow<ListPropriedadeItemsQuery>(querySchema, query)

  const where: Prisma.PropriedadeItemWhereInput = {}

  if (tipoPropriedadeId) {
    where.tipo_propriedade_id = tipoPropriedadeId
  }

  const items = await prisma.propriedadeItem.findMany({
    where
  })

  return items
}
