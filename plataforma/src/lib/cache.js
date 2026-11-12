/**
 * Caché en memoria de consultas de solo lectura.
 * - Guarda la PROMESA, así dos componentes que piden lo mismo al tiempo comparten una sola llamada.
 * - Cada entrada vence a los `ttl` milisegundos.
 * - Las escrituras (crear pedido, editar producto, reseñar…) llaman a `invalidar()`.
 */
const entradas = new Map(); // clave -> { promesa, vence }

export function enCache(clave, ttl, cargar) {
  const ahora = Date.now();
  const hit = entradas.get(clave);
  if (hit && hit.vence > ahora) return hit.promesa;
  const promesa = cargar().catch((error) => {
    entradas.delete(clave); // no guardar errores
    throw error;
  });
  entradas.set(clave, { promesa, vence: ahora + ttl });
  return promesa;
}

/** Borra las entradas cuyas claves empiezan por alguno de los prefijos (sin prefijos: todo). */
export function invalidar(...prefijos) {
  for (const clave of entradas.keys()) {
    if (!prefijos.length || prefijos.some((p) => clave.startsWith(p))) entradas.delete(clave);
  }
}

export const MINUTO = 60_000;
