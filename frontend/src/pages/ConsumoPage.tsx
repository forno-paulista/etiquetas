import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';
import { registrarConsumo, type MovimentoConsumo } from '../lib/api/consumo';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../lib/formStyles';

interface FormState {
  localId: string;
  produtoId: string;
  loteId: string;
  quantidade: string;
}

const FORM_INICIAL: FormState = { localId: '', produtoId: '', loteId: '', quantidade: '' };

export function ConsumoPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [ultimo, setUltimo] = useState<MovimentoConsumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const locaisPermitidos =
    usuario?.papel === 'ADMIN' ? locais : locais?.filter((l) => usuario?.locaisAcesso.includes(l.id));

  const { data: lotes } = useQuery({
    queryKey: ['lotes', form.produtoId, form.localId],
    queryFn: () => listarLotes({ produtoId: form.produtoId, localId: form.localId }),
    enabled: Boolean(form.produtoId && form.localId),
  });

  const loteSelecionado = lotes?.find((l) => l.id === form.loteId);
  const saldoDisponivel = loteSelecionado?.saldos[0] ? Number(loteSelecionado.saldos[0].quantidadeAtual) : null;

  const registrar = useMutation({
    mutationFn: registrarConsumo,
    onSuccess: (movimento) => {
      setUltimo(movimento);
      // Mantém local e produto — pensado pra lançar vários consumos em
      // sequência no fim do turno (regra 14), sem repetir a seleção.
      setForm({ ...form, loteId: '', quantidade: '' });
      setErro(null);
    },
    onError: () => setErro('Não deu pra registrar — confira o saldo disponível.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.loteId) {
      setErro('Selecione um lote.');
      return;
    }
    registrar.mutate({
      loteId: form.loteId,
      localId: form.localId,
      quantidade: Number(form.quantidade),
    });
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Consumo / Baixa</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Pra uso interno — retirada de um lote pra usar na produção/loja. Não precisa lançar no momento exato do
        uso: pode registrar tudo de um turno de uma vez.
      </p>

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
            <SearchableSelect
              id="produto"
              disabled={!form.localId}
              value={form.produtoId}
              onChange={(id) => setForm({ ...form, produtoId: id, loteId: '' })}
              options={produtos?.filter((p) => p.ativo) ?? []}
              getId={(p) => p.id}
              getLabel={(p) => p.nome}
              placeholder="Buscar produto..."
              emptyMessage="Nenhum produto encontrado."
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="lote">
              Lote
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

        <div className="flex items-center gap-3">
          <button type="submit" disabled={registrar.isPending} className={buttonPrimaryClass}>
            {registrar.isPending ? 'Registrando...' : 'Registrar consumo'}
          </button>
          {form.localId && (
            <button type="button" className={buttonSecondaryClass} onClick={() => setForm(FORM_INICIAL)}>
              Trocar local/produto
            </button>
          )}
        </div>
      </form>

      {ultimo && (
        <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Registrado: {ultimo.lote.produto.nome} — {Math.abs(Number(ultimo.quantidade))}{' '}
          {ultimo.lote.produto.unidadeMedida} em {ultimo.localOrigem.nome}.
        </div>
      )}
    </div>
  );
}
