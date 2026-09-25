import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export interface CreateConsumoInput {
  loteId: string;
  localId: string;
  quantidade: number;
}

export interface MovimentoConsumo {
  id: string;
  loteId: string;
  tipo: 'CONSUMO';
  quantidade: string;
  localOrigemId: string;
  timestamp: string;
  lote: { id: string; codigoLote: string; produto: { id: string; nome: string; unidadeMedida: UnidadeMedida } };
  localOrigem: { id: string; nome: string };
  usuario: { id: string; nome: string };
}

export async function registrarConsumo(input: CreateConsumoInput): Promise<MovimentoConsumo> {
  const { data } = await apiClient.post<MovimentoConsumo>('/consumo', input);
  return data;
}
