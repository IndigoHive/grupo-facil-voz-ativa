import { Ligacao, LigacaoPropriedadeItem, prisma, TipoPropriedade } from '@voz-ativa/database'
import { Page } from '../../lib/types/page'
import { Pagination } from '../../lib/types/pagination'
import { UsuarioResult } from '../../lib/types/usuario-result'

type PropriedadeItem = {
  id: string
  nome: string
}

type PropriedadeAgrupada = {
  id: string
  nome: string
  itens: PropriedadeItem[]
}

type LigacaoFormatada = Omit<Ligacao, 'ligacaoPropriedadeItems'> & {
  propriedades: PropriedadeAgrupada[]
}

export async function getLigacoesPageService (
  authenticatedUsuario: UsuarioResult,
  query: Pagination = { page: 1, pageSize: 20 }
): Promise<Page<LigacaoFormatada>> {
  const { page, pageSize } = query

  const skip = (page - 1) * pageSize
  const take = pageSize

  const [ligacoes, total] = await Promise.all([
    prisma.ligacao.findMany({
      skip,
      take,
      orderBy: { data_criacao: 'desc' },
      where: {
        // TO-DO: filtros
        empresa_id: authenticatedUsuario.empresa!.id || undefined,
      },
      include: {
        ligacaoPropriedadeItems: {
          include: {
            propriedade_item: {
              include: {
                tipo_propriedade: true
              }
            }
          }
        }
      }
    }),
    prisma.ligacao.count({
      where: {
        empresa_id: authenticatedUsuario.empresa!.id || undefined,
      },
    })
  ])

  const data = ligacoes.map(mapLigacaoToResult)

  return {
    data,
    total,
    page,
    pageSize,
  }
}

function mapLigacaoToResult(ligacao: Ligacao & { ligacaoPropriedadeItems: (LigacaoPropriedadeItem & { propriedade_item: PropriedadeItem & { tipo_propriedade: TipoPropriedade } })[] }): LigacaoFormatada {
  const propriedadesMap = new Map<string, PropriedadeAgrupada>()

  ligacao.ligacaoPropriedadeItems.forEach((ligacaoPropriedade) => {
    const { propriedade_item } = ligacaoPropriedade
    const tipoPropriedade = propriedade_item.tipo_propriedade

    if (!propriedadesMap.has(tipoPropriedade.id)) {
      propriedadesMap.set(tipoPropriedade.id, {
        id: tipoPropriedade.id,
        nome: tipoPropriedade.nome,
        itens: []
      })
    }

    propriedadesMap.get(tipoPropriedade.id)!.itens.push({
      id: propriedade_item.id,
      nome: propriedade_item.nome
    })
  })

  const { ligacaoPropriedadeItems, ...ligacaoSemPropriedadeItems } = ligacao

  return {
    ...ligacaoSemPropriedadeItems,
    propriedades: Array.from(propriedadesMap.values())
  }
}
