import { useEffect, useState } from 'react';

/** true mientras la media query se cumpla (ej. '(min-width: 721px)'). */
export default function useMediaQuery(query) {
  const [cumple, setCumple] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const alCambiar = (e) => setCumple(e.matches);
    mq.addEventListener('change', alCambiar);
    setCumple(mq.matches);
    return () => mq.removeEventListener('change', alCambiar);
  }, [query]);
  return cumple;
}
