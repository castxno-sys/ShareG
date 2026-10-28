let contador = 0;

/** Genera un id único sencillo: PREFIJO-0001 */
export function generarId(prefijo) {
  contador += 1;
  return `${prefijo}-${String(contador).padStart(4, '0')}`;
}
