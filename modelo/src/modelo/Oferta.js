import { generarId } from './utils.js';
import { EstadoOferta } from './enums.js';

export class Oferta {
  /**
   * RN2: toda oferta indica producto, cantidad, unidad, precio y fecha.
   * @param {import('./Productor.js').Productor} productor
   * @param {import('./Producto.js').Producto}   producto
   * @param {Number} cantidadDisponible
   * @param {String} unidad          Unidad
   * @param {Number} precioUnitario
   * @param {Date}   fechaDisponible
   */
  constructor(productor, producto, cantidadDisponible, unidad, precioUnitario, fechaDisponible = new Date()) {
    if (cantidadDisponible <= 0 || precioUnitario <= 0) {
      throw new Error('Cantidad y precio deben ser mayores que cero');
    }
    /** @type {String} */ this.id = generarId('OFR');
    this.productor = productor;          // Oferta 0..* —— 1 Productor
    this.producto = producto;            // Oferta 0..* —— 1 Producto
    /** @type {Number} */ this.cantidadDisponible = cantidadDisponible;
    /** @type {String} */ this.unidad = unidad;
    /** @type {Number} */ this.precioUnitario = precioUnitario;
    /** @type {Date}   */ this.fechaDisponible = fechaDisponible;
    /** @type {String} */ this.estado = EstadoOferta.ACTIVA;
    /** @type {Number} */ this.totalVendido = 0;
  }

  /** RN3: un pedido no puede superar la cantidad disponible. */
  reservar(cantidad) {
    if (this.estado !== EstadoOferta.ACTIVA) {
      throw new Error(`La oferta ${this.id} no está activa`);
    }
    if (cantidad > this.cantidadDisponible) {
      throw new Error(
        `Stock insuficiente de ${this.producto.nombre}: disponible ${this.cantidadDisponible} ${this.unidad}`
      );
    }
    this.cantidadDisponible -= cantidad;
    this.totalVendido += cantidad * this.precioUnitario;
    if (this.cantidadDisponible === 0) this.estado = EstadoOferta.AGOTADA;
  }

  /** Devuelve stock cuando se cancela un pedido. */
  liberar(cantidad) {
    this.cantidadDisponible += cantidad;
    this.totalVendido -= cantidad * this.precioUnitario;
    if (this.estado === EstadoOferta.AGOTADA) this.estado = EstadoOferta.ACTIVA;
  }

  /** @param {Date} hoy @returns {Boolean} */
  estaVigente(hoy = new Date()) {
    const limite = new Date(this.fechaDisponible);
    limite.setDate(limite.getDate() + this.producto.diasVigenciaOferta());
    const vigente = hoy <= limite;
    if (!vigente && this.estado === EstadoOferta.ACTIVA) this.estado = EstadoOferta.VENCIDA;
    return vigente;
  }

  cerrar() {
    this.estado = EstadoOferta.VENCIDA;
  }
}
