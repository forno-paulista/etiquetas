import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimentoLote } from '@prisma/client';
import { EventosDominioService } from '../eventos-dominio/eventos-dominio.service.js';
import { TIPO_EVENTO } from '../eventos-dominio/tipos.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateContagemDto } from './dto/create-contagem.dto.js';

@Injectable()
export class ContagemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventos: EventosDominioService,
  ) {}

  async registrar(dto: CreateContagemDto, usuarioId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    const lote = await this.prisma.lote.findUnique({ where: { id: dto.loteId }, include: { produto: true } });
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

      const mov = await tx.movimentoLote.create({
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

      await this.eventos.registrar(tx, {
        tipo: TIPO_EVENTO.CONTAGEM_DIVERGENTE,
        agregado: 'MovimentoLote',
        agregadoId: mov.id,
        payload: {
          loteId: dto.loteId,
          produtoNome: lote.produto.nome,
          localId: dto.localId,
          localNome: local.nome,
          quantidadeSistema,
          quantidadeContada: dto.quantidadeContada,
          diferenca,
          observacao: dto.observacao,
        },
      });

      return mov;
    });

    return { divergiu: true, quantidadeSistema, quantidadeContada: dto.quantidadeContada, movimento };
  }
}
