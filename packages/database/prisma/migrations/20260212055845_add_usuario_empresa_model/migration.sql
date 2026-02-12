/*
  Warnings:

  - You are about to drop the column `empresa_id` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `is_admin` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `is_admin_empresa` on the `Usuario` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_empresa_id_fkey";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "empresa_id",
DROP COLUMN "is_admin",
DROP COLUMN "is_admin_empresa";

-- CreateTable
CREATE TABLE "UsuarioEmpresa" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsuarioEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_usuario_id_empresa_id_key" ON "UsuarioEmpresa"("usuario_id", "empresa_id");

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
