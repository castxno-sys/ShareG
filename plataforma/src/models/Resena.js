import Modelo from './Modelo.js';

export default class Resena extends Modelo {
  constructor({ id, producto_id, autor_id, calificacion, comentario = '', creado_en, autor = null }) {
    super(id);
    Resena.validar({ calificacion });
    this.producto_id = producto_id;
    this.autor_id = autor_id;
    this.calificacion = Number(calificacion);
    this.comentario = comentario;
    this.creado_en = creado_en;
    this.autor = autor; // { nombre }
  }

  static validar({ calificacion }) {
    const n = Number(calificacion);
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new Error('La calificación debe ser de 1 a 5 estrellas');
  }

  get autorNombre() { return this.autor?.nombre ?? 'Anónimo'; }
  esDe(usuarioId) { return this.autor_id === usuarioId; }
}
