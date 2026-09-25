import { useEffect, useState, type ReactNode, type SVGProps } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  GESTOR_CD: 'Gestor CD',
  GESTOR_LOJA: 'Gestor Loja',
  OPERADOR: 'Operador',
};

function Icone({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

const IconeMenu = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icone>
);
const IconeVisaoGeral = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icone>
);
const IconeEstoque = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </Icone>
);
const IconeTransferencia = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <path d="M4 7h13l-3-3" />
    <path d="M20 17H7l3 3" />
  </Icone>
);
const IconeBaixas = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <path d="M4 7h16" />
    <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icone>
);
const IconeRelatorios = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <line x1="6" y1="20" x2="6" y2="12" />
    <line x1="12" y1="20" x2="12" y2="8" />
    <line x1="18" y1="20" x2="18" y2="4" />
  </Icone>
);
const IconeAdministracao = (p: SVGProps<SVGSVGElement>) => (
  <Icone {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Icone>
);

interface NavItem {
  to: string;
  label: string;
}

interface NavCategoria {
  label: string;
  icon: (p: SVGProps<SVGSVGElement>) => ReactNode;
  items: NavItem[];
  apenasAdmin?: boolean;
}

const CATEGORIAS: NavCategoria[] = [
  { label: 'Visão Geral', icon: IconeVisaoGeral, items: [{ to: '/dashboard', label: 'Dashboard' }] },
  {
    label: 'Estoque',
    icon: IconeEstoque,
    items: [
      { to: '/recebimento', label: 'Recebimento' },
      { to: '/lotes', label: 'Consulta de Lote' },
      { to: '/producao', label: 'Produção' },
    ],
  },
  {
    label: 'Transferência',
    icon: IconeTransferencia,
    items: [
      { to: '/transferencias/enviar', label: 'Enviar' },
      { to: '/transferencias/receber', label: 'Receber' },
    ],
  },
  {
    label: 'Baixas e Ajustes',
    icon: IconeBaixas,
    items: [
      { to: '/descarte', label: 'Descarte' },
      { to: '/consumo', label: 'Consumo' },
      { to: '/contagem', label: 'Contagem' },
      { to: '/ajustes-pendentes', label: 'Ajustes Pendentes' },
    ],
  },
  {
    label: 'Relatórios',
    icon: IconeRelatorios,
    items: [{ to: '/relatorios/movimentacoes', label: 'Movimentações' }],
  },
  {
    label: 'Administração',
    icon: IconeAdministracao,
    apenasAdmin: true,
    items: [
      { to: '/admin/produtos', label: 'Produtos' },
      { to: '/admin/grupos', label: 'Grupos' },
      { to: '/admin/locais', label: 'Locais' },
      { to: '/admin/fornecedores', label: 'Fornecedores' },
      { to: '/admin/motivos-descarte', label: 'Motivos de Descarte' },
      { to: '/admin/usuarios', label: 'Usuários' },
    ],
  },
];

const CHAVE_COLAPSADO = 'etiquetas.sidebarColapsado';

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [colapsado, setColapsado] = useState(() => {
    try {
      return localStorage.getItem(CHAVE_COLAPSADO) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_COLAPSADO, colapsado ? '1' : '0');
    } catch {
      // localStorage indisponível (modo privado etc.) — sem problema, só não persiste.
    }
  }, [colapsado]);

  const categoriasVisiveis = CATEGORIAS.filter((cat) => !cat.apenasAdmin || usuario?.papel === 'ADMIN');

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setColapsado((v) => !v)}
            className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100"
            aria-label={colapsado ? 'Expandir menu' : 'Retrair menu'}
            title={colapsado ? 'Expandir menu' : 'Retrair menu'}
          >
            <IconeMenu className="h-5 w-5" />
          </button>
          <Link to="/dashboard" className="text-lg font-semibold text-neutral-900">
            Etiquetas
          </Link>
        </div>
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

      <div className="flex flex-1 overflow-hidden">
        <nav
          className={`flex-shrink-0 overflow-y-auto border-r border-neutral-200 bg-white py-3 transition-all duration-200 ${
            colapsado ? 'w-14' : 'w-64'
          }`}
        >
          {categoriasVisiveis.map((categoria, index) => {
            const categoriaAtiva = categoria.items.some((item) => item.to === location.pathname);
            return (
              <div key={categoria.label} className={index > 0 ? 'mt-4' : ''}>
                {colapsado ? (
                  <div className="border-t border-neutral-100 px-2 pt-3 first:border-t-0 first:pt-0">
                    <button
                      type="button"
                      onClick={() => setColapsado(false)}
                      title={categoria.label}
                      className={`flex w-full justify-center rounded-md py-1.5 hover:bg-neutral-100 ${
                        categoriaAtiva ? 'text-neutral-900' : 'text-neutral-400'
                      }`}
                    >
                      <categoria.icon className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-1 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      <categoria.icon className="h-3.5 w-3.5" />
                      {categoria.label}
                    </div>
                    <ul>
                      {categoria.items.map((item) => (
                        <li key={item.to} className="px-2">
                          <Link
                            to={item.to}
                            className={`block truncate rounded-md px-2.5 py-1.5 text-sm ${
                              location.pathname === item.to
                                ? 'bg-neutral-900 font-medium text-white'
                                : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
