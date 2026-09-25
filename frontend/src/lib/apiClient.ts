import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { limparTokens, obterAccessToken, obterRefreshToken, salvarTokens } from './authStorage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

apiClient.interceptors.request.use((config) => {
  const accessToken = obterAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Evita disparar várias chamadas de refresh em paralelo quando várias
// requisições tomam 401 ao mesmo tempo — todas esperam a mesma promise.
let refreshEmAndamento: Promise<string> | null = null;

async function renovarAccessToken(): Promise<string> {
  const refreshToken = obterRefreshToken();
  if (!refreshToken) {
    throw new Error('Sem refresh token.');
  }
  const { data } = await axios.post(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken },
  );
  salvarTokens(data);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !config || config._retry || config.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      refreshEmAndamento ??= renovarAccessToken().finally(() => {
        refreshEmAndamento = null;
      });
      const novoAccessToken = await refreshEmAndamento;
      config.headers.Authorization = `Bearer ${novoAccessToken}`;
      return apiClient(config);
    } catch {
      limparTokens();
      window.location.assign('/login');
      return Promise.reject(error);
    }
  },
);
