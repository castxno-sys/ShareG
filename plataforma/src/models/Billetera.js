/**
 * Billetera de prueba de un usuario. Se arma con el resumen que calcula PostgreSQL
 * (`resumen_billetera`) y opcionalmente con su lista de Movimiento.
 */
export default class Billetera {
  static RECARGA_MIN = 1000;
  static RECARGA_MAX = 2_000_000;
  static MONTOS_RAPIDOS = [20_000, 50_000, 100_000, 200_000];

  constructor({ saldo = 0, recargado = 0, gastado = 0, recaudado = 0 } = {}, movimientos = []) {
    this.saldo = Number(saldo);
    this.recargado = Number(recargado);
    this.gastado = Number(gastado);
    this.recaudado = Number(recaudado);
    this.movimientos = movimientos; // Movimiento[]
  }

  static validarRecarga(monto) {
    const n = Number(monto);
    if (!Number.isFinite(n) || n < Billetera.RECARGA_MIN || n > Billetera.RECARGA_MAX) {
      throw new Error('La recarga debe estar entre $1.000 y $2.000.000');
    }
  }

  alcanzaPara(total) { return this.saldo >= total; }

  /** Lo que falta para pagar `total`, redondeado hacia arriba a miles (0 si alcanza). */
  faltaPara(total) {
    const falta = total - this.saldo;
    return falta <= 0 ? 0 : Math.max(Billetera.RECARGA_MIN, Math.ceil(falta / 1000) * 1000);
  }
}
