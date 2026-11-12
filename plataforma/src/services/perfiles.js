import { supabase, ejecutar } from '../lib/supabase.js';
import { enCache, MINUTO } from '../lib/cache.js';
import { Usuario } from '../models/index.js';

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
