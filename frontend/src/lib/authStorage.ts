// Tokens ficam no localStorage porque o backend devolve os dois no corpo
// da resposta (não usa cookie httpOnly) — trade-off consciente de XSS por
// simplicidade, consistente com como a API já foi desenhada.
const ACCESS_TOKEN_KEY = 'etiquetas.accessToken';
const REFRESH_TOKEN_KEY = 'etiquetas.refreshToken';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function salvarTokens(tokens: Tokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function obterAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function obterRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function limparTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface JwtPayload {
  sub: string;
  papel: 'ADMIN' | 'GESTOR_CD' | 'GESTOR_LOJA' | 'OPERADOR';
  locaisAcesso: string[];
  exp: number;
}

export function decodificarPayload(token: string): JwtPayload | null {
  try {
    const [, payloadBase64] = token.split('.');
    const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
