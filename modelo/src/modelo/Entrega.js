import { generarId } from './utils.js';

export class Entrega {
  /**
   * @param {String} direccion
   * @param {Date}   fechaProgramada
   * @param {String} transportador
   */
  constructor(direccion, fechaProgramada, transportador) {
    /** @type {String}  */ this.id = generarId('ENT');
    /** @type {String}  */ this.direccion = direccion;
    /** @type {Date}    */ this.fechaProgramada = fechaProgramada;
    /** @type {String}  */ this.transportador = transportador;
    /** @type {Boolean} */ this.entregada = false;
  }

  confirmarEntrega() {
    this.entregada = true;
  }
}
