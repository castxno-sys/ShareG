import { Usuario } from './Usuario.js';
import { Pedido } from './Pedido.js';
import { Pago } from './Pago.js';
import { Calificacion } from './Calificacion.js';
import { TipoComprador, EstadoPedido } from './enums.js';

/** Comprador (persona o negocio). Hereda de Usuario. */
export class Comprador extends Usuario {
  /**
   * @param {String} nombre
   * @param {String} correo
   * @param {String} telefono
   * @param {String} contrasena
   * @param {String} tipo  TipoComprador
   * @param {String} direccion
   */
  constructor(nombre, correo, telefono, contrasena, tipo = TipoComprador.PERSONA, direccion = '') {
    super(nombre, correo, telefono, contrasena);
    /** @type {String}   */ this.tipo = tipo;
    /** @type {String}   */ this.direccion = direccion;
    /** @type {Pedido[]} */ this.pedidos = []; // Comprador 1 —— 0..* Pedido
  }

  getRol() { return 'COMPRADOR'; }

  /** @returns {Pedido} */
  crearPedido() {
    const pedido = new Pedido(this);
    this.pedidos.push(pedido);
    return pedido;
  }

  /** @returns {Pago} */
  pagar(pedido, metodo) {
    if (pedido.estado !== EstadoPedido.ACEPTADO) {
      throw new Error('Solo se pueden pagar pedidos aceptados por el productor');
    }
    const pago = new Pago(metodo, pedido.calcularTotal());
    if (pago.procesar()) {
      pedido.pago = pago;
      pedido.cambiarEstado(EstadoPedido.PAGADO);
    }
    return pago;
  }

  /** RN4: solo se califica después de recibir el pedido. @returns {Calificacion} */
  calificar(pedido, puntaje, comentario) {
    if (pedido.estado !== EstadoPedido.ENTREGADO) {
      throw new Error('Solo se puede calificar un pedido entregado');
    }
    const calificacion = new Calificacion(puntaje, comentario);
    pedido.calificacion = calificacion;
    pedido.cambiarEstado(EstadoPedido.CALIFICADO);
    return calificacion;
  }
}
