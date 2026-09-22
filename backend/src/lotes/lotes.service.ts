import { Injectable, NotFoundException } from '@nestjs/common';
import { Lote, TipoMovimentoLote } from '@prisma/client';
import { resolverDataValidade } from '../common/validade.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLoteDto } from './dto/create-lote.dto.js';
import type { LotePublicoResponseDto } from './dto/lote-publico-response.dto.js';

const loteComRelacoesInclude = {
  produto: true,
  fornecedor: true,
  createdBy: { select: { id: true, nome: true } },
  saldos: { include: { local: true } },
  movimentos: {
    orderBy: { timestamp: 'desc' as const },
    include: { usuario: { select: { id: true, nome: true } }, localOrigem: true, localDestino: true },
  },
};

@Injectable()
export class LotesService {
  constructor(private readonly prisma: PrismaService) {}

  async receber(dto: CreateLoteDto, usuarioId: string) {
    const produto = await this.prisma.produto.findUnique({ where: { id: dto.produtoId } });
    if (!produto || !produto.ativo) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    if (dto.fornecedorId) {
      const fornecedor = await this.prisma.fornecedor.findUnique({ where: { id: dto.fornecedorId } });
      if (!fornecedor) {
        throw new NotFoundException('Fornecedor não encontrado.');
      }
    }

    const dataRecebimento = new Date();
    const dataValidade = resolverDataValidade(dto.dataValidade, dataRecebimento, produto.validadePadraoDias);

    const loteId = await this.prisma.$transaction(async (tx) => {
      const lote = await tx.lote.create({
        data: {
          produtoId: dto.produtoId,
          fornecedorId: dto.fornecedorId,
          codigoLote: dto.codigoLote,
          dataFabricacao: dto.dataFabricacao,
          dataValidade,
          createdById: usuarioId,
        },
      });

      await tx.saldoLote.create({
        data: { loteId: lote.id, localId: dto.localId, quantidadeAtual: dto.quantidade },
      });

      await tx.movimentoLote.create({
        data: {
          loteId: lote.id,
          tipo: TipoMovimentoLote.ENTRADA,
          quantidade: dto.quantidade,
          localDestinoId: dto.localId,
          usuarioId,
        },
      });

      return lote.id;
    });

    return this.findOne(loteId);
  }

  async findOne(id: string) {
    const lote = await this.prisma.lote.findUnique({
      where: { id },
      include: loteComRelacoesInclude,
    });
    if (!lote) {
      throw new NotFoundException('Lote não encontrado.');
    }
    return lote;
  }

  async findByQrCodePublico(qrCodeId: string): Promise<LotePublicoResponseDto> {
    const lote = await this.prisma.lote.findUnique({
      where: { qrCodeId },
      include: { produto: true, saldos: true },
    });
    if (!lote) {
      throw new NotFoundException('Lote não encontrado.');
    }

    const quantidadeAtualTotal = lote.saldos.reduce((soma, saldo) => soma + Number(saldo.quantidadeAtual), 0);

    return {
      produtoNome: lote.produto.nome,
      codigoLote: lote.codigoLote,
      dataValidade: lote.dataValidade,
      vencido: lote.dataValidade < new Date(),
      quantidadeAtualTotal: quantidadeAtualTotal.toFixed(3),
      unidadeMedida: lote.produto.unidadeMedida,
    };
  }
}
