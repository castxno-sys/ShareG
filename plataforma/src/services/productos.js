import { supabase, ejecutar } from '../lib/supabase.js';
import { enCache, invalidar, MINUTO } from '../lib/cache.js';
import { Categoria, Producto, Resena } from '../models/index.js';

const ORDENES = {
  precio_asc: ['precio', true],
  precio_desc: ['precio', false],
  mejor: ['calificacion', false],
  recientes: ['creado_en', false],
};

/** Limpia la caché de todo lo que muestra productos (después de cualquier cambio). */
export const invalidarProductos = () => invalidar('catalogo', 'producto:', 'productores', 'estadisticas');

/* ----- Lectura pública (con caché) ----- */
export const listarCategorias = () =>
  enCache('categorias', 30 * MINUTO, async () =>
    Categoria.desdeFilas(await ejecutar(supabase.from('categorias').select('*').order('id'))));

export function listarCatalogo({ busqueda = '', categoria = '', orden = 'recientes', limite = 0 } = {}) {
  const clave = `catalogo:${busqueda.trim().toLowerCase()}|${categoria}|${orden}|${limite}`;
  return enCache(clave, MINUTO, async () => {
    const [columna, asc] = ORDENES[orden] ?? ORDENES.recientes;
    let q = supabase.from('catalogo').select('*').order(columna, { ascending: asc });
    if (categoria) q = q.eq('categoria_slug', categoria);
    if (busqueda.trim()) q = q.ilike('nombre', `%${busqueda.trim()}%`);
    if (limite) q = q.limit(limite);
    return Producto.desdeFilas(await ejecutar(q));
  });
}

export const obtenerProducto = (id) =>
  enCache(`producto:${id}`, MINUTO, async () =>
    Producto.desdeFila(await ejecutar(supabase.from('catalogo').select('*').eq('id', id).single())));

export async function listarResenas(productoId) {
  const filas = await ejecutar(supabase
    .from('resenas')
    .select('*, autor:perfiles(nombre)')
    .eq('producto_id', productoId)
    .order('creado_en', { ascending: false }));
  return Resena.desdeFilas(filas);
}

export async function crearResena(resena) {
  Resena.validar(resena);
  await ejecutar(supabase.from('resenas').insert(resena));
  invalidarProductos(); // cambia el promedio de estrellas
}

/* ----- Panel del productor (siempre datos frescos) ----- */
export async function misProductos(productorId) {
  const filas = await ejecutar(supabase
    .from('productos')
    .select('*, categoria:categorias(nombre, icono)')
    .eq('productor_id', productorId)
    .order('creado_en', { ascending: false }));
  return Producto.desdeFilas(filas);
}

export const obtenerMiProducto = (id) =>
  ejecutar(supabase.from('productos').select('*').eq('id', id).single());

export async function guardarProducto({ id, ...campos }) {
  if ('nombre' in campos) Producto.validar(campos); // reglas de negocio del modelo
  await ejecutar(id
    ? supabase.from('productos').update(campos).eq('id', id)
    : supabase.from('productos').insert(campos));
  invalidarProductos();
}

export async function eliminarProducto(id) {
  await ejecutar(supabase.from('productos').delete().eq('id', id));
  invalidarProductos();
}

export async function subirImagen(userId, archivo) {
  const ext = archivo.name.split('.').pop();
  const ruta = `${userId}/${crypto.randomUUID()}.${ext}`;
  await ejecutar(supabase.storage.from('productos').upload(ruta, archivo));
  return supabase.storage.from('productos').getPublicUrl(ruta).data.publicUrl;
}
