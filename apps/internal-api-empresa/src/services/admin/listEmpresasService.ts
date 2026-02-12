import { Empresa, prisma } from '@voz-ativa/database'

export async function listEmpresasService(): Promise<Empresa[]> {
  return await prisma.empresa.findMany();
}
