import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { listarProdutos } from '../lib/api/produtos';
import { enviarTransferencia, type Transferencia } from '../lib/api/transferencias';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, inputClass, labelClass } from '../lib/formStyles';

interface FormState {
  localOrigemId: string;
  produtoId: string;
  loteId: string;
  localDestinoId: string;
  quantidade: string;
}

const FORM_INICIAL: FormState = {
  localOrigemId: '',
  produtoId: '',
  loteId: '',
  localDestinoId: '',
  quantidade: '',
};

export function TransferenciaEnviarPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [enviada, setEnviada] = useState<Transferencia | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const locaisPermitidos =
    usuario?.papel === 'ADMIN' ? locais : locais?.filter((l) => usuario?.locaisAcesso.includes(l.id));

  const { data: lotes } = useQuery({
    queryKey: ['lotes', form.produtoId, form.localOrigemId],
    queryFn: () => listarLotes({ produtoId: form.produtoId, localId: form.localOrigemId }),
    enabled: Boolean(form.produtoId && form.localOrigemId),
  });

  const loteSelecionado = lotes?.find((l) => l.id === form.loteId);
  const saldoDisponivel = loteSelecionado?.saldos[0] ? Number(loteSelecionado.saldos[0].quantidadeAtual) : null;

  const enviar = useMutation({
    mutationFn: enviarTransferencia,
    onSuccess: (transferencia) => {
      setEnviada(transferencia);
      setForm(FORM_INICIAL);
      setErro(null);
    },
    onError: () =>
      setErro('Não deu pra enviar — confira o saldo disponível e se local de origem/destino são diferentes.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.loteId) {
      setErro('Selecione um lote.');
      return;
    }
    enviar.mutate({
      loteId: form.loteId,
      localOrigemId: form.localOrigemId,
      localDestinoId: form.localDestinoId,
      quantidade: Number(form.quantidade),
    });
  }

  if (enviada) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Transferência enviada</h1>
        <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <div className="mb-2 text-lg font-semibold text-neutral-900">{enviada.lote.produto.nome}</div>
          <div className="mb-1 text-sm text-neutral-600">Lote {enviada.lote.codigoLote}</div>
          <div className="mb-1 text-sm text-neutral-600">
            {enviada.quantidade} {enviada.lote.produto.unidadeMedida}
          </div>
          <div className="mb-1 text-sm text-neutral-600">
            {enviada.localOrigem.nome} → {enviada.localDestino.nome}
          </div>
          <div className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Em trânsito — aguardando confirmação no destino
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <button type="button" className={buttonPrimaryClass} onClick={() => setEnviada(null)}>
            Nova transferência
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Transferência — Enviar</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="localOrigem">
              Local de origem
            </label>
            <select
              id="localOrigem"
              required
              value={form.localOrigemId}
              onChange={(e) =>
                setForm({ ...form, localOrigemId: e.target.value, loteId: '', localDestinoId: '' })
              }
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {locaisPermitidos?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="localDestino">
              Local de destino
            </label>
            <select
              id="localDestino"
              required
              value={form.localDestinoId}
              onChange={(e) => setForm({ ...form, localDestinoId: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {locais
                ?.filter((l) => l.id !== form.localOrigemId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="produto">
              Produto
            </label>
            <SearchableSelect
              id="produto"
              disabled={!form.localOrigemId}
              value={form.produtoId}
              onChange={(id) => setForm({ ...form, produtoId: id, loteId: '' })}
              options={produtos?.filter((p) => p.ativo) ?? []}
              getId={(p) => p.id}
              getLabel={(p) => p.nome}
              placeholder="Buscar produto..."
              emptyMessage="Nenhum produto encontrado."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="lote">
              Lote{' '}
              <span className="font-normal text-neutral-400">
                (mais próximo do vencimento primeiro — FEFO)
              </span>
            </label>
            <SearchableSelect
              id="lote"
              disabled={!form.produtoId}
              value={form.loteId}
              onChange={(id) => setForm({ ...form, loteId: id })}
              options={lotes ?? []}
              getId={(l) => l.id}
              getLabel={(l) => l.codigoLote}
              getDescricao={(l) =>
                `Válido até ${formatarData(l.dataValidade)} — ${l.saldos[0]?.quantidadeAtual ?? 0} ${l.produto.unidadeMedida} disponível`
              }
              placeholder="Buscar lote pelo código..."
              emptyMessage="Nenhum lote com saldo desse produto nesse local."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="quantidade">
              Quantidade{loteSelecionado ? ` (${loteSelecionado.produto.unidadeMedida})` : ''}
            </label>
            <input
              id="quantidade"
              type="number"
              step="0.001"
              min={0.001}
              max={saldoDisponivel ?? undefined}
              required
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className={inputClass}
            />
            {saldoDisponivel !== null && (
              <p className="mt-1 text-xs text-neutral-500">Disponível: {saldoDisponivel}</p>
            )}
          </div>
        </div>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button type="submit" disabled={enviar.isPending} className={buttonPrimaryClass}>
          {enviar.isPending ? 'Enviando...' : 'Enviar transferência'}
        </button>
      </form>
    </div>
  );
}
