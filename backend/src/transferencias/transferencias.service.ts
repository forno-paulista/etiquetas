import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PapelUsuario, StatusTransferencia, TipoMovimentoLote } from '@prisma/client';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ConfirmarTransferenciaDto } from './dto/confirmar-transferencia.dto.js';
import type { CreateTransferenciaDto } from './dto/create-transferencia.dto.js';

const transferenciaComRelacoesInclude = {
  lote: { include: { produto: true } },
  localOrigem: true,
  localDestino: true,
  usuarioEnvio: { select: { id: true, nome: true } },
  usuarioRecebimento: { select: { id: true, nome: true } },
};

@Injectable()
export class TransferenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async enviar(dto: CreateTransferenciaDto, usuarioId: string) {
    if (dto.localOrigemId === dto.localDestinoId) {
      throw new BadRequestException('Local de origem e destino não podem ser o mesmo.');
    }

    const [lote, localOrigem, localDestino] = await Promise.all([
      this.prisma.lote.findUnique({ where: { id: dto.loteId } }),
      this.prisma.local.findUnique({ where: { id: dto.localOrigemId } }),
      this.prisma.local.findUnique({ where: { id: dto.localDestinoId } }),
    ]);

    if (!lote) throw new NotFoundException('Lote não encontrado.');
    if (!localOrigem?.ativo) throw new NotFoundException('Local de origem não encontrado ou inativo.');
    if (!localDestino?.ativo) throw new NotFoundException('Local de destino não encontrado ou inativo.');

    const saldo = await this.prisma.saldoLote.findUnique({
      where: { loteId_localId: { loteId: dto.loteId, localId: dto.localOrigemId } },
    });
    if (!saldo || Number(saldo.quantidadeAtual) < dto.quantidade) {
      throw new BadRequestException(`Saldo insuficiente do lote em ${localOrigem.nome} para enviar ${dto.quantidade}.`);
    }

    const transferenciaId = await this.prisma.$transaction(async (tx) => {
      const transferencia = await tx.transferencia.create({
        data: {
          loteId: dto.loteId,
          quantidade: dto.quantidade,
          localOrigemId: dto.localOrigemId,
          localDestinoId: dto.localDestinoId,
          natureza: dto.natureza,
          usuarioEnvioId: usuarioId,
        },
      });

      await tx.saldoLote.update({
        where: { loteId_localId: { loteId: dto.loteId, localId: dto.localOrigemId } },
        data: { quantidadeAtual: { decrement: dto.quantidade } },
      });

      await tx.movimentoLote.create({
        data: {
          loteId: dto.loteId,
          tipo: TipoMovimentoLote.TRANSFERENCIA_SAIDA,
          quantidade: -dto.quantidade,
          localOrigemId: dto.localOrigemId,
          localDestinoId: dto.localDestinoId,
          referenciaId: transferencia.id,
          usuarioId,
        },
      });

      return transferencia.id;
    });

    return this.findOne(transferenciaId);
  }

  async confirmar(id: string, dto: ConfirmarTransferenciaDto, usuario: JwtPayload) {
    const transferencia = await this.prisma.transferencia.findUnique({ where: { id } });
    if (!transferencia) {
      throw new NotFoundException('Transferência não encontrada.');
    }
    if (transferencia.status !== StatusTransferencia.EM_TRANSITO) {
      throw new BadRequestException('Esta transferência já foi resolvida.');
    }

    if (usuario.papel !== PapelUsuario.ADMIN && !usuario.locaisAcesso.includes(transferencia.localDestinoId)) {
      throw new ForbiddenException('Usuário não tem acesso ao local de destino desta transferência.');
    }

    const status =
      dto.quantidadeConfirmada === Number(transferencia.quantidade)
        ? StatusTransferencia.CONCLUIDA
        : StatusTransferencia.DIVERGENTE;

    await this.prisma.$transaction(async (tx) => {
      await tx.transferencia.update({
        where: { id },
        data: {
          status,
          quantidadeConfirmada: dto.quantidadeConfirmada,
          usuarioRecebimentoId: usuario.sub,
          confirmadaEm: new Date(),
        },
      });

      // O que fisicamente chegou é o que passa a existir no destino,
      // independente de bater com o que foi enviado — a divergência fica
      // registrada no status da Transferencia pra revisão humana (regra 8),
      // nunca corrigida ou escondida automaticamente.
      await tx.saldoLote.upsert({
        where: { loteId_localId: { loteId: transferencia.loteId, localId: transferencia.localDestinoId } },
        create: {
          loteId: transferencia.loteId,
          localId: transferencia.localDestinoId,
          quantidadeAtual: dto.quantidadeConfirmada,
        },
        update: { quantidadeAtual: { increment: dto.quantidadeConfirmada } },
      });

      await tx.movimentoLote.create({
        data: {
          loteId: transferencia.loteId,
          tipo: TipoMovimentoLote.TRANSFERENCIA_ENTRADA,
          quantidade: dto.quantidadeConfirmada,
          localOrigemId: transferencia.localOrigemId,
          localDestinoId: transferencia.localDestinoId,
          referenciaId: transferencia.id,
          usuarioId: usuario.sub,
        },
      });
    });

    return this.findOne(id);
  }

  findOne(id: string) {
    return this.prisma.transferencia
      .findUniqueOrThrow({ where: { id }, include: transferenciaComRelacoesInclude })
      .catch(() => {
        throw new NotFoundException('Transferência não encontrada.');
      });
  }

  findAll(
    filtros: { status?: StatusTransferencia; localDestinoId?: string; localOrigemId?: string },
    usuario: JwtPayload,
  ) {
    if (usuario.papel !== PapelUsuario.ADMIN) {
      const localPedidoForaDoAcesso = [filtros.localOrigemId, filtros.localDestinoId].some(
        (localId) => localId && !usuario.locaisAcesso.includes(localId),
      );
      if (localPedidoForaDoAcesso) {
        throw new ForbiddenException('Usuário não tem acesso a este local.');
      }
      if (!filtros.localOrigemId && !filtros.localDestinoId) {
        return this.prisma.transferencia.findMany({
          where: {
            status: filtros.status,
            OR: [
              { localOrigemId: { in: usuario.locaisAcesso } },
              { localDestinoId: { in: usuario.locaisAcesso } },
            ],
          },
          include: transferenciaComRelacoesInclude,
          orderBy: { criadaEm: 'desc' },
        });
      }
    }

    return this.prisma.transferencia.findMany({
      where: filtros,
      include: transferenciaComRelacoesInclude,
      orderBy: { criadaEm: 'desc' },
    });
  }
}
