import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export type StatusAjustePendente = 'PENDENTE' | 'LANCADO_MANUALMENTE';

export interface AjustePendente {
  id: string;
  descarteId: string;
  localId: string;
  status: StatusAjustePendente;
  usuarioQueMarcouId: string | null;
  data: string | null;
  descarte: {
    id: string;
    quantidade: string;
    data: string;
    lote: { id: string; codigoLote: string; produto: { id: string; nome: string; unidadeMedida: UnidadeMedida } };
    motivo: { id: string; nome: string };
  };
  local: { id: string; nome: string };
  usuarioQueMarcou: { id: string; nome: string } | null;
}

export interface ListarAjustesParams {
  localId?: string;
  status?: StatusAjustePendente;
}

export async function listarAjustesPendentes(params: ListarAjustesParams = {}): Promise<AjustePendente[]> {
  const { data } = await apiClient.get<AjustePendente[]>('/ajustes-pendentes', { params });
  return data;
}

export async function marcarAjusteLancado(id: string): Promise<AjustePendente> {
  const { data } = await apiClient.patch<AjustePendente>(`/ajustes-pendentes/${id}/marcar-lancado`);
  return data;
}
