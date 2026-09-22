import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export interface CreateContagemInput {
  loteId: string;
  localId: string;
  quantidadeContada: number;
  observacao?: string;
}

export interface MovimentoContagem {
  id: string;
  loteId: string;
  tipo: 'AJUSTE_CONTAGEM';
  quantidade: string;
  localOrigemId: string;
  observacao: string;
  timestamp: string;
  lote: { id: string; codigoLote: string; produto: { id: string; nome: string; unidadeMedida: UnidadeMedida } };
  localOrigem: { id: string; nome: string };
  usuario: { id: string; nome: string };
}

export interface ResultadoContagem {
  divergiu: boolean;
  quantidadeSistema: number;
  quantidadeContada: number;
  movimento: MovimentoContagem | null;
}

export async function registrarContagem(input: CreateContagemInput): Promise<ResultadoContagem> {
  const { data } = await apiClient.post<ResultadoContagem>('/contagem', input);
  return data;
}
