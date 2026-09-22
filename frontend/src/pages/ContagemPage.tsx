import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { registrarContagem, type ResultadoContagem } from '../lib/api/contagem';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, inputClass, labelClass } from '../lib/formStyles';

interface FormState {
  localId: string;
  produtoId: string;
  loteId: string;
  quantidadeContada: string;
  observacao: string;
}

const FORM_INICIAL: FormState = { localId: '', produtoId: '', loteId: '', quantidadeContada: '', observacao: '' };

export function ContagemPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [resultado, setResultado] = useState<ResultadoContagem | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const locaisPermitidos =
    usuario?.papel === 'ADMIN' ? locais : locais?.filter((l) => usuario?.locaisAcesso.includes(l.id));

  const { data: lotes } = useQuery({
    queryKey: ['lotes', form.produtoId, form.localId],
    queryFn: () => listarLotes({ produtoId: form.produtoId, localId: form.localId, comSaldo: false }),
    enabled: Boolean(form.produtoId && form.localId),
  });

  const loteSelecionado = lotes?.find((l) => l.id === form.loteId);
  const saldoSistema = loteSelecionado?.saldos[0] ? Number(loteSelecionado.saldos[0].quantidadeAtual) : 0;
  const divergePreview =
    form.loteId !== '' &&
    form.quantidadeContada !== '' &&
    Number(form.quantidadeContada) !== saldoSistema;

  const registrar = useMutation({
    mutationFn: registrarContagem,
    onSuccess: (dados) => {
      setResultado(dados);
      setForm(FORM_INICIAL);
      setErro(null);
    },
    onError: () => setErro('Não deu pra registrar a contagem — confira os dados.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    registrar.mutate({
      loteId: form.loteId,
      localId: form.localId,
      quantidadeContada: Number(form.quantidadeContada),
      observacao: form.observacao || undefined,
    });
  }

  if (resultado) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Contagem registrada</h1>
        <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-4 text-center">
          {resultado.divergiu ? (
            <>
              <div className="mb-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Divergência registrada
              </div>
              <div className="text-sm text-neutral-600">Sistema: {resultado.quantidadeSistema}</div>
              <div className="text-sm text-neutral-600">Contado: {resultado.quantidadeContada}</div>
            </>
          ) : (
            <div className="text-sm text-neutral-600">
              Contagem confere com o sistema ({resultado.quantidadeSistema}) — nada foi alterado.
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button type="button" className={buttonPrimaryClass} onClick={() => setResultado(null)}>
            Nova contagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Contagem</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="local">
              Local
            </label>
            <select
              id="local"
              required
              value={form.localId}
              onChange={(e) => setForm({ ...form, localId: e.target.value, loteId: '' })}
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
            <label className={labelClass} htmlFor="produto">
              Produto
            </label>
            <select
              id="produto"
              required
              disabled={!form.localId}
              value={form.produtoId}
              onChange={(e) => setForm({ ...form, produtoId: e.target.value, loteId: '' })}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {produtos
                ?.filter((p) => p.ativo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="lote">
              Lote
            </label>
            <select
              id="lote"
              required
              disabled={!form.produtoId}
              value={form.loteId}
              onChange={(e) => setForm({ ...form, loteId: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {lotes?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigoLote} — válido até {formatarData(l.dataValidade)} — sistema: {l.saldos[0]?.quantidadeAtual ?? 0}{' '}
                  {l.produto.unidadeMedida}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="quantidadeContada">
              Quantidade contada{loteSelecionado ? ` (${loteSelecionado.produto.unidadeMedida})` : ''}
            </label>
            <input
              id="quantidadeContada"
              type="number"
              step="0.001"
              min={0}
              required
              value={form.quantidadeContada}
              onChange={(e) => setForm({ ...form, quantidadeContada: e.target.value })}
              className={inputClass}
            />
          </div>

          {divergePreview && (
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="observacao">
                Observação (obrigatória — a contagem diverge do saldo do sistema, {saldoSistema})
              </label>
              <input
                id="observacao"
                required
                value={form.observacao}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                className={inputClass}
                placeholder="ex.: sobrou menos do que o sistema mostrava"
              />
            </div>
          )}
        </div>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button type="submit" disabled={registrar.isPending} className={buttonPrimaryClass}>
          {registrar.isPending ? 'Registrando...' : 'Registrar contagem'}
        </button>
      </form>
    </div>
  );
}
