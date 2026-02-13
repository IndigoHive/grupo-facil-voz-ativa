import { prisma, TipoPropriedade } from '@voz-ativa/database'

export async function listTipoPropriedadesService(): Promise<TipoPropriedade[]> {
  const result = await prisma.tipoPropriedade.findMany()

  return result
}
