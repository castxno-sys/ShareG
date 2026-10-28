import { generarId } from './utils.js';

export class Pago {
  /**
   * @param {String} metodo  MetodoPago
   * @param {Number} valor
   */
  constructor(metodo, valor) {
    /** @type {String}  */ this.id = generarId('PAG');
    /** @type {String}  */ this.metodo = metodo;
    /** @type {Number}  */ this.valor = valor;
    /** @type {Date}    */ this.fecha = new Date();
    /** @type {Boolean} */ this.aprobado = false;
  }

  /** Simula la pasarela de pago. @returns {Boolean} */
  procesar() {
    this.aprobado = this.valor > 0;
    return this.aprobado;
  }
}
