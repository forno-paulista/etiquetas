import { useEffect, useRef, useState } from 'react';
import { inputClass } from '../lib/formStyles';

interface SearchableSelectProps<T> {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  options: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  getDescricao?: (item: T) => string | undefined;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

// Combobox com busca — pensado pra listas que podem crescer bastante (lote,
// produto). Um <select> comum vira impraticável quando tem muitas opções
// (o usuário teria que rolar procurando); aqui digita e filtra na hora.
export function SearchableSelect<T>({
  id,
  value,
  onChange,
  options,
  getId,
  getLabel,
  getDescricao,
  placeholder,
  disabled,
  emptyMessage = 'Nenhum resultado.',
}: SearchableSelectProps<T>) {
  const [query, setQuery] = useState('');
  const [aberto, setAberto] = useState(false);
  const [destaque, setDestaque] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selecionado = options.find((o) => getId(o) === value);

  // Mantém o texto do campo sincronizado com a opção selecionada quando ela
  // muda por fora (ex.: trocou o produto e o lote foi resetado).
  useEffect(() => {
    setQuery(selecionado ? getLabel(selecionado) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  useEffect(() => {
    function aoClicarFora(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
        setQuery(selecionado ? getLabel(selecionado) : '');
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecionado]);

  const filtradas = options.filter((o) => getLabel(o).toLowerCase().includes(query.toLowerCase()));

  function selecionar(item: T) {
    onChange(getId(item));
    setQuery(getLabel(item));
    setAberto(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!aberto && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setAberto(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setDestaque((i) => Math.min(i + 1, filtradas.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setDestaque((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filtradas[destaque];
      if (item) selecionar(item);
    } else if (event.key === 'Escape') {
      setAberto(false);
      setQuery(selecionado ? getLabel(selecionado) : '');
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onFocus={() => {
          setAberto(true);
          setDestaque(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setAberto(true);
          setDestaque(0);
          if (value) onChange('');
        }}
        onKeyDown={handleKeyDown}
        className={inputClass}
      />
      {aberto && !disabled && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-neutral-200 bg-white text-sm shadow-lg">
          {filtradas.length === 0 ? (
            <li className="px-3 py-2 text-neutral-500">{emptyMessage}</li>
          ) : (
            filtradas.map((item, index) => (
              <li key={getId(item)}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecionar(item)}
                  className={`block w-full px-3 py-2 text-left ${
                    index === destaque ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                  } ${getId(item) === value ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}
                >
                  <div>{getLabel(item)}</div>
                  {getDescricao?.(item) && <div className="text-xs text-neutral-500">{getDescricao(item)}</div>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
