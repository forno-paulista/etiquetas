import { apiClient } from '../apiClient';

export interface Local {
  id: string;
  nome: string;
  tipo: 'CD' | 'LOJA';
  ativo: boolean;
}

export interface LocalInput {
  nome: string;
  tipo: 'CD' | 'LOJA';
}

export async function listarLocais(): Promise<Local[]> {
  const { data } = await apiClient.get<Local[]>('/locais');
  return data;
}

export async function criarLocal(input: LocalInput): Promise<Local> {
  const { data } = await apiClient.post<Local>('/locais', input);
  return data;
}

export async function atualizarLocal(
  id: string,
  input: Partial<LocalInput> & { ativo?: boolean },
): Promise<Local> {
  const { data } = await apiClient.patch<Local>(`/locais/${id}`, input);
  return data;
}
