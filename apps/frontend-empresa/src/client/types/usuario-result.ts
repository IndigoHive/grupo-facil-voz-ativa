export type UsuarioResult = {
  id: string
  email: string
  dataCriacao: string
  isSuperAdmin: boolean
  empresa?: {
    id: string
    slug: string
    isAdmin: boolean
    isAtivo: boolean
  }
}
