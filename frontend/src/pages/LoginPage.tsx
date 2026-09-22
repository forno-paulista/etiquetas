import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/dashboard', { replace: true });
    } catch {
      setErro('Email ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Entrar</h1>

        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mb-4 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 focus:border-neutral-500 focus:outline-none"
        />

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-md bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
