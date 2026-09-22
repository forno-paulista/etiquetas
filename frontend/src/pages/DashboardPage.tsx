import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { buscarAlertasValidade, type LoteAlerta } from '../lib/api/alertasValidade';
import { listarLocais } from '../lib/api/locais';
import { formatarData } from '../lib/formatarData';
import { inputClass } from '../lib/formStyles';

type Bucket = 'vencidos' | 'hoje' | 'amanha' | 'proximos';

const BUCKET_LABEL: Record<Bucket, string> = {
  vencidos: 'Vencidos',
  hoje: 'Vencem hoje',
  amanha: 'Vencem amanhã',
  proximos: 'Próximos dias',
};

const BUCKET_COLOR: Record<Bucket, string> = {
  vencidos: 'border-red-200 bg-red-50 text-red-700',
  hoje: 'border-orange-200 bg-orange-50 text-orange-700',
  amanha: 'border-amber-200 bg-amber-50 text-amber-700',
  proximos: 'border-neutral-200 bg-neutral-50 text-neutral-700',
};

export function DashboardPage() {
  const [localId, setLocalId] = useState<string>('');
  const [bucketSelecionado, setBucketSelecionado] = useState<Bucket>('vencidos');

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });

  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas-validade', localId],
    queryFn: () => buscarAlertasValidade({ localId: localId || undefined }),
  });

  const itensDoBucket: LoteAlerta[] = alertas?.[bucketSelecionado] ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <select
          value={localId}
          onChange={(e) => setLocalId(e.target.value)}
          className={`${inputClass} w-auto`}
        >
          <option value="">Todos os locais</option>
          {locais?.map((local) => (
            <option key={local.id} value={local.id}>
              {local.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {alertas && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(BUCKET_LABEL) as Bucket[]).map((bucket) => (
              <button
                key={bucket}
                type="button"
                onClick={() => setBucketSelecionado(bucket)}
                className={`rounded-lg border p-4 text-left transition ${BUCKET_COLOR[bucket]} ${
                  bucketSelecionado === bucket ? 'ring-2 ring-offset-1' : ''
                }`}
              >
                <div className="text-2xl font-semibold">{alertas.totais[bucket]}</div>
                <div className="text-sm">{BUCKET_LABEL[bucket]}</div>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
              {BUCKET_LABEL[bucketSelecionado]} ({itensDoBucket.length})
            </div>
            {itensDoBucket.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">Nada nessa faixa.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {itensDoBucket.map((item) => (
                  <li key={item.loteId} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium text-neutral-900">{item.produtoNome}</div>
                      <div className="text-neutral-500">
                        Lote {item.codigoLote} · {item.localNome}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neutral-900">
                        {item.quantidadeAtual} {item.unidadeMedida}
                      </div>
                      <div className="text-neutral-500">
                        {formatarData(item.dataValidade)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
