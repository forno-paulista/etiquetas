import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  confirmarTransferencia,
  listarTransferencias,
  type Transferencia,
} from '../lib/api/transferencias';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass } from '../lib/formStyles';

function ConfirmarForm({ transferencia }: { transferencia: Transferencia }) {
  const queryClient = useQueryClient();
  const [quantidade, setQuantidade] = useState(transferencia.quantidade);
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Transferencia | null>(null);

  const confirmar = useMutation({
    mutationFn: () => confirmarTransferencia(transferencia.id, { quantidadeConfirmada: Number(quantidade) }),
    onSuccess: (dados) => {
      setResultado(dados);
      setErro(null);
    },
    onError: () => setErro('Não deu pra confirmar — tenta de novo.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    confirmar.mutate();
  }

  function fechar() {
    queryClient.invalidateQueries({ queryKey: ['transferencias', 'EM_TRANSITO'] });
  }

  if (resultado) {
    const divergente = resultado.status === 'DIVERGENTE';
    return (
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            divergente ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {divergente
            ? `Divergente — enviado ${resultado.quantidade}, confirmado ${resultado.quantidadeConfirmada}`
            : 'Confirmada'}
        </span>
        <button type="button" className={buttonSecondaryClass} onClick={fechar}>
          OK
        </button>
      </div>
    );
  }

  if (!aberto) {
    return (
      <button type="button" className={buttonPrimaryClass} onClick={() => setAberto(true)}>
        Confirmar recebimento
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        step="0.001"
        min={0.001}
        required
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        className={`${inputClass} w-32`}
      />
      <span className="text-sm text-neutral-500">{transferencia.lote.produto.unidadeMedida}</span>
      <button type="submit" disabled={confirmar.isPending} className={buttonPrimaryClass}>
        {confirmar.isPending ? 'Confirmando...' : 'Confirmar'}
      </button>
      <button type="button" className={buttonSecondaryClass} onClick={() => setAberto(false)}>
        Cancelar
      </button>
      {erro && <p className="w-full text-sm text-red-600">{erro}</p>}
    </form>
  );
}

export function TransferenciaReceberPage() {
  const { usuario } = useAuth();

  const { data: transferencias, isLoading } = useQuery({
    queryKey: ['transferencias', 'EM_TRANSITO'],
    queryFn: () => listarTransferencias({ status: 'EM_TRANSITO' }),
  });

  const pendentesNosMeusLocais = transferencias?.filter(
    (t) => usuario?.papel === 'ADMIN' || usuario?.locaisAcesso.includes(t.localDestinoId),
  );

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Transferência — Receber</h1>

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {pendentesNosMeusLocais && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {pendentesNosMeusLocais.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">
              Nenhuma transferência em trânsito pros seus locais.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {pendentesNosMeusLocais.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="font-medium text-neutral-900">{t.lote.produto.nome}</div>
                    <div className="text-sm text-neutral-500">
                      Lote {t.lote.codigoLote} · {t.localOrigem.nome} → {t.localDestino.nome}
                    </div>
                    <div className="text-sm text-neutral-500">
                      Enviado: {t.quantidade} {t.lote.produto.unidadeMedida} · Validade{' '}
                      {formatarData(t.lote.dataValidade)}
                    </div>
                  </div>
                  <ConfirmarForm transferencia={t} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
