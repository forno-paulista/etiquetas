import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { buscarLotePorQr } from '../lib/api/lotes';

export function LotePublicoPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lote-publico', qrCodeId],
    queryFn: () => buscarLotePorQr(qrCodeId!),
    enabled: Boolean(qrCodeId),
    retry: false,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        {isLoading && <p className="text-center text-neutral-500">Carregando...</p>}

        {isError && <p className="text-center text-red-600">Lote não encontrado.</p>}

        {data && (
          <>
            <h1 className="mb-4 text-xl font-semibold text-neutral-900">{data.produtoNome}</h1>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Lote</dt>
                <dd className="text-neutral-900">{data.codigoLote}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Validade</dt>
                <dd className={data.vencido ? 'font-medium text-red-600' : 'text-neutral-900'}>
                  {new Date(data.dataValidade).toLocaleDateString('pt-BR')}
                  {data.vencido && ' (vencido)'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Quantidade atual</dt>
                <dd className="text-neutral-900">
                  {data.quantidadeAtualTotal} {data.unidadeMedida}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-center text-xs text-neutral-400">
              Pra descartar, transferir ou dar baixa nesse lote, entre com sua conta.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
