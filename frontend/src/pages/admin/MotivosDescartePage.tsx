import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import {
  atualizarMotivoDescarte,
  criarMotivoDescarte,
  listarMotivosDescarte,
  type MotivoDescarte,
} from '../../lib/api/motivosDescarte';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

interface FormState {
  id: string | null;
  nome: string;
}

const FORM_INICIAL: FormState = { id: null, nome: '' };

export function MotivosDescartePage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: motivos, isLoading } = useQuery({
    queryKey: ['motivos-descarte'],
    queryFn: listarMotivosDescarte,
  });

  const salvar = useMutation({
    mutationFn: (dados: FormState) =>
      dados.id ? atualizarMotivoDescarte(dados.id, { nome: dados.nome }) : criarMotivoDescarte({ nome: dados.nome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motivos-descarte'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar — talvez já exista um motivo com esse nome.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarMotivoDescarte(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['motivos-descarte'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(motivo: MotivoDescarte) {
    setForm({ id: motivo.id, nome: motivo.nome });
    setFormAberto(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Motivos de Descarte</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo motivo'}
        </button>
      </div>

      {formAberto && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-4">
            <label className={labelClass} htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={inputClass}
              placeholder="ex.: Validade, Avaria, Perda, Contaminação"
            />
          </div>

          {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

          <button type="submit" disabled={salvar.isPending} className={buttonPrimaryClass}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {motivos && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {motivos.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">Nenhum motivo cadastrado ainda.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {motivos.map((motivo) => (
                <li key={motivo.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">{motivo.nome}</span>
                    {!motivo.ativo && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                        Inativo
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={buttonSecondaryClass} onClick={() => editar(motivo)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className={buttonSecondaryClass}
                      onClick={() => alternarAtivo.mutate({ id: motivo.id, ativo: !motivo.ativo })}
                    >
                      {motivo.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
