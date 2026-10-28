import { generarId } from './utils.js';
import { Categoria } from './enums.js';

export class Producto {
  /**
   * @param {String}  nombre
   * @param {String}  categoria   Categoria
   * @param {Boolean} perecedero
   * @param {String}  descripcion
   */
  constructor(nombre, categoria = Categoria.AGRICOLA, perecedero = false, descripcion = '') {
    /** @type {String}  */ this.id = generarId('PRD');
    /** @type {String}  */ this.nombre = nombre;
    /** @type {String}  */ this.categoria = categoria;
    /** @type {Boolean} */ this.perecedero = perecedero;
    /** @type {String}  */ this.descripcion = descripcion;
  }

  /** RN5: los perecederos (fresa, uchuva) tienen vigencia corta. @returns {Number} */
  diasVigenciaOferta() {
    return this.perecedero ? 3 : 15;
  }
}
