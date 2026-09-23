import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { inputClass, labelClass } from '../lib/formStyles';

export function ConsultaLotePage() {
  const [produtoId, setProdutoId] = useState('');
  const [localId, setLocalId] = useState('');
  const [comSaldo, setComSaldo] = useState(true);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const { data: lotes, isLoading } = useQuery({
    queryKey: ['lotes', produtoId, localId, comSaldo],
    queryFn: () => listarLotes({ produtoId: produtoId || undefined, localId: localId || undefined, comSaldo }),
    enabled: Boolean(produtoId),
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Consulta de Lote</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="produto">
            Produto
          </label>
          <select
            id="produto"
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {produtos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="local">
            Local (opcional)
          </label>
          <select id="local" value={localId} onChange={(e) => setLocalId(e.target.value)} className={inputClass}>
            <option value="">Todos os locais</option>
            {locais?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={comSaldo} onChange={(e) => setComSaldo(e.target.checked)} />
            Só com saldo disponível
          </label>
        </div>
      </div>

      {!produtoId && <p className="text-sm text-neutral-500">Selecione um produto pra ver os lotes.</p>}

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {lotes && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {lotes.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum lote encontrado.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {lotes.map((l) => {
                const total = l.saldos.reduce((soma, s) => soma + Number(s.quantidadeAtual), 0);
                return (
                  <li key={l.id}>
                    <Link
                      to={`/lotes/${l.id}`}
                      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-neutral-50"
                    >
                      <div>
                        <div className="font-medium text-neutral-900">{l.codigoLote}</div>
                        <div className="text-neutral-500">Validade {formatarData(l.dataValidade)}</div>
                      </div>
                      <div className="text-right text-neutral-900">
                        {total} {l.produto.unidadeMedida}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
