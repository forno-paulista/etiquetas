import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { listarLocais } from '../../lib/api/locais';
import {
  atualizarUsuario,
  criarUsuario,
  listarUsuarios,
  resetarSenhaUsuario,
  type PapelUsuario,
  type Usuario,
} from '../../lib/api/usuarios';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../../lib/formStyles';

const PAPEL_LABEL: Record<PapelUsuario, string> = {
  ADMIN: 'Admin',
  GESTOR_CD: 'Gestor CD',
  GESTOR_LOJA: 'Gestor Loja',
  OPERADOR: 'Operador',
};

interface FormState {
  id: string | null;
  nome: string;
  email: string;
  senha: string;
  papel: PapelUsuario;
  locaisAcesso: string[];
}

const FORM_INICIAL: FormState = {
  id: null,
  nome: '',
  email: '',
  senha: '',
  papel: 'OPERADOR',
  locaisAcesso: [],
};

function RedefinirSenha({ usuarioId }: { usuarioId: string }) {
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const redefinir = useMutation({
    mutationFn: () => resetarSenhaUsuario(usuarioId, senha),
    onSuccess: () => {
      setAberto(false);
      setSenha('');
      setErro(null);
    },
    onError: () => setErro('Senha precisa ter pelo menos 8 caracteres.'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    redefinir.mutate();
  }

  if (!aberto) {
    return (
      <button type="button" className={buttonSecondaryClass} onClick={() => setAberto(true)}>
        Redefinir senha
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="password"
        required
        minLength={8}
        placeholder="Nova senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={`${inputClass} w-40`}
      />
      <button type="submit" disabled={redefinir.isPending} className={buttonPrimaryClass}>
        Salvar
      </button>
      <button type="button" className={buttonSecondaryClass} onClick={() => setAberto(false)}>
        Cancelar
      </button>
      {erro && <span className="text-xs text-red-600">{erro}</span>}
    </form>
  );
}

export function UsuariosPage() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [erro, setErro] = useState<string | null>(null);

  const { data: usuarios, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });
  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });

  const salvar = useMutation({
    mutationFn: (dados: FormState) =>
      dados.id
        ? atualizarUsuario(dados.id, {
            nome: dados.nome,
            papel: dados.papel,
            locaisAcesso: dados.locaisAcesso,
          })
        : criarUsuario({
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            papel: dados.papel,
            locaisAcesso: dados.locaisAcesso,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setForm(FORM_INICIAL);
      setFormAberto(false);
      setErro(null);
    },
    onError: () => setErro('Não deu pra salvar — confira se o email já está em uso e se a senha tem 8+ caracteres.'),
  });

  const alternarAtivo = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) => atualizarUsuario(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    salvar.mutate(form);
  }

  function editar(usuario: Usuario) {
    setForm({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senha: '',
      papel: usuario.papel,
      locaisAcesso: usuario.locaisAcesso.map((l) => l.id),
    });
    setFormAberto(true);
  }

  function alternarLocal(localId: string) {
    setForm((f) => ({
      ...f,
      locaisAcesso: f.locaisAcesso.includes(localId)
        ? f.locaisAcesso.filter((id) => id !== localId)
        : [...f.locaisAcesso, localId],
    }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Usuários</h1>
        <button
          type="button"
          className={buttonPrimaryClass}
          onClick={() => {
            setForm(FORM_INICIAL);
            setFormAberto((v) => !v);
          }}
        >
          {formAberto ? 'Cancelar' : 'Novo usuário'}
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
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={Boolean(form.id)}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            {!form.id && (
              <div>
                <label className={labelClass} htmlFor="senha">
                  Senha (mínimo 8 caracteres)
                </label>
                <input
                  id="senha"
                  type="password"
                  required
                  minLength={8}
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="papel">
                Papel
              </label>
              <select
                id="papel"
                value={form.papel}
                onChange={(e) => setForm({ ...form, papel: e.target.value as PapelUsuario })}
                className={inputClass}
              >
                {Object.entries(PAPEL_LABEL).map(([valor, label]) => (
                  <option key={valor} value={valor}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Locais de acesso{form.papel === 'ADMIN' ? ' (Admin já tem acesso a todos)' : ''}
              </label>
              <div className="flex flex-wrap gap-3">
                {locais?.map((l) => (
                  <label key={l.id} className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      disabled={form.papel === 'ADMIN'}
                      checked={form.locaisAcesso.includes(l.id)}
                      onChange={() => alternarLocal(l.id)}
                    />
                    {l.nome}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

          <button type="submit" disabled={salvar.isPending} className={buttonPrimaryClass}>
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">Carregando...</p>}

      {usuarios && (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-2 font-medium">Nome</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Papel</th>
                <th className="px-4 py-2 font-medium">Locais</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-4 py-2 text-neutral-900">{usuario.nome}</td>
                  <td className="px-4 py-2 text-neutral-600">{usuario.email}</td>
                  <td className="px-4 py-2 text-neutral-600">{PAPEL_LABEL[usuario.papel]}</td>
                  <td className="px-4 py-2 text-neutral-600">
                    {usuario.papel === 'ADMIN'
                      ? 'Todos'
                      : usuario.locaisAcesso.map((l) => l.nome).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        usuario.ativo ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" className={buttonSecondaryClass} onClick={() => editar(usuario)}>
                        Editar
                      </button>
                      <RedefinirSenha usuarioId={usuario.id} />
                      <button
                        type="button"
                        className={buttonSecondaryClass}
                        onClick={() => alternarAtivo.mutate({ id: usuario.id, ativo: !usuario.ativo })}
                      >
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
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
