import { apiClient } from '../apiClient';

export interface LoteAlerta {
  loteId: string;
  qrCodeId: string;
  produtoNome: string;
  codigoLote: string;
  localId: string;
  localNome: string;
  quantidadeAtual: string;
  unidadeMedida: string;
  dataValidade: string;
}

export interface AlertasValidade {
  diasAlerta: number;
  totais: {
    vencidos: number;
    hoje: number;
    amanha: number;
    proximos: number;
  };
  vencidos: LoteAlerta[];
  hoje: LoteAlerta[];
  amanha: LoteAlerta[];
  proximos: LoteAlerta[];
}

export async function buscarAlertasValidade(params: {
  localId?: string;
  diasAlerta?: number;
}): Promise<AlertasValidade> {
  const { data } = await apiClient.get<AlertasValidade>('/alertas-validade', { params });
  return data;
}
