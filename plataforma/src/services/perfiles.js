import { supabase, ejecutar } from '../lib/supabase.js';
import { enCache, MINUTO } from '../lib/cache.js';
import { Usuario, Comprador } from '../models/index.js';

export const actualizarPerfil = (id, campos) =>
  ejecutar(supabase.from('perfiles').update(campos).eq('id', id));

export const obtenerPerfil = async (id) =>
  Usuario.desdeFila(await ejecutar(supabase.from('perfiles').select('*').eq('id', id).single()));

export const listarProductores = () =>
  enCache('productores', 5 * MINUTO, async () => Usuario.desdeFilas(await ejecutar(supabase
    .from('perfiles')
    .select('id, nombre, rol, vereda, descripcion, productos(count)')
    .eq('rol', 'productor')
    .order('creado_en'))));

/** Compradores registrados, más recientes primero (solo productores; lo valida PostgreSQL). */
export async function listarNuevosCompradores(limite = 30) {
  const filas = await ejecutar(supabase.rpc('nuevos_compradores', { p_limite: limite }));
  return filas.map((f) => new Comprador({ ...f, rol: 'comprador' }));
}

/** Cifras públicas de la portada: compradores, productores, productos y los últimos en unirse. */
export const estadisticasPublicas = () =>
  enCache('estadisticas', 2 * MINUTO, () => ejecutar(supabase.rpc('estadisticas_publicas')));

