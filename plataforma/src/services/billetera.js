import { supabase, ejecutar } from '../lib/supabase.js';
import { Billetera, Movimiento } from '../models/index.js';

/** Resumen calculado en PostgreSQL: saldo, recargado, gastado y recaudado. */
export const obtenerBilletera = async () => new Billetera(await ejecutar(supabase.rpc('resumen_billetera')));

export async function listarMovimientos(limite = 100) {
  const filas = await ejecutar(supabase
    .from('movimientos')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limite));
  return Movimiento.desdeFilas(filas);
}

/** Recarga de prueba: no se cobra dinero real. Devuelve el saldo nuevo. */
export async function recargar(monto, metodo) {
  Billetera.validarRecarga(monto);
  if (!Movimiento.METODOS.includes(metodo)) throw new Error('Elige un método de recarga');
  return Number(await ejecutar(supabase.rpc('recargar_saldo', { p_monto: Math.round(monto), p_metodo: metodo })));
}
