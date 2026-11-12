import Modelo from './Modelo.js';
import PedidoItem from './PedidoItem.js';

/** Pedido de un Comprador. Se compone de varios PedidoItem (composición). */
export default class Pedido extends Modelo {
  static FLUJO = ['pendiente', 'confirmado', 'enviado', 'entregado'];

  constructor({ id, estado, total, direccion_entrega, notas, creado_en, comprador = null, items = [] }) {
    super(id);
    this.estado = estado;
    this.direccion_entrega = direccion_entrega;
    this.notas = notas;
    this.creado_en = creado_en;
    this.comprador = comprador; // { nombre, telefono } cuando lo ve el productor
    this.items = PedidoItem.desdeFilas(items);
    this.total = total != null ? Number(total) : this.calcularTotal();
  }

  /** Agrupa las filas de `pedido_items` (vista del productor) en objetos Pedido. */
  static agruparPorPedido(filas = []) {
    const mapa = new Map();
    for (const fila of filas) {
      const { pedido, ...item } = fila;
      if (!mapa.has(pedido.id)) mapa.set(pedido.id, { ...pedido, items: [] });
      mapa.get(pedido.id).items.push(item);
    }
    return [...mapa.values()]
      .map((p) => new Pedido({ ...p, total: null }))
      .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
  }

  calcularTotal() {
    return this.items.reduce((s, i) => s + i.subtotal, 0);
  }

  get codigo() { return `#${this.id.slice(0, 8).toUpperCase()}`; }
  get cancelado() { return this.estado === 'cancelado'; }
  get cerrado() { return this.cancelado || this.estado === 'entregado'; }

  /** Estado al que avanza (o null si ya terminó). */
  get siguienteEstado() {
    if (this.cancelado) return null;
    return Pedido.FLUJO[Pedido.FLUJO.indexOf(this.estado) + 1] ?? null;
  }

  /** Cómo quedó el dinero del pedido. */
  get estadoPago() { return this.cancelado ? 'Reembolsado a tu saldo' : 'Pagado con saldo'; }

  /** El comprador solo puede cancelar mientras el productor no lo haya confirmado. */
  get puedeCancelarComprador() { return this.estado === 'pendiente'; }
}
