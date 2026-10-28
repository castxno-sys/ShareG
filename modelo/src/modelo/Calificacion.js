export class Calificacion {
  /**
   * @param {Number} puntaje  {1..5}
   * @param {String} comentario
   */
  constructor(puntaje, comentario = '') {
    if (!Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
      throw new RangeError('El puntaje debe ser un entero entre 1 y 5');
    }
    /** @type {Number} */ this.puntaje = puntaje;
    /** @type {String} */ this.comentario = comentario;
    /** @type {Date}   */ this.fecha = new Date();
  }
}
