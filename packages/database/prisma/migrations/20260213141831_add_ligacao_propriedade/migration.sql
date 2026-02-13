-- CreateTable
CREATE TABLE "TipoPropriedade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "empresa_id" TEXT,
    "is_sistema" BOOLEAN NOT NULL DEFAULT false,
    "is_ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoPropriedade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropriedadeItem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo_propriedade_id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "is_ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadados" JSONB,

    CONSTRAINT "PropriedadeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigacaoPropriedadeItem" (
    "ligacao_id" TEXT NOT NULL,
    "propriedade_item_id" TEXT NOT NULL,

    CONSTRAINT "LigacaoPropriedadeItem_pkey" PRIMARY KEY ("ligacao_id","propriedade_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoPropriedade_nome_empresa_id_key" ON "TipoPropriedade"("nome", "empresa_id");

-- CreateIndex
CREATE INDEX "PropriedadeItem_tipo_propriedade_id_idx" ON "PropriedadeItem"("tipo_propriedade_id");

-- CreateIndex
CREATE INDEX "PropriedadeItem_nome_idx" ON "PropriedadeItem"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "PropriedadeItem_nome_tipo_propriedade_id_empresa_id_key" ON "PropriedadeItem"("nome", "tipo_propriedade_id", "empresa_id");

-- CreateIndex
CREATE INDEX "LigacaoPropriedadeItem_propriedade_item_id_idx" ON "LigacaoPropriedadeItem"("propriedade_item_id");

-- CreateIndex
CREATE INDEX "LigacaoPropriedadeItem_ligacao_id_idx" ON "LigacaoPropriedadeItem"("ligacao_id");

-- AddForeignKey
ALTER TABLE "TipoPropriedade" ADD CONSTRAINT "TipoPropriedade_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropriedadeItem" ADD CONSTRAINT "PropriedadeItem_tipo_propriedade_id_fkey" FOREIGN KEY ("tipo_propriedade_id") REFERENCES "TipoPropriedade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropriedadeItem" ADD CONSTRAINT "PropriedadeItem_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigacaoPropriedadeItem" ADD CONSTRAINT "LigacaoPropriedadeItem_ligacao_id_fkey" FOREIGN KEY ("ligacao_id") REFERENCES "Ligacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigacaoPropriedadeItem" ADD CONSTRAINT "LigacaoPropriedadeItem_propriedade_item_id_fkey" FOREIGN KEY ("propriedade_item_id") REFERENCES "PropriedadeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
