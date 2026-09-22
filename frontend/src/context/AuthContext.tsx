import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { apiClient } from '../lib/apiClient';
import {
  decodificarPayload,
  limparTokens,
  obterAccessToken,
  salvarTokens,
  type JwtPayload,
} from '../lib/authStorage';

interface AuthContextValue {
  usuario: JwtPayload | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function usuarioInicial(): JwtPayload | null {
  const token = obterAccessToken();
  if (!token) return null;
  const payload = decodificarPayload(token);
  if (!payload || payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<JwtPayload | null>(usuarioInicial);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: usuario !== null,
      async login(email, senha) {
        const { data } = await apiClient.post('/auth/login', { email, senha });
        salvarTokens(data);
        setUsuario(decodificarPayload(data.accessToken));
      },
      logout() {
        limparTokens();
        setUsuario(null);
      },
    }),
    [usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider.');
  }
  return context;
}
