import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimentoLote } from '@prisma/client';
import { EventosDominioService } from '../eventos-dominio/eventos-dominio.service.js';
import { TIPO_EVENTO } from '../eventos-dominio/tipos.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateConsumoDto } from './dto/create-consumo.dto.js';

@Injectable()
export class ConsumoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventos: EventosDominioService,
  ) {}

  async registrar(dto: CreateConsumoDto, usuarioId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    const saldo = await this.prisma.saldoLote.findUnique({
      where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
      include: { lote: { include: { produto: true } } },
    });
    if (!saldo || Number(saldo.quantidadeAtual) < dto.quantidade) {
      throw new BadRequestException(`Saldo insuficiente do lote em ${local.nome} para consumir ${dto.quantidade}.`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.saldoLote.update({
        where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
        data: { quantidadeAtual: { decrement: dto.quantidade } },
      });

      const movimento = await tx.movimentoLote.create({
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

      await this.eventos.registrar(tx, {
        tipo: TIPO_EVENTO.CONSUMO_REGISTRADO,
        agregado: 'MovimentoLote',
        agregadoId: movimento.id,
        payload: {
          loteId: dto.loteId,
          produtoNome: saldo.lote.produto.nome,
          quantidade: dto.quantidade,
          localId: dto.localId,
          localNome: local.nome,
        },
      });

      return movimento;
    });
  }
}
