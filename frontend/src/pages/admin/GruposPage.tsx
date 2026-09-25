import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { atualizarGrupo, criarGrupo, listarGrupos, type Grupo } from '../../lib/api/grupos';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

interface FormState {
  id: string | null;
  nome: string;
  grupoPaiId: string;
}

const FORM_INICIAL: FormState = { id: null, nome: '', grupoPaiId: '' };

export function GruposPage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: grupos, isLoading } = useQuery({ queryKey: ['grupos'], queryFn: listarGrupos });

  const gruposPai = grupos?.filter((g) => !g.grupoPaiId) ?? [];
  const subgruposPorPai = (paiId: string) => grupos?.filter((g) => g.grupoPaiId === paiId) ?? [];

  const salvar = useMutation({
    mutationFn: (dados: FormState) =>
      dados.id
        ? atualizarGrupo(dados.id, { nome: dados.nome })
        : criarGrupo({ nome: dados.nome, grupoPaiId: dados.grupoPaiId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar o grupo — confira os dados.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarGrupo(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grupos'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(grupo: Grupo) {
    setForm({ id: grupo.id, nome: grupo.nome, grupoPaiId: grupo.grupoPaiId ?? '' });
    setFormAberto(true);
  }

  function novoSubgrupo(paiId: string) {
    setForm({ id: null, nome: '', grupoPaiId: paiId });
    setFormAberto(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Grupos</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo grupo'}
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
              <label className={labelClass} htmlFor="grupoPai">
                Grupo pai (opcional — deixe em branco pra criar um grupo de topo)
              </label>
              <select
                id="grupoPai"
                value={form.grupoPaiId}
                disabled={Boolean(form.id)}
                onChange={(e) => setForm({ ...form, grupoPaiId: e.target.value })}
                className={inputClass}
              >
                <option value="">Nenhum (grupo de topo)</option>
                {gruposPai
                  .filter((g) => g.id !== form.id)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
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

      {grupos && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {gruposPai.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum grupo cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {gruposPai.map((grupo) => (
                <li key={grupo.id}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{grupo.nome}</span>
                      {!grupo.ativo && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className={buttonSecondaryClass} onClick={() => novoSubgrupo(grupo.id)}>
                        + Subgrupo
                      </button>
                      <button type="button" className={buttonSecondaryClass} onClick={() => editar(grupo)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={buttonSecondaryClass}
                        onClick={() => alternarAtivo.mutate({ id: grupo.id, ativo: !grupo.ativo })}
                      >
                        {grupo.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                  {subgruposPorPai(grupo.id).length > 0 && (
                    <ul className="divide-y divide-neutral-50 border-t border-neutral-100 bg-neutral-50 pl-6">
                      {subgruposPorPai(grupo.id).map((subgrupo) => (
                        <li key={subgrupo.id} className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-400">↳</span>
                            <span className="text-neutral-800">{subgrupo.nome}</span>
                            {!subgrupo.ativo && (
                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                                Inativo
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" className={buttonSecondaryClass} onClick={() => editar(subgrupo)}>
                              Editar
                            </button>
                            <button
                              type="button"
                              className={buttonSecondaryClass}
                              onClick={() => alternarAtivo.mutate({ id: subgrupo.id, ativo: !subgrupo.ativo })}
                            >
                              {subgrupo.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
