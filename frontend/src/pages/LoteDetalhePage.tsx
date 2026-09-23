import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { buscarLote } from '../lib/api/lotes';
import { formatarData } from '../lib/formatarData';

const TIPO_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada (recebimento)',
  TRANSFERENCIA_SAIDA: 'Saída por transferência',
  TRANSFERENCIA_ENTRADA: 'Entrada por transferência',
  DESCARTE: 'Descarte',
  PRODUCAO_CONSUMO: 'Consumido em produção',
  PRODUCAO_ENTRADA: 'Entrada por produção',
  AJUSTE_CONTAGEM: 'Ajuste de contagem',
  CONSUMO: 'Consumo',
};

export function LoteDetalhePage() {
  const { id } = useParams<{ id: string }>();

  const { data: lote, isLoading, isError } = useQuery({
    queryKey: ['lote', id],
    queryFn: () => buscarLote(id!),
    enabled: Boolean(id),
  });

  if (isLoading) return <p className="text-neutral-500">Carregando...</p>;
  if (isError || !lote) return <p className="text-red-600">Lote não encontrado.</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{lote.produto.nome}</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-700">Dados do lote</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Código</dt>
              <dd className="text-neutral-900">{lote.codigoLote}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Fabricação</dt>
              <dd className="text-neutral-900">{lote.dataFabricacao ? formatarData(lote.dataFabricacao) : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Validade</dt>
              <dd className="text-neutral-900">{formatarData(lote.dataValidade)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Fornecedor</dt>
              <dd className="text-neutral-900">{lote.fornecedor?.nome ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Criado por</dt>
              <dd className="text-neutral-900">{lote.createdBy.nome}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">QR Code</dt>
              <dd className="text-neutral-900">
                <Link to={`/l/${lote.qrCodeId}`} className="underline">
                  {lote.qrCodeId}
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-neutral-700">Saldo por local</h2>
          {lote.saldos.length === 0 ? (
            <p className="text-sm text-neutral-500">Sem saldo em nenhum local.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {lote.saldos.map((s) => (
                <li key={s.localId} className="flex justify-between">
                  <span className="text-neutral-500">{s.local.nome}</span>
                  <span className="text-neutral-900">
                    {s.quantidadeAtual} {lote.produto.unidadeMedida}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
          Histórico de movimentos
        </div>
        {lote.movimentos.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum movimento ainda.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {lote.movimentos.map((m) => (
              <li key={m.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900">{TIPO_LABEL[m.tipo] ?? m.tipo}</span>
                  <span className={Number(m.quantidade) < 0 ? 'text-red-600' : 'text-green-700'}>
                    {Number(m.quantidade) > 0 ? '+' : ''}
                    {m.quantidade} {lote.produto.unidadeMedida}
                  </span>
                </div>
                <div className="text-neutral-500">
                  {m.localOrigem?.nome ?? ''}
                  {m.localOrigem && m.localDestino ? ' → ' : ''}
                  {m.localDestino?.nome ?? ''} · {m.usuario.nome} ·{' '}
                  {new Date(m.timestamp).toLocaleString('pt-BR')}
                </div>
                {m.observacao && <div className="mt-1 text-neutral-600">Obs: {m.observacao}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
