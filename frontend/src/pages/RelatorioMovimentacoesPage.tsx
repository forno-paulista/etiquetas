import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listarLocais } from '../lib/api/locais';
import { listarProdutos } from '../lib/api/produtos';
import { listarMovimentos, type TipoMovimentoLote } from '../lib/api/relatorios';
import { inputClass, labelClass } from '../lib/formStyles';

const TIPO_LABEL: Record<TipoMovimentoLote, string> = {
  ENTRADA: 'Entrada (recebimento)',
  TRANSFERENCIA_SAIDA: 'Saída por transferência',
  TRANSFERENCIA_ENTRADA: 'Entrada por transferência',
  DESCARTE: 'Descarte',
  PRODUCAO_CONSUMO: 'Consumido em produção',
  PRODUCAO_ENTRADA: 'Entrada por produção',
  AJUSTE_CONTAGEM: 'Ajuste de contagem',
  CONSUMO: 'Consumo',
};

interface Filtros {
  produtoId: string;
  localId: string;
  tipo: TipoMovimentoLote | '';
  dataInicio: string;
  dataFim: string;
}

const FILTROS_INICIAIS: Filtros = { produtoId: '', localId: '', tipo: '', dataInicio: '', dataFim: '' };

export function RelatorioMovimentacoesPage() {
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });
  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });

  const { data: movimentos, isLoading } = useQuery({
    queryKey: ['relatorio-movimentos', filtros],
    queryFn: () =>
      listarMovimentos({
        produtoId: filtros.produtoId || undefined,
        localId: filtros.localId || undefined,
        tipo: filtros.tipo || undefined,
        dataInicio: filtros.dataInicio || undefined,
        dataFim: filtros.dataFim || undefined,
      }),
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-neutral-900">Relatório de Movimentações</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Dado bruto — todos os eventos de estoque, mais recentes primeiro (até 300 por consulta).
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-5">
        <div>
          <label className={labelClass} htmlFor="produto">
            Produto
          </label>
          <select
            id="produto"
            value={filtros.produtoId}
            onChange={(e) => setFiltros({ ...filtros, produtoId: e.target.value })}
            className={inputClass}
          >
            <option value="">Todos</option>
            {produtos?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="local">
            Local
          </label>
          <select
            id="local"
            value={filtros.localId}
            onChange={(e) => setFiltros({ ...filtros, localId: e.target.value })}
            className={inputClass}
          >
            <option value="">Todos</option>
            {locais?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value as TipoMovimentoLote | '' })}
            className={inputClass}
          >
            <option value="">Todos</option>
            {(Object.entries(TIPO_LABEL) as [TipoMovimentoLote, string][]).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="dataInicio">
            De
          </label>
          <input
            id="dataInicio"
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="dataFim">
            Até
          </label>
          <input
            id="dataFim"
            type="date"
            value={filtros.dataFim}
            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {movimentos && (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          {movimentos.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum movimento encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Produto / Lote</th>
                  <th className="px-4 py-2 font-medium">Local</th>
                  <th className="px-4 py-2 font-medium">Quantidade</th>
                  <th className="px-4 py-2 font-medium">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {movimentos.map((m) => (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-neutral-500">
                      {new Date(m.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-2 text-neutral-900">{TIPO_LABEL[m.tipo]}</td>
                    <td className="px-4 py-2 text-neutral-900">
                      <Link to={`/lotes/${m.loteId}`} className="hover:underline">
                        {m.lote.produto.nome} — {m.lote.codigoLote}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-neutral-600">
                      {m.localOrigem?.nome ?? ''}
                      {m.localOrigem && m.localDestino ? ' → ' : ''}
                      {m.localDestino?.nome ?? ''}
                    </td>
                    <td className={`px-4 py-2 ${Number(m.quantidade) < 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {Number(m.quantidade) > 0 ? '+' : ''}
                      {m.quantidade} {m.lote.produto.unidadeMedida}
                    </td>
                    <td className="px-4 py-2 text-neutral-600">{m.usuario.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
