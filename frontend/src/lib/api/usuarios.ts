import { apiClient } from '../apiClient';

export type PapelUsuario = 'ADMIN' | 'GESTOR_CD' | 'GESTOR_LOJA' | 'OPERADOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  locaisAcesso: { id: string; nome: string }[];
}

export interface CreateUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  papel: PapelUsuario;
  locaisAcesso?: string[];
}

export interface UpdateUsuarioInput {
  nome?: string;
  papel?: PapelUsuario;
  ativo?: boolean;
  locaisAcesso?: string[];
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await apiClient.get<Usuario[]>('/usuarios');
  return data;
}

export async function criarUsuario(input: CreateUsuarioInput): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>('/usuarios', input);
  return data;
}

export async function atualizarUsuario(id: string, input: UpdateUsuarioInput): Promise<Usuario> {
  const { data } = await apiClient.patch<Usuario>(`/usuarios/${id}`, input);
  return data;
}

export async function resetarSenhaUsuario(id: string, senha: string): Promise<Usuario> {
  const { data } = await apiClient.patch<Usuario>(`/usuarios/${id}/senha`, { senha });
  return data;
}
