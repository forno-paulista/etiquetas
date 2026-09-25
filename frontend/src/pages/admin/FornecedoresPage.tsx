import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  atualizarFornecedor,
  criarFornecedor,
  listarFornecedores,
  type Fornecedor,
} from '../../lib/api/fornecedores';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

interface FormState {
  id: string | null;
  nome: string;
  cnpj: string;
}

const FORM_INICIAL: FormState = { id: null, nome: '', cnpj: '' };

export function FornecedoresPage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: fornecedores, isLoading } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: listarFornecedores,
  });

  const salvar = useMutation({
    mutationFn: (dados: FormState) => {
      const input = { nome: dados.nome, cnpj: dados.cnpj || undefined };
      return dados.id ? atualizarFornecedor(dados.id, input) : criarFornecedor(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar o fornecedor — confira os dados.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarFornecedor(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fornecedores'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(fornecedor: Fornecedor) {
    setForm({ id: fornecedor.id, nome: fornecedor.nome, cnpj: fornecedor.cnpj ?? '' });
    setFormAberto(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Fornecedores</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo fornecedor'}
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
              <label className={labelClass} htmlFor="cnpj">
                CNPJ (opcional)
              </label>
              <input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                className={inputClass}
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

      {fornecedores && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {fornecedores.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum fornecedor cadastrado ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
                <tr>
                  <th className="px-4 py-2 font-medium">Nome</th>
                  <th className="px-4 py-2 font-medium">CNPJ</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fornecedores.map((f) => (
                  <tr key={f.id}>
                    <td className="px-4 py-2 text-neutral-900">{f.nome}</td>
                    <td className="px-4 py-2 text-neutral-600">{f.cnpj ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className={buttonSecondaryClass} onClick={() => editar(f)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className={buttonSecondaryClass}
                          onClick={() => alternarAtivo.mutate({ id: f.id, ativo: !f.ativo })}
                        >
                          {f.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
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
