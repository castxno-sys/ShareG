import Modelo from './Modelo.js';

export default class Categoria extends Modelo {
  constructor({ id, nombre, slug, icono = '🌱' }) {
    super(id);
    this.nombre = nombre;
    this.slug = slug;
    this.icono = icono;
  }

  get etiqueta() {
    return `${this.icono} ${this.nombre}`;
  }
}
