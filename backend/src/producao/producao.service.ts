import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TipoMovimentoLote } from '@prisma/client';
import { gerarCodigoLotePadrao } from '../common/codigo-lote.util.js';
import { resolverDataValidade } from '../common/validade.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateProducaoDto } from './dto/create-producao.dto.js';

const producaoComRelacoesInclude = {
  produtoSaida: true,
  local: true,
  usuario: { select: { id: true, nome: true } },
  loteSaida: true,
  consumos: { include: { loteOrigem: { include: { produto: true } } } },
};

@Injectable()
export class ProducaoService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CreateProducaoDto, usuarioId: string) {
    this.validarConsumos(dto);

    const produtoSaida = await this.prisma.produto.findUnique({ where: { id: dto.produtoSaidaId } });
    if (!produtoSaida || !produtoSaida.ativo) {
      throw new NotFoundException('Produto de saída não encontrado ou inativo.');
    }

    const local = await this.prisma.local.findUnique({ where: { id: dto.localId } });
    if (!local || !local.ativo) {
      throw new NotFoundException('Local não encontrado ou inativo.');
    }

    // Valida disponibilidade de saldo de todos os lotes de origem
    // conhecidos ANTES de mexer em qualquer coisa — evita decrementar
    // metade e falhar no meio.
    const saldosPorLote = new Map<string, { id: string; quantidadeAtual: unknown }>();
    for (const consumo of dto.consumos) {
      if (consumo.origemDesconhecida || !consumo.loteOrigemId) {
        continue;
      }
      const lote = await this.prisma.lote.findUnique({ where: { id: consumo.loteOrigemId } });
      if (!lote) {
        throw new NotFoundException(`Lote de origem ${consumo.loteOrigemId} não encontrado.`);
      }
      const saldo = await this.prisma.saldoLote.findUnique({
        where: { loteId_localId: { loteId: consumo.loteOrigemId, localId: dto.localId } },
      });
      if (!saldo || Number(saldo.quantidadeAtual) < consumo.quantidadeConsumida) {
        throw new BadRequestException(
          `Saldo insuficiente do lote ${consumo.loteOrigemId} em ${local.nome} para consumir ${consumo.quantidadeConsumida}.`,
        );
      }
      saldosPorLote.set(consumo.loteOrigemId, saldo);
    }

    const dataFabricacao = new Date();
    const codigoLote = dto.codigoLote?.trim() || gerarCodigoLotePadrao(dataFabricacao);
    const validadeSaida = resolverDataValidade(dto.validadeSaida, dataFabricacao, produtoSaida.validadePadraoDias);

    const producaoId = await this.prisma.$transaction(async (tx) => {
      const loteSaida = await tx.lote.create({
        data: {
          produtoId: dto.produtoSaidaId,
          codigoLote,
          dataFabricacao,
          dataValidade: validadeSaida,
          createdById: usuarioId,
        },
      });

      const producao = await tx.producao.create({
        data: {
          produtoSaidaId: dto.produtoSaidaId,
          loteSaidaId: loteSaida.id,
          quantidadeProduzida: dto.quantidadeProduzida,
          validadeSaida,
          localId: dto.localId,
          usuarioId,
        },
      });

      await tx.saldoLote.create({
        data: { loteId: loteSaida.id, localId: dto.localId, quantidadeAtual: dto.quantidadeProduzida },
      });

      await tx.movimentoLote.create({
        data: {
          loteId: loteSaida.id,
          tipo: TipoMovimentoLote.PRODUCAO_ENTRADA,
          quantidade: dto.quantidadeProduzida,
          localDestinoId: dto.localId,
          referenciaId: producao.id,
          usuarioId,
        },
      });

      for (const consumo of dto.consumos) {
        await tx.consumoProducao.create({
          data: {
            producaoId: producao.id,
            loteOrigemId: consumo.origemDesconhecida ? null : consumo.loteOrigemId,
            origemDesconhecida: Boolean(consumo.origemDesconhecida),
            descricaoOrigem: consumo.descricaoOrigem,
            quantidadeConsumida: consumo.quantidadeConsumida,
          },
        });

        if (!consumo.origemDesconhecida && consumo.loteOrigemId) {
          await tx.saldoLote.update({
            where: { loteId_localId: { loteId: consumo.loteOrigemId, localId: dto.localId } },
            data: { quantidadeAtual: { decrement: consumo.quantidadeConsumida } },
          });

          await tx.movimentoLote.create({
            data: {
              loteId: consumo.loteOrigemId,
              tipo: TipoMovimentoLote.PRODUCAO_CONSUMO,
              quantidade: -consumo.quantidadeConsumida,
              localOrigemId: dto.localId,
              referenciaId: producao.id,
              usuarioId,
            },
          });
        }
      }

      return producao.id;
    });

    return this.findOne(producaoId);
  }

  async findOne(id: string) {
    const producao = await this.prisma.producao.findUnique({
      where: { id },
      include: producaoComRelacoesInclude,
    });
    if (!producao) {
      throw new NotFoundException('Produção não encontrada.');
    }
    return producao;
  }

  private validarConsumos(dto: CreateProducaoDto): void {
    for (const consumo of dto.consumos) {
      if (consumo.origemDesconhecida) {
        if (!consumo.descricaoOrigem?.trim()) {
          throw new BadRequestException(
            'Consumo com origem desconhecida exige descricaoOrigem (regra 11 do CLAUDE.md).',
          );
        }
      } else if (!consumo.loteOrigemId) {
        throw new BadRequestException('Consumo precisa de loteOrigemId, ou marque origemDesconhecida.');
      }
    }
  }
}
