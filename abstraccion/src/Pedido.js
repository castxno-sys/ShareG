import { MedioDePago } from './pagos/MedioDePago.js';

/**
 * Pedido trabaja con la ABSTRACCIÓN MedioDePago,
 * nunca con Nequi, PSE o Efectivo directamente.
 */
export class Pedido {
  /** @param {String} comprador */
  constructor(comprador) {
    /** @type {String} */ this.comprador = comprador;
    /** @type {{producto: String, cantidad: Number, precio: Number}[]} */
    this.items = [];
    /** @type {Boolean} */ this.pagado = false;
  }

  /** @param {String} producto @param {Number} cantidad @param {Number} precio */
  agregarItem(producto, cantidad, precio) {
    this.items.push({ producto, cantidad, precio });
  }

  /** @returns {Number} */
  calcularTotal() {
    return this.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  }

  /** @param {MedioDePago} medio */
  pagarCon(medio) {
    if (!(medio instanceof MedioDePago)) {
      throw new TypeError('Se requiere un MedioDePago');
    }
    const recibo = medio.pagar(this.calcularTotal());
    this.pagado = recibo.aprobado;
    return recibo;
  }
}
