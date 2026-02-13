import { prisma } from '@voz-ativa/database'

export async function getTipoPropriedadeById(id: string) {
  const result = await prisma.tipoPropriedade.findUnique({
    where: { id }
  })
  
  return result
}
