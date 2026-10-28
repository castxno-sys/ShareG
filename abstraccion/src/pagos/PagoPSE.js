import { MedioDePago } from './MedioDePago.js';

export class PagoPSE extends MedioDePago {
  /** @param {String} titular @param {String} banco @param {Number} saldo */
  constructor(titular, banco, saldo) {
    super(titular);
    /** @type {String} */ this.banco = banco;
    /** @type {Number} */ this.saldo = saldo;
  }

  getNombre() { return `PSE (${this.banco})`; }

  /** PSE cobra 1,5 % de comisión */
  calcularComision(valor) { return Math.round(valor * 0.015); }

  /** Detalle oculto: verifica saldo y descuenta en el banco */
  procesar(total) {
    if (total > this.saldo) return false;
    this.saldo -= total;
    console.log(`   🏦 Débito en ${this.banco}. Saldo restante: ${this.saldo}`);
    return true;
  }
}
