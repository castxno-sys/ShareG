import { supabase } from '../lib/supabase.js';

export async function actualizarPerfil(id, campos) {
  const { error } = await supabase.from('perfiles').update(campos).eq('id', id);
  if (error) throw error;
}

export async function listarProductores() {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, vereda, descripcion, productos(count)')
    .eq('rol', 'productor')
    .order('creado_en');
  if (error) throw error;
  return data;
}
