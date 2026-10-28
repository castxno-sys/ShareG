import { MedioDePago } from './MedioDePago.js';

export class PagoEfectivo extends MedioDePago {
  /** @param {String} titular @param {Number} montoEntregado */
  constructor(titular, montoEntregado) {
    super(titular);
    /** @type {Number} */ this.montoEntregado = montoEntregado;
    /** @type {Number} */ this.cambio = 0;
  }

  getNombre() { return 'Efectivo contra entrega'; }

  /** Recargo fijo por recaudo del transportador */
  calcularComision(valor) { return 2000; }

  /** Detalle oculto: calcula el cambio */
  procesar(total) {
    if (this.montoEntregado < total) return false;
    this.cambio = this.montoEntregado - total;
    console.log(`   💵 Cambio a devolver: ${this.cambio}`);
    return true;
  }
}
