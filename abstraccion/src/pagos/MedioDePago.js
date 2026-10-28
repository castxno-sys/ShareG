/**
 * ABSTRACCIÓN
 * MedioDePago define QUÉ hace cualquier medio de pago (pagar),
 * pero no CÓMO lo hace. Cada medio concreto decide los detalles.
 */
export class MedioDePago {
  /** @type {Number} */ #pagosRealizados = 0;

  /** @param {String} titular */
  constructor(titular) {
    // No se puede crear un "medio de pago" genérico: es un concepto abstracto
    if (new.target === MedioDePago) {
      throw new TypeError('MedioDePago es abstracta: use PagoNequi, PagoPSE o PagoEfectivo');
    }
    /** @type {String} */ this.titular = titular;
  }

  // ---------- Métodos ABSTRACTOS (la subclase DEBE implementarlos) ----------

  /** @returns {String} */
  getNombre() {
    throw new Error(`${this.constructor.name} debe implementar getNombre()`);
  }

  /** @param {Number} valor @returns {Number} comisión en pesos */
  calcularComision(valor) {
    throw new Error(`${this.constructor.name} debe implementar calcularComision()`);
  }

  /** @param {Number} valor @returns {Boolean} */
  procesar(valor) {
    throw new Error(`${this.constructor.name} debe implementar procesar()`);
  }

  // ---------- Método CONCRETO (interfaz pública, igual para todos) ----------

  /**
   * Quien paga solo llama a pagar(valor); no necesita saber
   * cómo funciona Nequi, PSE o el efectivo por dentro.
   * @param {Number} valor
   * @returns {{medio: String, valor: Number, comision: Number, total: Number, aprobado: Boolean}}
   */
  pagar(valor) {
    if (valor <= 0) throw new RangeError('El valor debe ser mayor que cero');
    const comision = this.calcularComision(valor);
    const total = valor + comision;
    const aprobado = this.procesar(total);
    if (aprobado) this.#pagosRealizados += 1;
    return { medio: this.getNombre(), valor, comision, total, aprobado };
  }

  /** @returns {Number} */
  get pagosRealizados() {
    return this.#pagosRealizados;
  }
}
