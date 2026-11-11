import Modelo from './Modelo.js';

/** Línea de un pedido: un producto, su cantidad y el precio al momento de comprar. */
export default class PedidoItem extends Modelo {
  constructor({ id, pedido_id, producto_id, productor_id, nombre_producto, cantidad, precio_unitario, subtotal }) {
    super(id);
    this.pedido_id = pedido_id;
    this.producto_id = producto_id;
    this.productor_id = productor_id;
    this.nombre_producto = nombre_producto;
    this.cantidad = Number(cantidad);
    this.precio_unitario = Number(precio_unitario);
    this.subtotal = subtotal != null ? Number(subtotal) : this.cantidad * this.precio_unitario;
  }
}
