export type LoginCommand = {
  email: string
  senha: string
}

export type ResetUsuarioSenhaCommand = {
  email: string
}

export type SelectEmpresaCommand = {
  empresaId: string
}

export type Empresa = {
  id: string
  nome: string
  slug: string
}
