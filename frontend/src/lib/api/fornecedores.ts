import { apiClient } from '../apiClient';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
}

export interface FornecedorInput {
  nome: string;
  cnpj?: string;
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
  const { data } = await apiClient.get<Fornecedor[]>('/fornecedores');
  return data;
}

export async function criarFornecedor(input: FornecedorInput): Promise<Fornecedor> {
  const { data } = await apiClient.post<Fornecedor>('/fornecedores', input);
  return data;
}

export async function atualizarFornecedor(
  id: string,
  input: Partial<FornecedorInput> & { ativo?: boolean },
): Promise<Fornecedor> {
  const { data } = await apiClient.patch<Fornecedor>(`/fornecedores/${id}`, input);
  return data;
}
