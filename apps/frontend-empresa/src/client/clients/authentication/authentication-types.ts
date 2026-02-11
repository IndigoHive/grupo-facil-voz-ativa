export type LoginCommand = {
  email: string
  senha: string
  empresaSlug: string
}

export type ResetUsuarioSenhaCommand = {
  email: string
}
