export type CreateUsuarioCommand = {
  email: string
  senha: string
  isAdmin?: boolean
}

export type Usuario = {
  id: string
  email: string
  is_admin: boolean
  is_superadmin: boolean
  is_admin_empresa: boolean
  empresa_id: string | null
  data_criacao: string
}

export type CreateUsuarioResponse = {
  message: string
}
