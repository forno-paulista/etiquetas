import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { listarGrupos } from '../../lib/api/grupos';
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  UNIDADES_MEDIDA,
  type Produto,
  type UnidadeMedida,
} from '../../lib/api/produtos';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

interface FormState {
  id: string | null;
  nome: string;
  unidadeMedida: UnidadeMedida;
  grupoId: string;
  validadePadraoDias: string;
}

const FORM_INICIAL: FormState = {
  id: null,
  nome: '',
  unidadeMedida: 'UN',
  grupoId: '',
  validadePadraoDias: '',
};

export function ProdutosPage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: produtos, isLoading } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });
  const { data: grupos } = useQuery({ queryKey: ['grupos'], queryFn: listarGrupos });

  const salvar = useMutation({
    mutationFn: (dados: FormState) => {
      if (dados.id) {
        return atualizarProduto(dados.id, {
          nome: dados.nome,
          unidadeMedida: dados.unidadeMedida,
          grupoId: dados.grupoId || null,
          validadePadraoDias: dados.validadePadraoDias ? Number(dados.validadePadraoDias) : null,
        });
      }
      return criarProduto({
        nome: dados.nome,
        unidadeMedida: dados.unidadeMedida,
        grupoId: dados.grupoId || undefined,
        validadePadraoDias: dados.validadePadraoDias ? Number(dados.validadePadraoDias) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar o produto — confira os dados.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarProduto(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(produto: Produto) {
    setForm({
      id: produto.id,
      nome: produto.nome,
      unidadeMedida: produto.unidadeMedida,
      grupoId: produto.grupoId ?? '',
      validadePadraoDias: produto.validadePadraoDias ? String(produto.validadePadraoDias) : '',
    });
    setFormAberto(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Produtos</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo produto'}
        </button>
      </div>

      {formAberto && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="nome">
                Nome
              </label>
              <input
                id="nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="unidade">
                Unidade de medida
              </label>
              <select
                id="unidade"
                value={form.unidadeMedida}
                onChange={(e) => setForm({ ...form, unidadeMedida: e.target.value as UnidadeMedida })}
                className={inputClass}
              >
                {UNIDADES_MEDIDA.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="grupo">
                Grupo (opcional)
              </label>
              <select
                id="grupo"
                value={form.grupoId}
                onChange={(e) => setForm({ ...form, grupoId: e.target.value })}
                className={inputClass}
              >
                <option value="">Sem grupo</option>
                {grupos
                  ?.filter((g) => !g.grupoPaiId)
                  .flatMap((grupoPai) => [
                    <option key={grupoPai.id} value={grupoPai.id}>
                      {grupoPai.nome}
                    </option>,
                    ...grupos
                      .filter((g) => g.grupoPaiId === grupoPai.id)
                      .map((subgrupo) => (
                        <option key={subgrupo.id} value={subgrupo.id}>
                          {'  ↳ '}
                          {subgrupo.nome}
                        </option>
                      )),
                  ])}
              </select>
              {grupos?.length === 0 && (
                <p className="mt-1 text-xs text-neutral-500">
                  Nenhum grupo cadastrado ainda — crie em{' '}
                  <Link to="/admin/grupos" className="underline">
                    Administração &gt; Grupos
                  </Link>
                  .
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="validade">
                Validade padrão (dias, opcional)
              </label>
              <input
                id="validade"
                type="number"
                min={1}
                value={form.validadePadraoDias}
                onChange={(e) => setForm({ ...form, validadePadraoDias: e.target.value })}
                className={inputClass}
                placeholder="ex.: 7"
              />
            </div>
          </div>

          {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

          <button type="submit" disabled={salvar.isPending} className={buttonPrimaryClass}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {produtos && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Unidade</th>
                <th className="px-4 py-2 font-medium">Grupo</th>
                <th className="px-4 py-2 font-medium">Validade padrão</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {produtos.map((produto: Produto) => (
                <tr key={produto.id}>
                  <td className="px-4 py-2 text-neutral-900">{produto.nome}</td>
                  <td className="px-4 py-2 text-neutral-600">{produto.unidadeMedida}</td>
                  <td className="px-4 py-2 text-neutral-600">{produto.grupo?.nome ?? '—'}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    {produto.validadePadraoDias ? `${produto.validadePadraoDias} dias` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        produto.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={buttonSecondaryClass} onClick={() => editar(produto)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={buttonSecondaryClass}
                        onClick={() => alternarAtivo.mutate({ id: produto.id, ativo: !produto.ativo })}
                      >
                        {produto.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
