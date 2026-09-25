import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export interface ConsumoInput {
  loteOrigemId?: string;
  origemDesconhecida?: boolean;
  descricaoOrigem?: string;
  quantidadeConsumida: number;
}

export interface CreateProducaoInput {
  produtoSaidaId: string;
  localId: string;
  quantidadeProduzida: number;
  validadeSaida?: string;
  codigoLote?: string;
  consumos: ConsumoInput[];
}

export interface Producao {
  id: string;
  produtoSaidaId: string;
  loteSaidaId: string;
  quantidadeProduzida: string;
  validadeSaida: string;
  localId: string;
  data: string;
  produtoSaida: { id: string; nome: string; unidadeMedida: UnidadeMedida };
  local: { id: string; nome: string };
  usuario: { id: string; nome: string };
  loteSaida: { id: string; codigoLote: string; qrCodeId: string; dataValidade: string };
  consumos: {
    id: string;
    loteOrigemId: string | null;
    origemDesconhecida: boolean;
    descricaoOrigem: string | null;
    quantidadeConsumida: string;
    loteOrigem: {
      id: string;
      codigoLote: string;
      produto: { id: string; nome: string; unidadeMedida: UnidadeMedida };
    } | null;
  }[];
}

export async function criarProducao(input: CreateProducaoInput): Promise<Producao> {
  const { data } = await apiClient.post<Producao>('/producao', input);
  return data;
}
