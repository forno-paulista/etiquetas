import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { SearchableSelect } from '../components/SearchableSelect';
import { useAuth } from '../context/AuthContext';
import { listarLocais } from '../lib/api/locais';
import { listarLotes } from '../lib/api/lotes';
import { criarProducao, type Producao } from '../lib/api/producao';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../lib/formStyles';

interface ConsumoRowState {
  key: string;
  produtoOrigemId: string;
  loteOrigemId: string;
  origemDesconhecida: boolean;
  descricaoOrigem: string;
  quantidadeConsumida: string;
}

function novaLinhaConsumo(): ConsumoRowState {
  return {
    key: Math.random().toString(36).slice(2),
    produtoOrigemId: '',
    loteOrigemId: '',
    origemDesconhecida: false,
    descricaoOrigem: '',
    quantidadeConsumida: '',
  };
}

interface FormState {
  localId: string;
  produtoSaidaId: string;
  quantidadeProduzida: string;
  validadeSaida: string;
  codigoLote: string;
  consumos: ConsumoRowState[];
}

const FORM_INICIAL: FormState = {
  localId: '',
  produtoSaidaId: '',
  quantidadeProduzida: '',
  validadeSaida: '',
  codigoLote: '',
  consumos: [novaLinhaConsumo()],
};

function ConsumoRow({
  row,
  localId,
  produtos,
  onChange,
  onRemover,
  removivel,
}: {
  row: ConsumoRowState;
  localId: string;
  produtos: { id: string; nome: string; ativo: boolean }[] | undefined;
  onChange: (row: ConsumoRowState) => void;
  onRemover: () => void;
  removivel: boolean;
}) {
  const { data: lotes } = useQuery({
    queryKey: ['lotes', row.produtoOrigemId, localId],
    queryFn: () => listarLotes({ produtoId: row.produtoOrigemId, localId }),
    enabled: Boolean(row.produtoOrigemId && localId && !row.origemDesconhecida),
  });

  const loteSelecionado = lotes?.find((l) => l.id === row.loteOrigemId);

  return (
    <div className="rounded-md border border-neutral-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={row.origemDesconhecida}
            onChange={(e) =>
              onChange({ ...row, origemDesconhecida: e.target.checked, loteOrigemId: '', produtoOrigemId: '' })
            }
          />
          Origem desconhecida (sobra, item fora do fluxo do sistema)
        </label>
        {removivel && (
          <button type="button" className="text-xs text-red-600 hover:underline" onClick={onRemover}>
            Remover
          </button>
        )}
      </div>

      {row.origemDesconhecida ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Descrição da origem</label>
            <input
              required
              value={row.descricaoOrigem}
              onChange={(e) => onChange({ ...row, descricaoOrigem: e.target.value })}
              className={inputClass}
              placeholder="ex.: sobra da produção de ontem"
            />
          </div>
          <div>
            <label className={labelClass}>Quantidade consumida</label>
            <input
              type="number"
              step="0.001"
              min={0.001}
              required
              value={row.quantidadeConsumida}
              onChange={(e) => onChange({ ...row, quantidadeConsumida: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Produto de origem</label>
            <SearchableSelect
              disabled={!localId}
              value={row.produtoOrigemId}
              onChange={(id) => onChange({ ...row, produtoOrigemId: id, loteOrigemId: '' })}
              options={produtos?.filter((p) => p.ativo) ?? []}
              getId={(p) => p.id}
              getLabel={(p) => p.nome}
              placeholder="Buscar produto..."
              emptyMessage="Nenhum produto encontrado."
            />
          </div>
          <div>
            <label className={labelClass}>Lote (FEFO)</label>
            <SearchableSelect
              disabled={!row.produtoOrigemId}
              value={row.loteOrigemId}
              onChange={(id) => onChange({ ...row, loteOrigemId: id })}
              options={lotes ?? []}
              getId={(l) => l.id}
              getLabel={(l) => l.codigoLote}
              getDescricao={(l) =>
                `Válido até ${formatarData(l.dataValidade)} — ${l.saldos[0]?.quantidadeAtual ?? 0} ${l.produto.unidadeMedida}`
              }
              placeholder="Buscar lote pelo código..."
              emptyMessage="Nenhum lote com saldo desse produto nesse local."
            />
          </div>
          <div>
            <label className={labelClass}>
              Quantidade{loteSelecionado ? ` (${loteSelecionado.produto.unidadeMedida})` : ''}
            </label>
            <input
              type="number"
              step="0.001"
              min={0.001}
              max={loteSelecionado ? Number(loteSelecionado.saldos[0]?.quantidadeAtual ?? 0) : undefined}
              required
              value={row.quantidadeConsumida}
              onChange={(e) => onChange({ ...row, quantidadeConsumida: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ProducaoPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [resultado, setResultado] = useState<Producao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });

  const locaisPermitidos =
    usuario?.papel === 'ADMIN' ? locais : locais?.filter((l) => usuario?.locaisAcesso.includes(l.id));

  const criar = useMutation({
    mutationFn: criarProducao,
    onSuccess: (producao) => {
      setResultado(producao);
      setForm(FORM_INICIAL);
      setErro(null);
    },
    onError: () =>
      setErro('Não deu pra registrar a produção — confira o saldo dos lotes de origem e os dados informados.'),
  });

  function atualizarConsumo(key: string, row: ConsumoRowState) {
    setForm({ ...form, consumos: form.consumos.map((c) => (c.key === key ? row : c)) });
  }

  function removerConsumo(key: string) {
    setForm({ ...form, consumos: form.consumos.filter((c) => c.key !== key) });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.produtoSaidaId) {
      setErro('Selecione o produto de saída.');
      return;
    }
    if (form.consumos.some((c) => !c.origemDesconhecida && !c.loteOrigemId)) {
      setErro('Selecione um lote de origem em cada linha de consumo (ou marque origem desconhecida).');
      return;
    }
    criar.mutate({
      produtoSaidaId: form.produtoSaidaId,
      localId: form.localId,
      quantidadeProduzida: Number(form.quantidadeProduzida),
      validadeSaida: form.validadeSaida || undefined,
      codigoLote: form.codigoLote || undefined,
      consumos: form.consumos.map((c) =>
        c.origemDesconhecida
          ? {
              origemDesconhecida: true,
              descricaoOrigem: c.descricaoOrigem,
              quantidadeConsumida: Number(c.quantidadeConsumida),
            }
          : { loteOrigemId: c.loteOrigemId, quantidadeConsumida: Number(c.quantidadeConsumida) },
      ),
    });
  }

  if (resultado) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Produção registrada</h1>
        <div className="mx-auto max-w-sm rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <div className="mb-2 text-lg font-semibold text-neutral-900">{resultado.produtoSaida.nome}</div>
          <div className="mb-1 text-sm text-neutral-600">Lote {resultado.loteSaida.codigoLote}</div>
          <div className="mb-1 text-sm text-neutral-600">
            {resultado.quantidadeProduzida} {resultado.produtoSaida.unidadeMedida}
          </div>
          <div className="mb-1 text-sm text-neutral-600">Validade: {formatarData(resultado.validadeSaida)}</div>
          <div className="text-sm text-neutral-600">{resultado.local.nome}</div>
        </div>
        <div className="mt-6 flex justify-center">
          <button type="button" className={buttonPrimaryClass} onClick={() => setResultado(null)}>
            Nova produção
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Produção / Porcionamento</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="local">
              Local
            </label>
            <select
              id="local"
              required
              value={form.localId}
              onChange={(e) => setForm({ ...form, localId: e.target.value })}
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
            <label className={labelClass} htmlFor="produtoSaida">
              Produto de saída (o que está sendo produzido/porcionado)
            </label>
            <SearchableSelect
              id="produtoSaida"
              value={form.produtoSaidaId}
              onChange={(id) => setForm({ ...form, produtoSaidaId: id })}
              options={produtos?.filter((p) => p.ativo) ?? []}
              getId={(p) => p.id}
              getLabel={(p) => p.nome}
              placeholder="Buscar produto..."
              emptyMessage="Nenhum produto encontrado."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="quantidadeProduzida">
              Quantidade produzida
            </label>
            <input
              id="quantidadeProduzida"
              type="number"
              step="0.001"
              min={0.001}
              required
              value={form.quantidadeProduzida}
              onChange={(e) => setForm({ ...form, quantidadeProduzida: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="validadeSaida">
              Validade da saída (opcional — se o produto tiver validade padrão, calcula sozinho)
            </label>
            <input
              id="validadeSaida"
              type="date"
              value={form.validadeSaida}
              onChange={(e) => setForm({ ...form, validadeSaida: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="codigoLote">
              Código do lote de saída (opcional)
            </label>
            <input
              id="codigoLote"
              value={form.codigoLote}
              onChange={(e) => setForm({ ...form, codigoLote: e.target.value })}
              className={inputClass}
              placeholder="Se deixar em branco, o sistema gera um código"
            />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-700">
              Consumo de matéria-prima (1 ou mais lotes de origem)
            </h2>
            <button
              type="button"
              className={buttonSecondaryClass}
              onClick={() => setForm({ ...form, consumos: [...form.consumos, novaLinhaConsumo()] })}
            >
              + Adicionar lote de origem
            </button>
          </div>
          <div className="space-y-3">
            {form.consumos.map((row) => (
              <ConsumoRow
                key={row.key}
                row={row}
                localId={form.localId}
                produtos={produtos}
                onChange={(novaRow) => atualizarConsumo(row.key, novaRow)}
                onRemover={() => removerConsumo(row.key)}
                removivel={form.consumos.length > 1}
              />
            ))}
          </div>
        </div>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button type="submit" disabled={criar.isPending} className={buttonPrimaryClass}>
          {criar.isPending ? 'Registrando...' : 'Registrar produção'}
        </button>
      </form>
    </div>
  );
}
