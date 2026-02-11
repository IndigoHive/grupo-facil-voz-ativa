-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_superadmin" BOOLEAN NOT NULL DEFAULT false,
    "is_admin_empresa" BOOLEAN NOT NULL DEFAULT false,
    "empresa_id" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gatilho" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'WhatsApp',
    "empresa_id" TEXT,
    "usuario_id" TEXT,

    CONSTRAINT "Gatilho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ligacao" (
    "id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome_agente" TEXT,
    "nome_cliente" TEXT,
    "status_resolucao" TEXT,
    "qualidade_servico" TEXT,
    "duracao_ligacao" DOUBLE PRECISION,
    "sentimento_geral_cliente" TEXT,
    "resumo" TEXT,
    "id_unico" TEXT,
    "dialogo" TEXT,
    "variacao_de_sentimento_cliente" TEXT,
    "numero_protocolo" TEXT,
    "cpf_cliente" TEXT,
    "irc_score" INTEGER,
    "irc_score_pilar_1" TEXT,
    "irc_score_pilar_2" TEXT,
    "irc_score_pilar_3" TEXT,
    "irc_score_pilar_4" TEXT,
    "irc_classificacao" TEXT,
    "pilar_1_irc_trechos" TEXT,
    "pilar_2_irc_trechos" TEXT,
    "pilar_3_irc_trechos" TEXT,
    "pilar_4_irc_trechos" TEXT,
    "pilar_1_justificativa" TEXT,
    "pilar_2_justificativa" TEXT,
    "pilar_3_justificativa" TEXT,
    "pilar_4_justificativa" TEXT,
    "silencio_ligacao" DOUBLE PRECISION,
    "pontos_obtidos_rn623" INTEGER,
    "score_conformidade_rn623" DOUBLE PRECISION,
    "nivel_conformidade_rn" TEXT,
    "empresa_id" TEXT,
    "usuario_id" TEXT,

    CONSTRAINT "Ligacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tema" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemaLigacao" (
    "ligacao_id" TEXT NOT NULL,
    "tema_id" TEXT NOT NULL,

    CONSTRAINT "TemaLigacao_pkey" PRIMARY KEY ("ligacao_id","tema_id")
);

-- CreateTable
CREATE TABLE "SentimentoAgente" (
    "id" TEXT NOT NULL,
    "sentimento" TEXT NOT NULL,

    CONSTRAINT "SentimentoAgente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentoAgenteLigacao" (
    "ligacao_id" TEXT NOT NULL,
    "sentimento_agente_id" TEXT NOT NULL,

    CONSTRAINT "SentimentoAgenteLigacao_pkey" PRIMARY KEY ("ligacao_id","sentimento_agente_id")
);

-- CreateTable
CREATE TABLE "SentimentoClienteFinal" (
    "id" TEXT NOT NULL,
    "sentimento" TEXT NOT NULL,

    CONSTRAINT "SentimentoClienteFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentoClienteFinalLigacao" (
    "ligacao_id" TEXT NOT NULL,
    "sentimento_cliente_final_id" TEXT NOT NULL,

    CONSTRAINT "SentimentoClienteFinalLigacao_pkey" PRIMARY KEY ("ligacao_id","sentimento_cliente_final_id")
);

-- CreateTable
CREATE TABLE "SentimentoClienteInicial" (
    "id" TEXT NOT NULL,
    "sentimento" TEXT NOT NULL,

    CONSTRAINT "SentimentoClienteInicial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentoClienteInicialLigacao" (
    "ligacao_id" TEXT NOT NULL,
    "sentimento_cliente_inicial_id" TEXT NOT NULL,

    CONSTRAINT "SentimentoClienteInicialLigacao_pkey" PRIMARY KEY ("ligacao_id","sentimento_cliente_inicial_id")
);

-- CreateTable
CREATE TABLE "CriterioAplicavelRn" (
    "id" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,

    CONSTRAINT "CriterioAplicavelRn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterioAplicavelRnLigacao" (
    "ligacao_id" TEXT NOT NULL,
    "criterio_aplicavel_rn_id" TEXT NOT NULL,

    CONSTRAINT "CriterioAplicavelRnLigacao_pkey" PRIMARY KEY ("ligacao_id","criterio_aplicavel_rn_id")
);

-- CreateTable
CREATE TABLE "CriterioAtendidoRn623" (
    "id" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,

    CONSTRAINT "CriterioAtendidoRn623_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterioAtendidoRn623Ligacao" (
    "ligacao_id" TEXT NOT NULL,
    "criterio_atendido_rn623_id" TEXT NOT NULL,

    CONSTRAINT "CriterioAtendidoRn623Ligacao_pkey" PRIMARY KEY ("ligacao_id","criterio_atendido_rn623_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ligacao_id_unico_key" ON "Ligacao"("id_unico");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gatilho" ADD CONSTRAINT "Gatilho_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gatilho" ADD CONSTRAINT "Gatilho_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ligacao" ADD CONSTRAINT "Ligacao_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ligacao" ADD CONSTRAINT "Ligacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemaLigacao" ADD CONSTRAINT "TemaLigacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemaLigacao" ADD CONSTRAINT "TemaLigacao_tema_id_fkey" FOREIGN KEY ("tema_id") REFERENCES "Tema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoAgenteLigacao" ADD CONSTRAINT "SentimentoAgenteLigacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoAgenteLigacao" ADD CONSTRAINT "SentimentoAgenteLigacao_sentimento_agente_id_fkey" FOREIGN KEY ("sentimento_agente_id") REFERENCES "SentimentoAgente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoClienteFinalLigacao" ADD CONSTRAINT "SentimentoClienteFinalLigacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoClienteFinalLigacao" ADD CONSTRAINT "SentimentoClienteFinalLigacao_sentimento_cliente_final_id_fkey" FOREIGN KEY ("sentimento_cliente_final_id") REFERENCES "SentimentoClienteFinal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoClienteInicialLigacao" ADD CONSTRAINT "SentimentoClienteInicialLigacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentoClienteInicialLigacao" ADD CONSTRAINT "SentimentoClienteInicialLigacao_sentimento_cliente_inicial_fkey" FOREIGN KEY ("sentimento_cliente_inicial_id") REFERENCES "SentimentoClienteInicial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioAplicavelRnLigacao" ADD CONSTRAINT "CriterioAplicavelRnLigacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioAplicavelRnLigacao" ADD CONSTRAINT "CriterioAplicavelRnLigacao_criterio_aplicavel_rn_id_fkey" FOREIGN KEY ("criterio_aplicavel_rn_id") REFERENCES "CriterioAplicavelRn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioAtendidoRn623Ligacao" ADD CONSTRAINT "CriterioAtendidoRn623Ligacao_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterioAtendidoRn623Ligacao" ADD CONSTRAINT "CriterioAtendidoRn623Ligacao_criterio_atendido_rn623_id_fkey" FOREIGN KEY ("criterio_atendido_rn623_id") REFERENCES "CriterioAtendidoRn623"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
