import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimentoLote } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateConsumoDto } from './dto/create-consumo.dto.js';

@Injectable()
export class ConsumoService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: CreateConsumoDto, usuarioId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    const saldo = await this.prisma.saldoLote.findUnique({
      where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
    });
    if (!saldo || Number(saldo.quantidadeAtual) < dto.quantidade) {
      throw new BadRequestException(`Saldo insuficiente do lote em ${local.nome} para consumir ${dto.quantidade}.`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.saldoLote.update({
        where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
        data: { quantidadeAtual: { decrement: dto.quantidade } },
      });

      return tx.movimentoLote.create({
        data: {
          loteId: dto.loteId,
          tipo: TipoMovimentoLote.CONSUMO,
          quantidade: -dto.quantidade,
          localOrigemId: dto.localId,
          usuarioId,
        },
        include: {
          lote: { include: { produto: true } },
          localOrigem: true,
          usuario: { select: { id: true, nome: true } },
        },
      });
    });
  }
}
