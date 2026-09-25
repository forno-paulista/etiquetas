import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusAjustePendente, StatusAjusteExterno, TipoLocal, TipoMovimentoLote } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateDescarteDto } from './dto/create-descarte.dto.js';

const descarteComRelacoesInclude = {
  lote: { include: { produto: true } },
  motivo: true,
  local: true,
  usuario: { select: { id: true, nome: true } },
  ajustePendente: true,
};

@Injectable()
export class DescarteService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(dto: CreateDescarteDto, usuarioId: string) {
    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    const motivo = await this.prisma.motivoDescarte.findUnique({ where: { id: dto.motivoId } });
    if (!motivo || !motivo.ativo) {
      throw new NotFoundException('Motivo de descarte não encontrado ou inativo.');
    }

    const saldo = await this.prisma.saldoLote.findUnique({
      where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
    });
    if (!saldo || Number(saldo.quantidadeAtual) < dto.quantidade) {
      throw new BadRequestException(`Saldo insuficiente do lote em ${local.nome} para descartar ${dto.quantidade}.`);
    }

    // O domínio só sabe que CD e loja reconciliam de formas diferentes —
    // não conhece Saipos/Varejo Fácil/ERP algum (ver seção 8 do CLAUDE.md,
    // a integração fica isolada atrás de uma porta que ainda não existe).
    // Hoje os dois casos caem em fila manual; quando a porta de integração
    // do CD existir, ela decide se confirma na hora (AJUSTADO_EXTERNAMENTE)
    // ou deixa PENDENTE — essa decisão não pertence a este service.
    const statusInicial =
      local.tipo === TipoLocal.CD ? StatusAjusteExterno.PENDENTE : StatusAjusteExterno.ENVIADO_FILA;

    const descarteId = await this.prisma.$transaction(async (tx) => {
      const descarte = await tx.descarte.create({
        data: {
          loteId: dto.loteId,
          quantidade: dto.quantidade,
          motivoId: dto.motivoId,
          localId: dto.localId,
          usuarioId,
          statusAjusteExterno: statusInicial,
        },
      });

      await tx.saldoLote.update({
        where: { loteId_localId: { loteId: dto.loteId, localId: dto.localId } },
        data: { quantidadeAtual: { decrement: dto.quantidade } },
      });

      await tx.movimentoLote.create({
        data: {
          loteId: dto.loteId,
          tipo: TipoMovimentoLote.DESCARTE,
          quantidade: -dto.quantidade,
          localOrigemId: dto.localId,
          referenciaId: descarte.id,
          usuarioId,
        },
      });

      if (local.tipo === TipoLocal.LOJA) {
        await tx.ajustePendente.create({
          data: {
            descarteId: descarte.id,
            localId: dto.localId,
            status: StatusAjustePendente.PENDENTE,
          },
        });
      }

      return descarte.id;
    });

    return this.findOne(descarteId);
  }

  async findOne(id: string) {
    const descarte = await this.prisma.descarte.findUnique({
      where: { id },
      include: descarteComRelacoesInclude,
    });
    if (!descarte) {
      throw new NotFoundException('Descarte não encontrado.');
    }
    return descarte;
  }

  findAll(filtros: { localId?: string; motivoId?: string }) {
    return this.prisma.descarte.findMany({
      where: filtros,
      include: descarteComRelacoesInclude,
      orderBy: { data: 'desc' },
    });
  }
}
