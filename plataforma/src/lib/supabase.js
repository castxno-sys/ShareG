import { createClient } from '@supabase/supabase-js';

// Valores del proyecto Supabase "shareg". La clave publicable es segura en el navegador:
// la protección real de los datos la hacen las políticas RLS de PostgreSQL.
// Si creas un archivo .env (copiando .env.example), esos valores tienen prioridad.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://alhgprlridksuvhhygxq.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hgFbSPRbqJI7SYwFNFQAPQ_HTtLWswg';

export const supabase = createClient(url, key);

/** Ejecuta una consulta de Supabase y devuelve `data`, o lanza el error. */
export async function ejecutar(consulta) {
  const { data, error } = await consulta;
  if (error) throw error;
  return data;
}
