import { supabase } from '../lib/supabase.js';
import { Pedido } from '../models/index.js';

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
  return Pedido.desdeFilas(data);
}

export async function pedidosRecibidos(productorId) {
  const { data, error } = await supabase
    .from('pedido_items')
    .select('*, pedido:pedidos(id, estado, creado_en, direccion_entrega, notas, comprador:perfiles(nombre, telefono))')
    .eq('productor_id', productorId)
    .order('pedido_id');
  if (error) throw error;
  return Pedido.agruparPorPedido(data);
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
