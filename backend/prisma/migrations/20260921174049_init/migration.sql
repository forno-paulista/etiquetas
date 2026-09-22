-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoLocal" AS ENUM ('CD', 'LOJA');

-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT');

-- CreateEnum
CREATE TYPE "TipoMovimentoLote" AS ENUM ('ENTRADA', 'TRANSFERENCIA_SAIDA', 'TRANSFERENCIA_ENTRADA', 'DESCARTE', 'PRODUCAO_CONSUMO', 'PRODUCAO_ENTRADA', 'AJUSTE_CONTAGEM');

-- CreateEnum
CREATE TYPE "StatusTransferencia" AS ENUM ('EM_TRANSITO', 'CONCLUIDA', 'DIVERGENTE');

-- CreateEnum
CREATE TYPE "NaturezaTransferencia" AS ENUM ('INTERNA', 'VENDA_INTERCOMPANY');

-- CreateEnum
CREATE TYPE "StatusAjusteExterno" AS ENUM ('PENDENTE', 'ENVIADO_FILA', 'AJUSTADO_NO_ERP', 'NAO_APLICAVEL');

-- CreateEnum
CREATE TYPE "StatusAjustePendente" AS ENUM ('PENDENTE', 'LANCADO_MANUALMENTE');

-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'GESTOR_CD', 'GESTOR_LOJA', 'OPERADOR');

-- CreateEnum
CREATE TYPE "SistemaExterno" AS ENUM ('SAIPOS', 'VAREJO_FACIL');

-- CreateTable
CREATE TABLE "Organizacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Local" (
    "id" TEXT NOT NULL,
    "organizacaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoLocal" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Local_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeMedida" "UnidadeMedida" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "codigoLote" TEXT NOT NULL,
    "dataFabricacao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaldoLote" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "quantidadeAtual" DECIMAL(12,3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaldoLote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentoLote" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "tipo" "TipoMovimentoLote" NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "localOrigemId" TEXT,
    "localDestinoId" TEXT,
    "referenciaId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentoLote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transferencia" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "localOrigemId" TEXT NOT NULL,
    "localDestinoId" TEXT NOT NULL,
    "status" "StatusTransferencia" NOT NULL DEFAULT 'EM_TRANSITO',
    "quantidadeConfirmada" DECIMAL(12,3),
    "natureza" "NaturezaTransferencia" NOT NULL DEFAULT 'INTERNA',
    "referenciaFiscal" TEXT,
    "usuarioEnvioId" TEXT NOT NULL,
    "usuarioRecebimentoId" TEXT,
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmadaEm" TIMESTAMP(3),

    CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producao" (
    "id" TEXT NOT NULL,
    "produtoSaidaId" TEXT NOT NULL,
    "loteSaidaId" TEXT NOT NULL,
    "quantidadeProduzida" DECIMAL(12,3) NOT NULL,
    "validadeSaida" TIMESTAMP(3) NOT NULL,
    "localId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Producao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumoProducao" (
    "id" TEXT NOT NULL,
    "producaoId" TEXT NOT NULL,
    "loteOrigemId" TEXT,
    "origemDesconhecida" BOOLEAN NOT NULL DEFAULT false,
    "descricaoOrigem" TEXT,
    "quantidadeConsumida" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "ConsumoProducao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotivoDescarte" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MotivoDescarte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Descarte" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "motivoId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusAjusteExterno" "StatusAjusteExterno" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "Descarte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjustePendente" (
    "id" TEXT NOT NULL,
    "descarteId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "status" "StatusAjustePendente" NOT NULL DEFAULT 'PENDENTE',
    "usuarioQueMarcouId" TEXT,
    "data" TIMESTAMP(3),

    CONSTRAINT "AjustePendente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioLocal" (
    "usuarioId" TEXT NOT NULL,
    "localId" TEXT NOT NULL,

    CONSTRAINT "UsuarioLocal_pkey" PRIMARY KEY ("usuarioId","localId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapeamentoProdutoExterno" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "localId" TEXT,
    "sistema" "SistemaExterno" NOT NULL,
    "codigoExterno" TEXT NOT NULL,

    CONSTRAINT "MapeamentoProdutoExterno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegracaoExterna" (
    "id" TEXT NOT NULL,
    "tipo" "SistemaExterno" NOT NULL,
    "localId" TEXT NOT NULL,
    "configuracao" JSONB NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegracaoExterna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "valoresAntes" JSONB,
    "valoresDepois" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lote_qrCodeId_key" ON "Lote"("qrCodeId");

-- CreateIndex
CREATE INDEX "Lote_produtoId_idx" ON "Lote"("produtoId");

-- CreateIndex
CREATE INDEX "Lote_dataValidade_idx" ON "Lote"("dataValidade");

-- CreateIndex
CREATE INDEX "Lote_codigoLote_idx" ON "Lote"("codigoLote");

-- CreateIndex
CREATE INDEX "SaldoLote_localId_idx" ON "SaldoLote"("localId");

-- CreateIndex
CREATE UNIQUE INDEX "SaldoLote_loteId_localId_key" ON "SaldoLote"("loteId", "localId");

-- CreateIndex
CREATE INDEX "MovimentoLote_loteId_idx" ON "MovimentoLote"("loteId");

-- CreateIndex
CREATE INDEX "MovimentoLote_tipo_idx" ON "MovimentoLote"("tipo");

-- CreateIndex
CREATE INDEX "MovimentoLote_referenciaId_idx" ON "MovimentoLote"("referenciaId");

-- CreateIndex
CREATE INDEX "Transferencia_loteId_idx" ON "Transferencia"("loteId");

-- CreateIndex
CREATE INDEX "Transferencia_status_idx" ON "Transferencia"("status");

-- CreateIndex
CREATE INDEX "Transferencia_localDestinoId_status_idx" ON "Transferencia"("localDestinoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Producao_loteSaidaId_key" ON "Producao"("loteSaidaId");

-- CreateIndex
CREATE INDEX "ConsumoProducao_producaoId_idx" ON "ConsumoProducao"("producaoId");

-- CreateIndex
CREATE INDEX "ConsumoProducao_loteOrigemId_idx" ON "ConsumoProducao"("loteOrigemId");

-- CreateIndex
CREATE UNIQUE INDEX "MotivoDescarte_nome_key" ON "MotivoDescarte"("nome");

-- CreateIndex
CREATE INDEX "Descarte_loteId_idx" ON "Descarte"("loteId");

-- CreateIndex
CREATE INDEX "Descarte_localId_idx" ON "Descarte"("localId");

-- CreateIndex
CREATE UNIQUE INDEX "AjustePendente_descarteId_key" ON "AjustePendente"("descarteId");

-- CreateIndex
CREATE INDEX "AjustePendente_localId_status_idx" ON "AjustePendente"("localId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_usuarioId_idx" ON "RefreshToken"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "MapeamentoProdutoExterno_produtoId_sistema_localId_key" ON "MapeamentoProdutoExterno"("produtoId", "sistema", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegracaoExterna_tipo_localId_key" ON "IntegracaoExterna"("tipo", "localId");

-- CreateIndex
CREATE INDEX "Auditoria_entidade_entidadeId_idx" ON "Auditoria"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "Auditoria_timestamp_idx" ON "Auditoria"("timestamp");

-- AddForeignKey
ALTER TABLE "Local" ADD CONSTRAINT "Local_organizacaoId_fkey" FOREIGN KEY ("organizacaoId") REFERENCES "Organizacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaldoLote" ADD CONSTRAINT "SaldoLote_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaldoLote" ADD CONSTRAINT "SaldoLote_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoLote" ADD CONSTRAINT "MovimentoLote_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoLote" ADD CONSTRAINT "MovimentoLote_localOrigemId_fkey" FOREIGN KEY ("localOrigemId") REFERENCES "Local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoLote" ADD CONSTRAINT "MovimentoLote_localDestinoId_fkey" FOREIGN KEY ("localDestinoId") REFERENCES "Local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentoLote" ADD CONSTRAINT "MovimentoLote_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_localOrigemId_fkey" FOREIGN KEY ("localOrigemId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_localDestinoId_fkey" FOREIGN KEY ("localDestinoId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_usuarioEnvioId_fkey" FOREIGN KEY ("usuarioEnvioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_usuarioRecebimentoId_fkey" FOREIGN KEY ("usuarioRecebimentoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producao" ADD CONSTRAINT "Producao_produtoSaidaId_fkey" FOREIGN KEY ("produtoSaidaId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producao" ADD CONSTRAINT "Producao_loteSaidaId_fkey" FOREIGN KEY ("loteSaidaId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producao" ADD CONSTRAINT "Producao_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producao" ADD CONSTRAINT "Producao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducao" ADD CONSTRAINT "ConsumoProducao_producaoId_fkey" FOREIGN KEY ("producaoId") REFERENCES "Producao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducao" ADD CONSTRAINT "ConsumoProducao_loteOrigemId_fkey" FOREIGN KEY ("loteOrigemId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarte" ADD CONSTRAINT "Descarte_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarte" ADD CONSTRAINT "Descarte_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "MotivoDescarte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarte" ADD CONSTRAINT "Descarte_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Descarte" ADD CONSTRAINT "Descarte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjustePendente" ADD CONSTRAINT "AjustePendente_descarteId_fkey" FOREIGN KEY ("descarteId") REFERENCES "Descarte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjustePendente" ADD CONSTRAINT "AjustePendente_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjustePendente" ADD CONSTRAINT "AjustePendente_usuarioQueMarcouId_fkey" FOREIGN KEY ("usuarioQueMarcouId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLocal" ADD CONSTRAINT "UsuarioLocal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioLocal" ADD CONSTRAINT "UsuarioLocal_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapeamentoProdutoExterno" ADD CONSTRAINT "MapeamentoProdutoExterno_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapeamentoProdutoExterno" ADD CONSTRAINT "MapeamentoProdutoExterno_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegracaoExterna" ADD CONSTRAINT "IntegracaoExterna_localId_fkey" FOREIGN KEY ("localId") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

