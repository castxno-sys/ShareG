import Modelo from './Modelo.js';

/**
 * Usuario de la plataforma (tabla `perfiles`). Clase abstracta:
 * en ejecución siempre es un Productor o un Comprador.
 */
export class Usuario extends Modelo {
  constructor({ id, nombre = '', rol, telefono = null, vereda = null, sector = null, descripcion = null, productos } = {}) {
    super(id);
    if (new.target === Usuario) throw new Error('Usuario es abstracta: usa Productor o Comprador');
    this.nombre = nombre;
    this.rol = rol;
    this.telefono = telefono;
    this.vereda = vereda;
    this.sector = sector;
    this.descripcion = descripcion;
    this.totalProductos = productos?.[0]?.count ?? 0; // viene de `productos(count)`
  }

  /** Fábrica polimórfica: según el rol devuelve la subclase correcta. */
  static desdeFila(fila) {
    if (!fila) return null;
    return fila.rol === 'productor' || fila.rol === 'admin' ? new Productor(fila) : new Comprador(fila);
  }

  get inicial() {
    return (this.nombre || '?').trim()[0].toUpperCase();
  }

  get primerNombre() {
    return this.nombre.split(' ')[0];
  }

  // Métodos que cada subclase sobrescribe (polimorfismo)
  get esProductor() { return false; }
  get etiquetaRol() { return 'Usuario'; }
  puedeComprar(producto) { return producto.productor_id !== this.id; }
}

export class Productor extends Usuario {
  get esProductor() { return true; }
  get etiquetaRol() { return 'Productor'; }
  puedeEditar(producto) { return producto.productor_id === this.id; }
}

export class Comprador extends Usuario {
  get etiquetaRol() { return 'Comprador'; }
}
