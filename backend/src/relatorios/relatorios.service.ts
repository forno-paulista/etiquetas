import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FindMovimentosQueryDto } from './dto/find-movimentos-query.dto.js';

// Dado bruto navegável (CLAUDE.md § 4 — relatórios analíticos com
// dashboards/gráficos ficam pra fase 2). Limite fixo evita devolver o
// histórico inteiro de uma vez; os filtros é que fazem o trabalho de
// restringir o volume.
const LIMITE_RESULTADOS = 300;

// "2026-09-23" (data sem hora, vinda de um <input type="date">) precisa
// virar o FIM do dia quando é um filtro "até" — senão o dia inteiro fica
// de fora, porque "2026-09-23" puro vira meia-noite UTC (mesma armadilha
// do formatarData no frontend).
function fimDoDia(dataIso: string): Date {
  return dataIso.includes('T') ? new Date(dataIso) : new Date(`${dataIso}T23:59:59.999`);
}

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarMovimentos(query: FindMovimentosQueryDto) {
    const where: Prisma.MovimentoLoteWhereInput = {
      ...(query.tipo ? { tipo: query.tipo } : {}),
      ...(query.produtoId ? { lote: { produtoId: query.produtoId } } : {}),
      ...(query.localId ? { OR: [{ localOrigemId: query.localId }, { localDestinoId: query.localId }] } : {}),
      ...(query.dataInicio || query.dataFim
        ? {
            timestamp: {
              ...(query.dataInicio ? { gte: new Date(query.dataInicio) } : {}),
              ...(query.dataFim ? { lte: fimDoDia(query.dataFim) } : {}),
            },
          }
        : {}),
    };

    return this.prisma.movimentoLote.findMany({
      where,
      include: {
        lote: { include: { produto: true } },
        localOrigem: true,
        localDestino: true,
        usuario: { select: { id: true, nome: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: LIMITE_RESULTADOS,
    });
  }
}
