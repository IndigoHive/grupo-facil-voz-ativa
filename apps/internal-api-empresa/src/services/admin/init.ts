import { Ligacao, prisma, PropriedadeItem } from '@voz-ativa/database'
import { hashPassword } from '../../lib/password'
import { slugify } from '../../lib/slugify'
import { BadRequestError } from '../../lib/errors'
import { randomUUID } from 'crypto'

export async function initLocal () {
  await prisma.$transaction(async tx => {
    const existingData = await tx.usuario.findFirst({})

    if (existingData) {
      throw new BadRequestError('Dados já populados')
    }

    const senhaHash = await hashPassword('admin')

    const usuario = await tx.usuario.create({
      data: {
        email: 'admin@admin.com',
        senha: senhaHash,
        is_superadmin: true
      }
    })

    const empresas = await tx.empresa.create({
      data: {
        nome: 'Empresa 1',
        slug: slugify('Empresa 1')
      }
    })

    const propriedadeTipo = await tx.tipoPropriedade.create({
      data: {
        nome: 'Tipo de Propriedade 1',
        descricao: 'Descrição do Tipo de Propriedade 1'
      }
    })

    const propriedadeItemData: Omit<PropriedadeItem, 'metadados'>[] = Array.from({ length: 10 }).map((_, index) => ({
      nome: `Propriedade Item ${index + 1}`,
      descricao: `Descrição do Propriedade Item ${index + 1}`,
      tipo_propriedade_id: propriedadeTipo.id,
      data_criacao: new Date(),
      id: randomUUID(),
      is_ativo: true,
      empresa_id: null
    }))

    await tx.propriedadeItem.createMany({
      data: propriedadeItemData
    })

    const ligacoes: Ligacao[] = Array.from({ length: 10 }).map((_, index) => ({
      cpf_cliente: `1234567890${index}`,
      data_criacao: new Date(),
      dialogo: `Diálogo de exemplo ${index}`,
      duracao_ligacao: Math.random() * 300, // Duração aleatória entre 0 e 5 minutos
      id_unico: `id_unico_${index}`,
      irc_classificacao: `Classificação ${index}`,
      irc_score: Math.random() * 10, // Duração aleatória entre 0 e 100,
      irc_score_pilar_1: `${Math.random() * 100}`,
      irc_score_pilar_2: `${Math.random() * 100}`,
      irc_score_pilar_3: `${Math.random() * 100}`,
      irc_score_pilar_4: `${Math.random() * 100}`,
      nivel_conformidade_rn: `${Math.random() * 100}`,
      nome_agente: `Agente ${index}`,
      nome_cliente: `Cliente ${index}`,
      numero_protocolo: `numero_protocolo_${index}`,
      pilar_1_irc_trechos: `Trechos do pilar 1 para a ligação ${index}`,
      pilar_2_irc_trechos: `Trechos do pilar 2 para a ligação ${index}`,
      pilar_3_irc_trechos: `Trechos do pilar 3 para a ligação ${index}`,
      pilar_4_irc_trechos: `Trechos do pilar 4 para a ligação ${index}`,
      pilar_1_justificativa: `Justificativa do pilar 1 para a ligação ${index}`,
      pilar_2_justificativa: `Justificativa do pilar 2 para a ligação ${index}`,
      pilar_3_justificativa: `Justificativa do pilar 3 para a ligação ${index}`,
      pilar_4_justificativa: `Justificativa do pilar 4 para a ligação ${index}`,
      pontos_obtidos_rn623: Math.random() * 10,
      qualidade_servico: `${index % 2 === 0 ? 'Bom' : 'Ruim'}`,
      resumo: `Resumo para a ligação ${index}`,
      score_conformidade_rn623: Math.random() * 100,
      sentimento_geral_cliente: `Sentimento geral do cliente para a ligação ${index}`,
      silencio_ligacao: Math.random() * 60,
      status_resolucao: `Status de resolução para a ligação ${index}`,
      variacao_de_sentimento_cliente: `Variação de sentimento do cliente para a ligação ${index}`,
      empresa_id: empresas.id,
      id: randomUUID(),
      usuario_id: null
    }))

    await tx.ligacao.createMany({
      data: ligacoes
    })

    await tx.ligacaoPropriedadeItem.createMany({
      data: ligacoes.flatMap(ligacao =>
        propriedadeItemData.map(item => ({
          ligacao_id: ligacao.id,
          propriedade_item_id: item.id
        }))
      )
    })
  })
}
