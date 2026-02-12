export type CreateEmpresaCommand = {
  nome: string
}

export type UpdateEmpresaCommand = {
  nome?: string
  status?: boolean
}

export type Empresa = {
  id: string
  nome: string
  slug: string
  status: boolean
  data_criacao: string
}

export type CleanUsuarioSenhaResponse = {
  message: string
}
