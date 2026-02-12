export type AuthenticatedUsuario = {
  id: string
  email: string
  dataCriacao: string
  isSuperAdmin: boolean
  empresa?: {
    id: string
    slug: string
  }
}
