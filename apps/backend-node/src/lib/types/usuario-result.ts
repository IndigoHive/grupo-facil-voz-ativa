export type UsuarioResult = {
  id: string
  email: string
  dataCriacao: Date
  isSuperAdmin: boolean
  empresa?: {
    id: string
    slug: string
    isAdmin: boolean
  }
}
