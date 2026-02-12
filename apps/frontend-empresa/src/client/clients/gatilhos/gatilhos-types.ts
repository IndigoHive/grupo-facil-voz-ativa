export type CreateGatilhoCommand = {
  descricao: string
  destinatario: string
  tipo: 'email' | 'whatsapp'
}

export type UpdateGatilhoCommand = {
  descricao: string
}

export type Gatilho = {
  id: string
  descricao: string
  destinatario: string
  tipo: string
  empresa_id: string | null
  usuario_id: string | null
}
