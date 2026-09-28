-- CreateTable
CREATE TABLE "EventoDominio" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "agregado" TEXT NOT NULL,
    "agregadoId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "ocorridoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoDominio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoDominio_tipo_idx" ON "EventoDominio"("tipo");

-- CreateIndex
CREATE INDEX "EventoDominio_agregado_agregadoId_idx" ON "EventoDominio"("agregado", "agregadoId");
