import { useEffect, useState } from 'react';

/** Devuelve `valor` solo cuando deja de cambiar durante `ms` milisegundos (para búsquedas). */
export default function useDebounce(valor, ms = 300) {
  const [estable, setEstable] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setEstable(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return estable;
}
