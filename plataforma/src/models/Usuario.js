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
    return (this.nombre || '?').trim()[0]?.toUpperCase() ?? '?';
  }

  get primerNombre() {
    return this.nombreVisible.split(' ')[0];
  }

  /** Nombre con mayúscula inicial en cada palabra ("tomas garcia" → "Tomas Garcia"). */
  get nombreVisible() {
    return this.nombre.trim().toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
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
  static DIAS_NUEVO = 7;

  constructor(fila = {}) {
    super(fila);
    // Actividad (viene de la función nuevos_compradores, vista del productor)
    this.creado_en = fila.creado_en ?? null;
    this.pedidos = Number(fila.pedidos ?? 0);
    this.comprasConmigo = Number(fila.compras_conmigo ?? 0);
    this.totalConmigo = Number(fila.total_conmigo ?? 0);
    this.ultimaCompra = fila.ultima_compra ?? null;
  }

  get etiquetaRol() { return 'Comprador'; }
  /** Se registró hace 7 días o menos. */
  get esNuevo() {
    return !!this.creado_en && Date.now() - new Date(this.creado_en) <= Comprador.DIAS_NUEVO * 86_400_000;
  }
  get teHaComprado() { return this.comprasConmigo > 0; }
}
