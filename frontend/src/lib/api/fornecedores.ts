import { apiClient } from '../apiClient';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string | null;
  ativo: boolean;
}

export async function listarFornecedores(): Promise<Fornecedor[]> {
  const { data } = await apiClient.get<Fornecedor[]>('/fornecedores');
  return data;
}
