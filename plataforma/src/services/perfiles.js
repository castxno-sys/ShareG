import { supabase, ejecutar } from '../lib/supabase.js';
import { enCache, MINUTO } from '../lib/cache.js';
import { Usuario, Productor, Comprador } from '../models/index.js';

export const actualizarPerfil = (id, campos) =>
  ejecutar(supabase.from('perfiles').update(campos).eq('id', id));

/** Perfil propio completo (incluye teléfono, que no es público). */
export const obtenerPerfil = async () =>
  Usuario.desdeFila(await ejecutar(supabase.rpc('mi_perfil').maybeSingle()));

export const listarProductores = () =>
  enCache('productores', 5 * MINUTO, async () => Usuario.desdeFilas(await ejecutar(supabase
    .from('perfiles')
    .select('id, nombre, rol, vereda, descripcion, productos(count)')
    .eq('rol', 'productor')
    .order('creado_en'))));

/** Compradores registrados, más recientes primero (solo productores; lo valida PostgreSQL). */
export async function listarNuevosCompradores(limite = 30, texto = '') {
  const filas = await ejecutar(supabase.rpc('nuevos_compradores', { p_limite: limite, p_texto: texto || null }));
  return filas.map((f) => new Comprador({ ...f, rol: 'comprador' }));
}

/** Cifras públicas de la portada: compradores, productores, productos y los últimos en unirse. */
export const estadisticasPublicas = () =>
  enCache('estadisticas', 2 * MINUTO, () => ejecutar(supabase.rpc('estadisticas_publicas')));

/** Buscador de vendedores: nombre, vereda, descripción o nombre de sus productos (sin importar tildes). */
export const buscarProductores = (texto = '', vereda = null) =>
  enCache(`vendedores:${texto.trim().toLowerCase()}|${vereda ?? ''}`, MINUTO, async () =>
    (await ejecutar(supabase.rpc('buscar_productores', { p_texto: texto.trim(), p_vereda: vereda })))
      .map((f) => new Productor({ ...f, rol: 'productor' })));

/** Perfil público de un vendedor. */
export const obtenerProductor = (id) =>
  enCache(`vendedor:${id}`, MINUTO, async () => {
    const [fila] = await ejecutar(supabase.rpc('buscar_productores', { p_texto: '' }).eq('id', id));
    return fila ? new Productor({ ...fila, rol: 'productor' }) : null;
  });

