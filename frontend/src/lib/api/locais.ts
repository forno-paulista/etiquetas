import { apiClient } from '../apiClient';

export interface Local {
  id: string;
  nome: string;
  tipo: 'CD' | 'LOJA';
  ativo: boolean;
}

export async function listarLocais(): Promise<Local[]> {
  const { data } = await apiClient.get<Local[]>('/locais');
  return data;
}
