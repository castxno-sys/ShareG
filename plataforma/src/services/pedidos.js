import { supabase, ejecutar } from '../lib/supabase.js';
import { Pedido } from '../models/index.js';
import { invalidarProductos } from './productos.js';

export async function crearPedido(items, direccion, notas) {
  const id = await ejecutar(supabase.rpc('crear_pedido', {
    p_items: items.map((i) => ({ producto_id: i.id, cantidad: i.cantidad })),
    p_direccion: direccion,
    p_notas: notas || null,
  }));
  invalidarProductos(); // cambió el stock
  return id;
}

export async function misPedidos(userId) {
  const filas = await ejecutar(supabase
    .from('pedidos')
    .select('*, items:pedido_items(*)')
    .eq('comprador_id', userId)
    .order('creado_en', { ascending: false }));
  return Pedido.desdeFilas(filas);
}

export async function pedidosRecibidos(productorId) {
  const filas = await ejecutar(supabase
    .from('pedido_items')
    .select('*, pedido:pedidos(id, estado, creado_en, direccion_entrega, notas, comprador:perfiles(nombre, telefono))')
    .eq('productor_id', productorId));
  return Pedido.agruparPorPedido(filas);
}

export async function actualizarEstado(pedidoId, estado) {
  await ejecutar(supabase.rpc('actualizar_estado_pedido', { p_pedido: pedidoId, p_estado: estado }));
  if (estado === 'cancelado') invalidarProductos(); // el stock vuelve al catálogo
}

export const resumenProductor = () => ejecutar(supabase.rpc('resumen_productor'));
