import { supabase } from '../lib/supabase.js';

export async function crearPedido(items, direccion, notas) {
  const payload = items.map((i) => ({ producto_id: i.id, cantidad: i.cantidad }));
  const { data, error } = await supabase.rpc('crear_pedido', {
    p_items: payload, p_direccion: direccion, p_notas: notas || null,
  });
  if (error) throw error;
  return data;
}

export async function misPedidos(userId) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, items:pedido_items(*)')
    .eq('comprador_id', userId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
}

export async function pedidosRecibidos(productorId) {
  const { data, error } = await supabase
    .from('pedido_items')
    .select('*, pedido:pedidos(id, estado, creado_en, direccion_entrega, notas, comprador:perfiles(nombre, telefono))')
    .eq('productor_id', productorId)
    .order('pedido_id');
  if (error) throw error;
  // agrupar ítems por pedido
  const mapa = new Map();
  for (const it of data) {
    const p = it.pedido;
    if (!mapa.has(p.id)) mapa.set(p.id, { ...p, items: [], total: 0 });
    const g = mapa.get(p.id);
    g.items.push(it);
    g.total += Number(it.subtotal);
  }
  return [...mapa.values()].sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
}

export async function actualizarEstado(pedidoId, estado) {
  const { error } = await supabase.rpc('actualizar_estado_pedido', { p_pedido: pedidoId, p_estado: estado });
  if (error) throw error;
}

export async function resumenProductor() {
  const { data, error } = await supabase.rpc('resumen_productor');
  if (error) throw error;
  return data;
}
