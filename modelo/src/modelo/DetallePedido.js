export class DetallePedido {
  /**
   * @param {import('./Oferta.js').Oferta} oferta  DetallePedido 0..* —— 1 Oferta
   * @param {Number} cantidad
   */
  constructor(oferta, cantidad) {
    this.oferta = oferta;
    /** @type {Number} */ this.cantidad = cantidad;
    /** @type {Number} */ this.precioUnitario = oferta.precioUnitario; // precio congelado
  }

  /** @returns {Number} */
  calcularSubtotal() {
    return this.cantidad * this.precioUnitario;
  }
}
