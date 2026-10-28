import { Usuario } from './Usuario.js';
import { Oferta } from './Oferta.js';
import { EstadoPedido } from './enums.js';

/** Productor rural de la vereda. Hereda de Usuario. */
export class Productor extends Usuario {
  /**
   * @param {String} nombre
   * @param {String} correo
   * @param {String} telefono
   * @param {String} contrasena
   * @param {String} vereda
   * @param {String} sector
   */
  constructor(nombre, correo, telefono, contrasena, vereda, sector) {
    super(nombre, correo, telefono, contrasena);
    /** @type {String}   */ this.vereda = vereda;
    /** @type {String}   */ this.sector = sector;
    /** @type {Boolean}  */ this.verificado = false;
    /** @type {Oferta[]} */ this.ofertas = []; // Productor 1 —— 0..* Oferta
  }

  getRol() { return 'PRODUCTOR'; }

  /**
   * RN1: solo un productor verificado puede publicar.
   * @returns {Oferta}
   */
  publicarOferta(producto, cantidad, unidad, precio, fecha) {
    if (!this.verificado) {
      throw new Error(`El productor ${this.nombre} aún no está verificado`);
    }
    const oferta = new Oferta(this, producto, cantidad, unidad, precio, fecha);
    this.ofertas.push(oferta);
    return oferta;
  }

  /** @param {import('./Pedido.js').Pedido} pedido */
  aceptarPedido(pedido) {
    pedido.cambiarEstado(EstadoPedido.ACEPTADO);
  }

  /** @param {import('./Pedido.js').Pedido} pedido */
  rechazarPedido(pedido) {
    pedido.cancelar();
  }

  /** Suma lo vendido en pedidos pagados o posteriores. @returns {Number} */
  calcularVentas() {
    return this.ofertas.reduce((total, o) => total + o.totalVendido, 0);
  }
}
