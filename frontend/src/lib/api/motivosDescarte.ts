import { apiClient } from '../apiClient';

export interface MotivoDescarte {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface MotivoDescarteInput {
  nome: string;
}

export async function listarMotivosDescarte(): Promise<MotivoDescarte[]> {
  const { data } = await apiClient.get<MotivoDescarte[]>('/motivos-descarte');
  return data;
}

export async function criarMotivoDescarte(input: MotivoDescarteInput): Promise<MotivoDescarte> {
  const { data } = await apiClient.post<MotivoDescarte>('/motivos-descarte', input);
  return data;
}

export async function atualizarMotivoDescarte(
  id: string,
  input: Partial<MotivoDescarteInput> & { ativo?: boolean },
): Promise<MotivoDescarte> {
  const { data } = await apiClient.patch<MotivoDescarte>(`/motivos-descarte/${id}`, input);
  return data;
}
