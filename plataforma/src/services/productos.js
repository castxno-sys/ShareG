import { supabase } from '../lib/supabase.js';

export async function listarCategorias() {
  const { data, error } = await supabase.from('categorias').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function listarCatalogo({ busqueda = '', categoria = '', orden = 'recientes' } = {}) {
  let q = supabase.from('catalogo').select('*');
  if (categoria) q = q.eq('categoria_slug', categoria);
  if (busqueda) q = q.ilike('nombre', `%${busqueda}%`);
  if (orden === 'precio_asc') q = q.order('precio', { ascending: true });
  else if (orden === 'precio_desc') q = q.order('precio', { ascending: false });
  else if (orden === 'mejor') q = q.order('calificacion', { ascending: false });
  else q = q.order('creado_en', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function obtenerProducto(id) {
  const { data, error } = await supabase.from('catalogo').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function listarResenas(productoId) {
  const { data, error } = await supabase
    .from('resenas')
    .select('*, autor:perfiles(nombre)')
    .eq('producto_id', productoId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

export async function crearResena(resena) {
  const { error } = await supabase.from('resenas').insert(resena);
  if (error) throw error;
}

/* ----- Panel del productor ----- */
export async function misProductos(productorId) {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(nombre, icono)')
    .eq('productor_id', productorId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

export async function obtenerMiProducto(id) {
  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function guardarProducto(producto) {
  const { id, ...campos } = producto;
  const q = id
    ? supabase.from('productos').update(campos).eq('id', id)
    : supabase.from('productos').insert(campos);
  const { error } = await q;
  if (error) throw error;
}

export async function eliminarProducto(id) {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
}

export async function subirImagen(userId, archivo) {
  const ext = archivo.name.split('.').pop();
  const ruta = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('productos').upload(ruta, archivo);
  if (error) throw error;
  return supabase.storage.from('productos').getPublicUrl(ruta).data.publicUrl;
}
