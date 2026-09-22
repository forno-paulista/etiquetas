import { apiClient } from '../apiClient';

export type UnidadeMedida = 'KG' | 'G' | 'L' | 'ML' | 'UN' | 'CX' | 'PCT';

export const UNIDADES_MEDIDA: UnidadeMedida[] = ['KG', 'G', 'L', 'ML', 'UN', 'CX', 'PCT'];

export interface Produto {
  id: string;
  nome: string;
  unidadeMedida: UnidadeMedida;
  grupoId: string | null;
  validadePadraoDias: number | null;
  ativo: boolean;
  grupo?: { id: string; nome: string } | null;
}

export interface ProdutoInput {
  nome: string;
  unidadeMedida: UnidadeMedida;
  grupoId?: string | null;
  validadePadraoDias?: number | null;
}

export async function listarProdutos(): Promise<Produto[]> {
  const { data } = await apiClient.get<Produto[]>('/produtos');
  return data;
}

export async function criarProduto(input: ProdutoInput): Promise<Produto> {
  const { data } = await apiClient.post<Produto>('/produtos', input);
  return data;
}

export async function atualizarProduto(
  id: string,
  input: Partial<ProdutoInput> & { ativo?: boolean },
): Promise<Produto> {
  const { data } = await apiClient.patch<Produto>(`/produtos/${id}`, input);
  return data;
}
