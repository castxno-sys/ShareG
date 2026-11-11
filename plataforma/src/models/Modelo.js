/**
 * Clase base ABSTRACTA de todos los modelos del dominio de Share.G.
 * - No se puede instanciar directamente (abstracción).
 * - Define la fábrica `desdeFila`, que cada subclase hereda o sobrescribe (polimorfismo).
 */
export default class Modelo {
  constructor(id) {
    if (new.target === Modelo) throw new Error('Modelo es abstracta: usa una subclase');
    this.id = id;
  }

  /** Convierte una fila de Supabase (PostgreSQL) en una instancia de la clase que la llama. */
  static desdeFila(fila) {
    return fila ? new this(fila) : null;
  }

  static desdeFilas(filas = []) {
    return filas.map((f) => this.desdeFila(f));
  }
}
