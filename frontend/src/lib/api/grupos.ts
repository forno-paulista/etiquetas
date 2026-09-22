import { apiClient } from '../apiClient';

export interface Grupo {
  id: string;
  nome: string;
  icone: string | null;
  grupoPaiId: string | null;
  ativo: boolean;
}

export async function listarGrupos(): Promise<Grupo[]> {
  const { data } = await apiClient.get<Grupo[]>('/grupos');
  return data;
}
