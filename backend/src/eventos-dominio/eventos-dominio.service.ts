import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FindEventosQueryDto } from './dto/find-eventos-query.dto.js';
import type { TipoEvento } from './tipos.js';

export interface NovoEventoDominio {
  tipo: TipoEvento;
  agregado: string;
  agregadoId: string;
  payload: object;
}

// Sem paginação por página/offset de propósito — quem consome isto é um
// polling por cursor (query.desde), não uma tela; "próxima página" é só
// "de novo com desde = maior id que eu vi".
const LIMITE_RESULTADOS = 200;

@Injectable()
export class EventosDominioService {
  constructor(private readonly prisma: PrismaService) {}

  // Chamado de DENTRO da mesma $transaction que grava a mudança de estado
  // (recebe o `tx`, não usa this.prisma) — é o que faz do log um outbox de
  // verdade: o evento só existe se o commit da mudança real também existiu.
  registrar(tx: Prisma.TransactionClient, evento: NovoEventoDominio) {
    return tx.eventoDominio.create({ data: evento });
  }

  listar(query: FindEventosQueryDto) {
    return this.prisma.eventoDominio.findMany({
      where: {
        ...(query.tipo ? { tipo: query.tipo } : {}),
        ...(query.agregado ? { agregado: query.agregado } : {}),
        ...(query.desde !== undefined ? { id: { gt: query.desde } } : {}),
      },
      orderBy: { id: 'asc' },
      take: LIMITE_RESULTADOS,
    });
  }
}
