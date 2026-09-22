import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  GESTOR_CD: 'Gestor CD',
  GESTOR_LOJA: 'Gestor Loja',
  OPERADOR: 'Operador',
};

interface NavLink {
  to: string;
  label: string;
  apenasAdmin?: boolean;
}

const LINKS: NavLink[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/recebimento', label: 'Recebimento' },
  { to: '/producao', label: 'Produção' },
  { to: '/transferencias/enviar', label: 'Enviar' },
  { to: '/transferencias/receber', label: 'Receber' },
  { to: '/descarte', label: 'Descarte' },
  { to: '/consumo', label: 'Consumo' },
  { to: '/contagem', label: 'Contagem' },
  { to: '/ajustes-pendentes', label: 'Ajustes Pendentes' },
  { to: '/admin/produtos', label: 'Produtos', apenasAdmin: true },
  { to: '/admin/grupos', label: 'Grupos', apenasAdmin: true },
  { to: '/admin/locais', label: 'Locais', apenasAdmin: true },
  { to: '/admin/motivos-descarte', label: 'Motivos de Descarte', apenasAdmin: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const linksVisiveis = LINKS.filter((link) => !link.apenasAdmin || usuario?.papel === 'ADMIN');

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
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
        </div>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {linksVisiveis.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                location.pathname === link.to
                  ? 'font-medium text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800'
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
