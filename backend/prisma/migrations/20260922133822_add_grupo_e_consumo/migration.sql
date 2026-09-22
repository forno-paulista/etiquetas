-- AlterEnum
ALTER TYPE "TipoMovimentoLote" ADD VALUE 'CONSUMO';

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "grupoId" TEXT;

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT,
    "grupoPaiId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Grupo_grupoPaiId_idx" ON "Grupo"("grupoPaiId");

-- CreateIndex
CREATE INDEX "Produto_grupoId_idx" ON "Produto"("grupoId");

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_grupoPaiId_fkey" FOREIGN KEY ("grupoPaiId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
