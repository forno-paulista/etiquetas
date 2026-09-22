import { apiClient } from '../apiClient';
import type { UnidadeMedida } from './produtos';

export interface CreateLoteInput {
  produtoId: string;
  localId: string;
  fornecedorId?: string;
  codigoLote?: string;
  quantidade: number;
  dataFabricacao?: string;
  dataValidade?: string;
}

export interface SaldoLote {
  localId: string;
  quantidadeAtual: string;
  local: { id: string; nome: string };
}

export interface MovimentoLote {
  id: string;
  tipo: string;
  quantidade: string;
  timestamp: string;
  observacao: string | null;
  usuario: { id: string; nome: string };
  localOrigem: { id: string; nome: string } | null;
  localDestino: { id: string; nome: string } | null;
}

export interface Lote {
  id: string;
  codigoLote: string;
  qrCodeId: string;
  dataFabricacao: string | null;
  dataValidade: string;
  produto: { id: string; nome: string; unidadeMedida: UnidadeMedida };
  fornecedor: { id: string; nome: string } | null;
  createdBy: { id: string; nome: string };
  saldos: SaldoLote[];
  movimentos: MovimentoLote[];
}

export interface LoteResumo {
  produtoNome: string;
  codigoLote: string;
  dataValidade: string;
  vencido: boolean;
  quantidadeAtualTotal: string;
  unidadeMedida: string;
}

// Retorno de GET /lotes — pra escolher um lote em Transferência, Produção,
// Descarte, Consumo. Vem ordenado por validade (FEFO é recomendação de UI,
// regra 5 do CLAUDE.md). `saldos` já vem filtrado pelo `localId` da busca,
// quando informado.
export interface LoteComSaldo {
  id: string;
  codigoLote: string;
  dataValidade: string;
  produto: { id: string; nome: string; unidadeMedida: UnidadeMedida };
  saldos: SaldoLote[];
}

export interface ListarLotesParams {
  produtoId?: string;
  localId?: string;
  comSaldo?: boolean;
}

export async function listarLotes(params: ListarLotesParams): Promise<LoteComSaldo[]> {
  const { data } = await apiClient.get<LoteComSaldo[]>('/lotes', { params });
  return data;
}

export async function receberLote(input: CreateLoteInput): Promise<Lote> {
  const { data } = await apiClient.post<Lote>('/lotes', input);
  return data;
}

export async function buscarLote(id: string): Promise<Lote> {
  const { data } = await apiClient.get<Lote>(`/lotes/${id}`);
  return data;
}

// Autenticado — não é mais uma consulta pública (decisão revertida).
export async function buscarLotePorQr(qrCodeId: string): Promise<LoteResumo> {
  const { data } = await apiClient.get<LoteResumo>(`/lotes/qr/${qrCodeId}`);
  return data;
}
