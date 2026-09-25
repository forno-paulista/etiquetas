import { apiClient } from '../apiClient';

export interface Grupo {
  id: string;
  nome: string;
  icone: string | null;
  grupoPaiId: string | null;
  ativo: boolean;
}

export interface GrupoInput {
  nome: string;
  icone?: string;
  grupoPaiId?: string;
}

export async function listarGrupos(): Promise<Grupo[]> {
  const { data } = await apiClient.get<Grupo[]>('/grupos');
  return data;
}

export async function criarGrupo(input: GrupoInput): Promise<Grupo> {
  const { data } = await apiClient.post<Grupo>('/grupos', input);
  return data;
}

export async function atualizarGrupo(
  id: string,
  input: Partial<GrupoInput> & { ativo?: boolean },
): Promise<Grupo> {
  const { data } = await apiClient.patch<Grupo>(`/grupos/${id}`, input);
  return data;
}
