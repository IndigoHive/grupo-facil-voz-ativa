export type CreateChaveApiCommand = {
  nome: string
}

export type ChaveApi = {
  id: string
  chave_hash: string
  chave_ultimos_digitos: string
  empresa_id: string
  data_criacao: string
  data_revogacao: string | null
  usuario_id: string
  nome?: string
}

export type CreateChaveApiResult = {
  chaveApi: string
}
