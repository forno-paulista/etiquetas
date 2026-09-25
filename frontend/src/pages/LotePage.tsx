import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { buscarLotePorQr } from '../lib/api/lotes';
import { formatarData } from '../lib/formatarData';

export function LotePage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lote-resumo', qrCodeId],
    queryFn: () => buscarLotePorQr(qrCodeId!),
    enabled: Boolean(qrCodeId),
    retry: false,
  });

  return (
    <div className="mx-auto max-w-sm">
      {isLoading && <p className="text-center text-neutral-500">Carregando...</p>}

      {isError && <p className="text-center text-red-600">Lote não encontrado.</p>}

      {data && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold text-neutral-900">{data.produtoNome}</h1>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Lote</dt>
              <dd className="text-neutral-900">{data.codigoLote}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Validade</dt>
              <dd className={data.vencido ? 'font-medium text-red-600' : 'text-neutral-900'}>
                {formatarData(data.dataValidade)}
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
        </div>
      )}
    </div>
  );
}
