import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export type StatusAjusteExterno = 'PENDENTE' | 'ENVIADO_FILA' | 'AJUSTADO_NO_ERP' | 'NAO_APLICAVEL';

export interface CreateDescarteInput {
  loteId: string;
  localId: string;
  motivoId: string;
  quantidade: number;
}

export interface Descarte {
  id: string;
  loteId: string;
  quantidade: string;
  motivoId: string;
  localId: string;
  usuarioId: string;
  data: string;
  statusAjusteExterno: StatusAjusteExterno;
  lote: { id: string; codigoLote: string; produto: { id: string; nome: string; unidadeMedida: UnidadeMedida } };
  motivo: { id: string; nome: string };
  local: { id: string; nome: string; tipo: 'CD' | 'LOJA' };
  usuario: { id: string; nome: string };
}

export async function registrarDescarte(input: CreateDescarteInput): Promise<Descarte> {
  const { data } = await apiClient.post<Descarte>('/descartes', input);
  return data;
}
