import { useMutation, useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarFornecedores } from '../lib/api/fornecedores';
import { listarLocais } from '../lib/api/locais';
import { receberLote, type Lote } from '../lib/api/lotes';
import { listarProdutos } from '../lib/api/produtos';
import { formatarData } from '../lib/formatarData';
import { buttonPrimaryClass, buttonSecondaryClass, inputClass, labelClass } from '../lib/formStyles';

interface FormState {
  produtoId: string;
  localId: string;
  fornecedorId: string;
  codigoLote: string;
  quantidade: string;
  dataFabricacao: string;
  dataValidade: string;
}

const FORM_INICIAL: FormState = {
  produtoId: '',
  localId: '',
  fornecedorId: '',
  codigoLote: '',
  quantidade: '',
  dataFabricacao: '',
  dataValidade: '',
};

function QrCodeEtiqueta({ lote }: { lote: Lote }) {
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/l/${lote.qrCodeId}`;
    QRCode.toDataURL(url, { margin: 1, width: 200 }).then(setQrSrc);
  }, [lote.qrCodeId]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
      <div className="mb-2 text-lg font-semibold text-neutral-900">{lote.produto.nome}</div>
      <div className="mb-1 text-sm text-neutral-600">Lote {lote.codigoLote}</div>
      <div className="mb-3 text-sm text-neutral-600">
        Validade: {formatarData(lote.dataValidade)}
      </div>
      {qrSrc && <img src={qrSrc} alt="QR Code do lote" className="mx-auto" />}
      <div className="mt-2 text-xs text-neutral-400">{lote.qrCodeId}</div>
    </div>
  );
}

export function RecebimentoPage() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [loteCriado, setLoteCriado] = useState<Lote | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const { data: produtos } = useQuery({ queryKey: ['produtos'], queryFn: listarProdutos });
  const { data: locais } = useQuery({ queryKey: ['locais'], queryFn: listarLocais });
  const { data: fornecedores } = useQuery({ queryKey: ['fornecedores'], queryFn: listarFornecedores });

  const locaisPermitidos =
    usuario?.papel === 'ADMIN' ? locais : locais?.filter((l) => usuario?.locaisAcesso.includes(l.id));

  const receber = useMutation({
    mutationFn: receberLote,
    onSuccess: (lote) => {
      setLoteCriado(lote);
      setForm(FORM_INICIAL);
      setErro(null);
    },
    onError: () => setErro('Não deu pra registrar o recebimento — confira os dados (saldo, produto, local).'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    receber.mutate({
      produtoId: form.produtoId,
      localId: form.localId,
      fornecedorId: form.fornecedorId || undefined,
      codigoLote: form.codigoLote,
      quantidade: Number(form.quantidade),
      dataFabricacao: form.dataFabricacao || undefined,
      dataValidade: form.dataValidade || undefined,
    });
  }

  if (loteCriado) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-neutral-900">Recebimento registrado</h1>
        <div className="mx-auto max-w-xs">
          <QrCodeEtiqueta lote={loteCriado} />
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className={buttonPrimaryClass} onClick={() => setLoteCriado(null)}>
            Novo recebimento
          </button>
          <button type="button" className={buttonSecondaryClass} onClick={() => window.print()}>
            Imprimir etiqueta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Recebimento</h1>

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
            <label className={labelClass} htmlFor="produto">
              Produto
            </label>
            <select
              id="produto"
              required
              value={form.produtoId}
              onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {produtos
                ?.filter((p) => p.ativo)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="fornecedor">
              Fornecedor (opcional)
            </label>
            <select
              id="fornecedor"
              value={form.fornecedorId}
              onChange={(e) => setForm({ ...form, fornecedorId: e.target.value })}
              className={inputClass}
            >
              <option value="">Sem fornecedor</option>
              {fornecedores?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="codigoLote">
              Código do lote
            </label>
            <input
              id="codigoLote"
              required
              value={form.codigoLote}
              onChange={(e) => setForm({ ...form, codigoLote: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="quantidade">
              Quantidade
            </label>
            <input
              id="quantidade"
              type="number"
              step="0.001"
              min={0.001}
              required
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="dataFabricacao">
              Data de fabricação (opcional)
            </label>
            <input
              id="dataFabricacao"
              type="date"
              value={form.dataFabricacao}
              onChange={(e) => setForm({ ...form, dataFabricacao: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="dataValidade">
              Data de validade (opcional — se o produto tiver validade padrão, calcula sozinho)
            </label>
            <input
              id="dataValidade"
              type="date"
              value={form.dataValidade}
              onChange={(e) => setForm({ ...form, dataValidade: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {erro && <p className="mb-4 text-sm text-red-600">{erro}</p>}

        <button type="submit" disabled={receber.isPending} className={buttonPrimaryClass}>
          {receber.isPending ? 'Registrando...' : 'Registrar recebimento'}
        </button>
      </form>
    </div>
  );
}
