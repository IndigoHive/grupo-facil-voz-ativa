import { Empresa } from '../../../generated/prisma/client'
import { prisma } from '../../lib/prisma'

export async function listEmpresasService(): Promise<Empresa[]> {
  return await prisma.empresa.findMany();
}
