import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { atualizarLocal, criarLocal, listarLocais, type Local } from '../../lib/api/locais';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

interface FormState {
  id: string | null;
  nome: string;
  tipo: 'CD' | 'LOJA';
}

const FORM_INICIAL: FormState = { id: null, nome: '', tipo: 'LOJA' };

export function LocaisPage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: locais, isLoading } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });

  const salvar = useMutation({
    mutationFn: (dados: FormState) =>
      dados.id
        ? atualizarLocal(dados.id, { nome: dados.nome, tipo: dados.tipo })
        : criarLocal({ nome: dados.nome, tipo: dados.tipo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar o local — confira os dados.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarLocal(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locais'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(local: Local) {
    setForm({ id: local.id, nome: local.nome, tipo: local.tipo });
    setFormAberto(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Locais</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo local'}
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
              <label className={labelClass} htmlFor="tipo">
                Tipo
              </label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as 'CD' | 'LOJA' })}
                className={inputClass}
              >
                <option value="LOJA">Loja</option>
                <option value="CD">Centro de Distribuição</option>
              </select>
            </div>
          </div>

          {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

          <button type="submit" disabled={salvar.isPending} className={buttonPrimaryClass}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {locais && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {locais.map((local) => (
                <tr key={local.id}>
                  <td className="px-4 py-2 text-neutral-900">{local.nome}</td>
                  <td className="px-4 py-2 text-neutral-600">{local.tipo === 'CD' ? 'Centro de Distribuição' : 'Loja'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        local.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {local.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" className={buttonSecondaryClass} onClick={() => editar(local)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={buttonSecondaryClass}
                        onClick={() => alternarAtivo.mutate({ id: local.id, ativo: !local.ativo })}
                      >
                        {local.ativo ? 'Desativar' : 'Ativar'}
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
