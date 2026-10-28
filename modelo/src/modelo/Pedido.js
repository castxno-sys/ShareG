import { generarId } from './utils.js';
import { DetallePedido } from './DetallePedido.js';
import { Entrega } from './Entrega.js';
import { EstadoPedido } from './enums.js';

/** Transiciones válidas de la máquina de estados del pedido */
const TRANSICIONES = {
  CREADO: ['ACEPTADO', 'CANCELADO'],
  ACEPTADO: ['PAGADO', 'CANCELADO'],
  PAGADO: ['EN_ENTREGA'],
  EN_ENTREGA: ['ENTREGADO'],
  ENTREGADO: ['CALIFICADO'],
  CALIFICADO: [],
  CANCELADO: [],
};

export class Pedido {
  /** @param {import('./Comprador.js').Comprador} comprador */
  constructor(comprador) {
    /** @type {String} */ this.id = generarId('PED');
    this.comprador = comprador;
    /** @type {Date}            */ this.fecha = new Date();
    /** @type {DetallePedido[]} */ this.detalles = [];      // composición 1..*
    /** @type {String}          */ this.estado = EstadoPedido.CREADO;
    /** @type {import('./Pago.js').Pago|null}                 */ this.pago = null;          // 0..1
    /** @type {Entrega|null}                                  */ this.entrega = null;       // 0..1
    /** @type {import('./Calificacion.js').Calificacion|null} */ this.calificacion = null;  // 0..1
  }

  agregarDetalle(oferta, cantidad) {
    if (this.estado !== EstadoPedido.CREADO) {
      throw new Error('Solo se agregan productos a un pedido recién creado');
    }
    oferta.reservar(cantidad); // valida RN3
    this.detalles.push(new DetallePedido(oferta, cantidad));
  }

  /** @returns {Number} */
  calcularTotal() {
    return this.detalles.reduce((total, d) => total + d.calcularSubtotal(), 0);
  }

  cambiarEstado(nuevo) {
    if (!TRANSICIONES[this.estado].includes(nuevo)) {
      throw new Error(`Transición inválida: ${this.estado} → ${nuevo}`);
    }
    this.estado = nuevo;
  }

  /** Programa la entrega (composición Pedido ◆— Entrega) */
  programarEntrega(direccion, fechaProgramada, transportador) {
    this.entrega = new Entrega(direccion, fechaProgramada, transportador);
    this.cambiarEstado(EstadoPedido.EN_ENTREGA);
    return this.entrega;
  }

  confirmarEntrega() {
    this.entrega.confirmarEntrega();
    this.cambiarEstado(EstadoPedido.ENTREGADO);
  }

  cancelar() {
    this.cambiarEstado(EstadoPedido.CANCELADO);
    this.detalles.forEach(d => d.oferta.liberar(d.cantidad));
  }
}
