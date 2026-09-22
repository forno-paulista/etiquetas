import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  GESTOR_CD: 'Gestor CD',
  GESTOR_LOJA: 'Gestor Loja',
  OPERADOR: 'Operador',
};

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <Link to="/dashboard" className="text-lg font-semibold text-neutral-900">
          Etiquetas
        </Link>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          {usuario && <span>{PAPEL_LABEL[usuario.papel] ?? usuario.papel}</span>}
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
