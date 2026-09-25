import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export type TipoMovimentoLote =
  | 'ENTRADA'
  | 'TRANSFERENCIA_SAIDA'
  | 'TRANSFERENCIA_ENTRADA'
  | 'DESCARTE'
  | 'PRODUCAO_CONSUMO'
  | 'PRODUCAO_ENTRADA'
  | 'AJUSTE_CONTAGEM'
  | 'CONSUMO';

export interface MovimentoRelatorio {
  id: string;
  loteId: string;
  tipo: TipoMovimentoLote;
  quantidade: string;
  observacao: string | null;
  timestamp: string;
  lote: { id: string; codigoLote: string; produto: { id: string; nome: string; unidadeMedida: UnidadeMedida } };
  localOrigem: { id: string; nome: string } | null;
  localDestino: { id: string; nome: string } | null;
  usuario: { id: string; nome: string };
}

export interface ListarMovimentosParams {
  produtoId?: string;
  localId?: string;
  tipo?: TipoMovimentoLote;
  dataInicio?: string;
  dataFim?: string;
}

export async function listarMovimentos(params: ListarMovimentosParams): Promise<MovimentoRelatorio[]> {
  const { data } = await apiClient.get<MovimentoRelatorio[]>('/relatorios/movimentos', { params });
  return data;
}
