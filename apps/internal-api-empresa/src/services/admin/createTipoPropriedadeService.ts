import * as yup from 'yup'
import { validateOrThrow } from '../../lib/validateOrThrow'
import { prisma } from '@voz-ativa/database'

const commandSchema = yup.object({
  nome: yup.string().required(),
  descricao: yup.string().required(),
  empresaId: yup.string().uuid().optional().nullable()
})

type CreateTipoPropriedadeCommand = yup.InferType<typeof commandSchema>

type CreateTipoPropriedadeResult = {
  id: string
}

export async function createTipoPropriedadeService(
  data: CreateTipoPropriedadeCommand
): Promise<CreateTipoPropriedadeResult> {
  const { nome, descricao, empresaId } = validateOrThrow<CreateTipoPropriedadeCommand>(commandSchema, data)

  const tipoPropriedade = await prisma.tipoPropriedade.create({
    data: {
      nome,
      descricao,
      empresa_id: empresaId,
      is_sistema: true
    }
  })

  return {
    id: tipoPropriedade.id
  }
}
