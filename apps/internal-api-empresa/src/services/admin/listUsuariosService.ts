import { prisma } from '@voz-ativa/database'

type ListUsuarioResult = {
  id: string
  email: string
  dataCriacao: Date
  isSuperAdmin: boolean
  empresas?: {
    id: string
    slug: string
    isAdmin: boolean
    isAtivo: boolean
  }[]
}

export async function listUsuarioService(): Promise<ListUsuarioResult[]> {
  const usuarios = await prisma.usuario.findMany({
    include: {
      usuarioEmpresas: {
        include: {
          empresa: true
        }
      }
    }
  })

  return usuarios.map(usuario => ({
    dataCriacao: usuario.data_criacao,
    email: usuario.email,
    id: usuario.id,
    isSuperAdmin: usuario.is_superadmin,
    empresas: usuario.usuarioEmpresas.map(ue => ({
      id: ue.empresa.id,
      slug: ue.empresa.slug,
      isAdmin: ue.is_admin,
      isAtivo: ue.is_ativo
    }))
  }))
}
