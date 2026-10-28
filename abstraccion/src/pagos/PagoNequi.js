import { MedioDePago } from './MedioDePago.js';

export class PagoNequi extends MedioDePago {
  /** @param {String} titular @param {String} celular */
  constructor(titular, celular) {
    super(titular);
    /** @type {String} */ this.celular = celular;
  }

  getNombre() { return 'Nequi'; }

  /** Nequi no cobra comisión */
  calcularComision(valor) { return 0; }

  /** Detalle oculto: valida el celular y simula la notificación push */
  procesar(total) {
    const celularValido = /^3\d{9}$/.test(this.celular);
    if (celularValido) console.log(`   📱 Notificación enviada al ${this.celular}`);
    return celularValido;
  }
}
