import Modelo from './Modelo.js';

/** Un movimiento de la billetera (tabla `movimientos`). Monto positivo = entra, negativo = sale. */
export default class Movimiento extends Modelo {
  static METODOS = ['Nequi', 'PSE', 'Tarjeta', 'Daviplata'];
  static TIPOS = {
    recarga: { etiqueta: 'Recarga de saldo', icono: 'wallet' },
    pago: { etiqueta: 'Pago de pedido', icono: 'cart' },
    reembolso: { etiqueta: 'Reembolso', icono: 'refresh' },
    cobro: { etiqueta: 'Venta cobrada', icono: 'coins' },
  };

  constructor({ id, usuario_id, tipo, monto, pedido_id = null, metodo = null, descripcion = '', creado_en }) {
    super(id);
    this.usuario_id = usuario_id;
    this.tipo = tipo;
    this.monto = Number(monto);
    this.pedido_id = pedido_id;
    this.metodo = metodo;
    this.descripcion = descripcion;
    this.creado_en = creado_en;
  }

  get esIngreso() { return this.monto > 0; }
  get etiqueta() { return Movimiento.TIPOS[this.tipo]?.etiqueta ?? this.tipo; }
  get icono() { return Movimiento.TIPOS[this.tipo]?.icono ?? 'coins'; }
  get codigoPedido() { return this.pedido_id ? `#${this.pedido_id.slice(0, 8).toUpperCase()}` : null; }
}
