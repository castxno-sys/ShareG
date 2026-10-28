import { generarId } from './utils.js';

/**
 * Clase abstracta Usuario.
 * Atributos protegidos (#) en el diagrama → propiedades con prefijo _ en JS.
 */
export class Usuario {
  /**
   * @param {String} nombre
   * @param {String} correo
   * @param {String} telefono
   * @param {String} contrasena
   */
  constructor(nombre, correo, telefono, contrasena) {
    if (new.target === Usuario) {
      throw new TypeError('Usuario es abstracta: use Productor, Comprador o Administrador');
    }
    /** @type {String} */ this._id = generarId('USR');
    /** @type {String} */ this._nombre = nombre;
    /** @type {String} */ this._correo = correo;
    /** @type {String} */ this._telefono = telefono;
    /** @type {String} */ this._contrasena = contrasena;
    /** @type {Date}   */ this._fechaRegistro = new Date();
  }

  get id() { return this._id; }
  get nombre() { return this._nombre; }
  get correo() { return this._correo; }

  /** @returns {Boolean} */
  iniciarSesion(correo, clave) {
    return this._correo === correo && this._contrasena === clave;
  }

  /** @param {Object} datos */
  actualizarPerfil(datos) {
    if (datos.nombre) this._nombre = datos.nombre;
    if (datos.telefono) this._telefono = datos.telefono;
    if (datos.correo) this._correo = datos.correo;
  }

  /** @returns {String} — método abstracto */
  getRol() {
    throw new Error('getRol() debe implementarse en la subclase');
  }
}
