import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimentoLote } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateContagemDto } from './dto/create-contagem.dto.js';

@Injectable()
export class ContagemService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: CreateContagemDto, usuarioId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    const lote = await this.prisma.lote.findUnique({ where: { id: dto.loteId } });
    if (!lote) {
      throw new NotFoundException('Lote não encontrado.');
    }

    const saldo = await this.prisma.saldoLote.findUnique({
      where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
    });
    const quantidadeSistema = saldo ? Number(saldo.quantidadeAtual) : 0;
    const diferenca = dto.quantidadeContada - quantidadeSistema;

    if (diferenca === 0) {
      return { divergiu: false, quantidadeSistema, quantidadeContada: dto.quantidadeContada, movimento: null };
    }

    // Regra/seção 10: toda divergência de contagem exige justificativa
    // textual, e o sistema nunca tenta adivinhar a causa da diferença.
    if (!dto.observacao?.trim()) {
      throw new BadRequestException(
        `Contagem (${dto.quantidadeContada}) diverge do saldo do sistema (${quantidadeSistema}) — informe uma observação.`,
      );
    }

    const movimento = await this.prisma.$transaction(async (tx) => {
      await tx.saldoLote.upsert({
        where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
        create: { loteId: dto.loteId, localId: dto.localId, quantidadeAtual: dto.quantidadeContada },
        update: { quantidadeAtual: dto.quantidadeContada },
      });

      return tx.movimentoLote.create({
        data: {
          loteId: dto.loteId,
          tipo: TipoMovimentoLote.AJUSTE_CONTAGEM,
          quantidade: diferenca,
          localOrigemId: dto.localId,
          observacao: dto.observacao,
          usuarioId,
        },
        include: {
          lote: { include: { produto: true } },
          localOrigem: true,
          usuario: { select: { id: true, nome: true } },
        },
      });
    });

    return { divergiu: true, quantidadeSistema, quantidadeContada: dto.quantidadeContada, movimento };
  }
}
