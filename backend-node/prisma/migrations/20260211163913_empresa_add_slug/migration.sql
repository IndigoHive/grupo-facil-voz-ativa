/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Empresa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Empresa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN     "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EmpresaChaveApi" (
    "id" TEXT NOT NULL,
    "chave_hash" TEXT NOT NULL,
    "chave_ultimos_digitos" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_revogacao" TIMESTAMP(3),
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "EmpresaChaveApi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_slug_key" ON "Empresa"("slug");

-- AddForeignKey
ALTER TABLE "EmpresaChaveApi" ADD CONSTRAINT "EmpresaChaveApi_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpresaChaveApi" ADD CONSTRAINT "EmpresaChaveApi_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
