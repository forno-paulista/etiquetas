import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { listarAjustesPendentes, marcarAjusteLancado } from '../lib/api/ajustesPendentes';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass } from '../lib/formStyles';

export function AjustesPendentesPage() {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();

  const { data: ajustes, isLoading } = useQuery({
    queryKey: ['ajustes-pendentes', 'PENDENTE'],
    queryFn: () => listarAjustesPendentes({ status: 'PENDENTE' }),
  });

  const marcar = useMutation({
    mutationFn: marcarAjusteLancado,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ajustes-pendentes', 'PENDENTE'] }),
  });

  const pendentesNosMeusLocais = ajustes?.filter(
    (a) => usuario?.papel === 'ADMIN' || usuario?.locaisAcesso.includes(a.localId),
  );

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Fila de Ajustes Pendentes</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Descartes feitos em loja que ainda precisam ser lançados manualmente no Saipos (não há integração de
        escrita com ele).
      </p>

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {pendentesNosMeusLocais && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {pendentesNosMeusLocais.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum ajuste pendente.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {pendentesNosMeusLocais.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="font-medium text-neutral-900">{a.descarte.lote.produto.nome}</div>
                    <div className="text-sm text-neutral-500">
                      Lote {a.descarte.lote.codigoLote} · {a.local.nome} · {a.descarte.motivo.nome}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {a.descarte.quantidade} {a.descarte.lote.produto.unidadeMedida} · descartado em{' '}
                      {formatarData(a.descarte.data)}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={marcar.isPending}
                    className={buttonPrimaryClass}
                    onClick={() => marcar.mutate(a.id)}
                  >
                    Marcar como lançado no Saipos
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
