import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export type StatusTransferencia = 'EM_TRANSITO' | 'CONCLUIDA' | 'DIVERGENTE';
export type NaturezaTransferencia = 'INTERNA' | 'VENDA_INTERCOMPANY';

export interface EnviarTransferenciaInput {
  loteId: string;
  localOrigemId: string;
  localDestinoId: string;
  quantidade: number;
  natureza?: NaturezaTransferencia;
}

export interface ConfirmarTransferenciaInput {
  quantidadeConfirmada: number;
}

export interface Transferencia {
  id: string;
  loteId: string;
  quantidade: string;
  localOrigemId: string;
  localDestinoId: string;
  status: StatusTransferencia;
  quantidadeConfirmada: string | null;
  natureza: NaturezaTransferencia;
  usuarioEnvioId: string;
  usuarioRecebimentoId: string | null;
  criadaEm: string;
  confirmadaEm: string | null;
  lote: {
    id: string;
    codigoLote: string;
    dataValidade: string;
    produto: { id: string; nome: string; unidadeMedida: UnidadeMedida };
  };
  localOrigem: { id: string; nome: string };
  localDestino: { id: string; nome: string };
  usuarioEnvio: { id: string; nome: string };
  usuarioRecebimento: { id: string; nome: string } | null;
}

export interface ListarTransferenciasParams {
  status?: StatusTransferencia;
  localOrigemId?: string;
  localDestinoId?: string;
}

export async function enviarTransferencia(input: EnviarTransferenciaInput): Promise<Transferencia> {
  const { data } = await apiClient.post<Transferencia>('/transferencias', input);
  return data;
}

export async function confirmarTransferencia(
  id: string,
  input: ConfirmarTransferenciaInput,
): Promise<Transferencia> {
  const { data } = await apiClient.patch<Transferencia>(`/transferencias/${id}/confirmar`, input);
  return data;
}

export async function listarTransferencias(
  params: ListarTransferenciasParams = {},
): Promise<Transferencia[]> {
  const { data } = await apiClient.get<Transferencia[]>('/transferencias', { params });
  return data;
}
