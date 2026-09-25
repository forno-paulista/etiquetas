import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { FindAlertasQueryDto } from './dto/find-alertas-query.dto.js';

function inicioDoDia(data: Date): Date {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function somarDias(data: Date, dias: number): Date {
  const copia = new Date(data);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

@Injectable()
export class AlertasValidadeService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FindAlertasQueryDto) {
    const diasAlerta = filtros.diasAlerta ?? 7;
    const hoje = inicioDoDia(new Date());
    const amanha = somarDias(hoje, 1);
    const depoisDeAmanha = somarDias(hoje, 2);
    const limite = somarDias(hoje, diasAlerta);

    const saldos = await this.prisma.saldoLote.findMany({
      where: {
        quantidadeAtual: { gt: 0 },
        localId: filtros.localId,
        lote: { dataValidade: { lt: limite } },
      },
      include: { lote: { include: { produto: true } }, local: true },
      orderBy: { lote: { dataValidade: 'asc' } },
    });

    const buckets = {
      vencidos: [] as unknown[],
      hoje: [] as unknown[],
      amanha: [] as unknown[],
      proximos: [] as unknown[],
    };

    for (const saldo of saldos) {
      const validade = saldo.lote.dataValidade;
      const item = {
        loteId: saldo.loteId,
        qrCodeId: saldo.lote.qrCodeId,
        produtoNome: saldo.lote.produto.nome,
        codigoLote: saldo.lote.codigoLote,
        localId: saldo.localId,
        localNome: saldo.local.nome,
        quantidadeAtual: saldo.quantidadeAtual,
        unidadeMedida: saldo.lote.produto.unidadeMedida,
        dataValidade: validade,
      };

      if (validade < hoje) buckets.vencidos.push(item);
      else if (validade < amanha) buckets.hoje.push(item);
      else if (validade < depoisDeAmanha) buckets.amanha.push(item);
      else buckets.proximos.push(item);
    }

    return {
      diasAlerta,
      totais: {
        vencidos: buckets.vencidos.length,
        hoje: buckets.hoje.length,
        amanha: buckets.amanha.length,
        proximos: buckets.proximos.length,
      },
      ...buckets,
    };
  }
}
