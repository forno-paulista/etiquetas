import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';
import { registrarDescarte, type Descarte } from '../lib/api/descarte';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { listarMotivosDescarte } from '../lib/api/motivosDescarte';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, inputClass, labelClass } from '../lib/formStyles';

interface FormState {
  localId: string;
  produtoId: string;
  loteId: string;
  motivoId: string;
  quantidade: string;
}

const FORM_INICIAL: FormState = { localId: '', produtoId: '', loteId: '', motivoId: '', quantidade: '' };

export function DescartePage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [resultado, setResultado] = useState<Descarte | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });
  const { data: motivos } = useQuery({ queryKey: ['motivos-descarte'], queryFn: listarMotivosDescarte });

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
    mutationFn: registrarDescarte,
    onSuccess: (descarte) => {
      setResultado(descarte);
      setForm(FORM_INICIAL);
      setErro(null);
    },
    onError: () => setErro('Não deu pra registrar o descarte — confira o saldo disponível.'),
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
      motivoId: form.motivoId,
      quantidade: Number(form.quantidade),
    });
  }

  if (resultado) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Descarte registrado</h1>
        <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <div className="mb-2 text-lg font-semibold text-neutral-900">{resultado.lote.produto.nome}</div>
          <div className="mb-1 text-sm text-neutral-600">Lote {resultado.lote.codigoLote}</div>
          <div className="mb-1 text-sm text-neutral-600">
            {resultado.quantidade} {resultado.lote.produto.unidadeMedida} · {resultado.motivo.nome}
          </div>
          <div className="mb-1 text-sm text-neutral-600">{resultado.local.nome}</div>
          {resultado.local.tipo === 'LOJA' && (
            <div className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Enviado pra fila de ajustes pendentes (lançar manualmente no Saipos)
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button type="button" className={buttonPrimaryClass} onClick={() => setResultado(null)}>
            Novo descarte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Descarte</h1>

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
            <label className={labelClass} htmlFor="motivo">
              Motivo
            </label>
            <select
              id="motivo"
              required
              value={form.motivoId}
              onChange={(e) => setForm({ ...form, motivoId: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {motivos
                ?.filter((m) => m.ativo)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
            </select>
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

        <button type="submit" disabled={registrar.isPending} className={buttonPrimaryClass}>
          {registrar.isPending ? 'Registrando...' : 'Registrar descarte'}
        </button>
      </form>
    </div>
  );
}
