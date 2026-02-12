export type Ligacao = {
  id: string
  data_criacao: string
  nome_agente: string | null
  nome_cliente: string | null
  status_resolucao: string | null
  qualidade_servico: string | null
  duracao_ligacao: number | null
  sentimento_geral_cliente: string | null
  resumo: string | null
  id_unico: string | null
  dialogo: string | null
  variacao_de_sentimento_cliente: string | null
  numero_protocolo: string | null
  cpf_cliente: string | null
  irc_score: number | null
  irc_score_pilar_1: string | null
  irc_score_pilar_2: string | null
  irc_score_pilar_3: string | null
  irc_score_pilar_4: string | null
  irc_classificacao: string | null
  pilar_1_irc_trechos: string | null
  pilar_2_irc_trechos: string | null
  pilar_3_irc_trechos: string | null
  pilar_4_irc_trechos: string | null
  pilar_1_justificativa: string | null
  pilar_2_justificativa: string | null
  pilar_3_justificativa: string | null
  pilar_4_justificativa: string | null
  silencio_ligacao: number | null
  pontos_obtidos_rn623: number | null
  score_conformidade_rn623: number | null
  nivel_conformidade_rn: string | null
  empresa_id: string | null
}

export type Page<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export type LigacoesPageQuery = {
  page?: number
  pageSize?: number
}
