import { Ligacao, prisma } from '@voz-ativa/database'
import { Page } from '../../lib/types/page'
import { Pagination } from '../../lib/types/pagination'
import { UsuarioResult } from '../../lib/types/usuario-result'

export async function getLigacoesPageService (
  authenticatedUsuario: UsuarioResult,
  query: Pagination = { page: 1, pageSize: 20 }
): Promise<Page<Ligacao>> {
  const { page, pageSize } = query

  const skip = (page - 1) * pageSize
  const take = pageSize

  const [data, total] = await Promise.all([
    prisma.ligacao.findMany({
      skip,
      take,
      orderBy: { data_criacao: 'desc' },
      where: {
        // TO-DO: filtros
        empresa_id: authenticatedUsuario.empresa_id || undefined,
      },
    }),
    prisma.ligacao.count({
      where: {
        empresa_id: authenticatedUsuario.empresa_id || undefined,
      },
    })
  ])

  return {
    data,
    total,
    page,
    pageSize,
  }
}
