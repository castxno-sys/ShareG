import Modelo from './Modelo.js';
import { cantidadUnidad } from '../utils/formato.js';

/** Producto publicado por un Productor (tabla `productos` / vista `catalogo`). */
export default class Producto extends Modelo {
  static UMBRAL_POCOS = 25;

  constructor(f) {
    super(f.id);
    this.nombre = f.nombre;
    this.descripcion = f.descripcion ?? '';
    this.precio = Number(f.precio);
    this.unidad = f.unidad;
    this.stock = Number(f.stock);
    this.imagen_url = f.imagen_url;
    this.activo = f.activo ?? true;
    this.creado_en = f.creado_en;
    this.productor_id = f.productor_id;
    this.productor_nombre = f.productor_nombre;
    this.productor_vereda = f.productor_vereda;
    this.categoria_id = f.categoria_id;
    // La categoría llega como texto (vista catalogo) o como objeto (join): se normaliza.
    const cat = typeof f.categoria === 'object' && f.categoria ? f.categoria : null;
    this.categoria = cat ? cat.nombre : f.categoria ?? null;
    this.categoria_icono = cat ? cat.icono : f.categoria_icono ?? null;
    this.categoria_slug = f.categoria_slug ?? null;
    this.calificacion = Number(f.calificacion ?? 0);
    this.num_resenas = Number(f.num_resenas ?? 0);
  }

  /** Reglas de negocio para crear/editar: lanza un error si algo no es válido. */
  static validar({ nombre, precio, stock }) {
    if (!nombre || nombre.trim().length < 2) throw new Error('El nombre debe tener al menos 2 letras');
    if (!(Number(precio) >= 0)) throw new Error('El precio no puede ser negativo');
    if (!(Number(stock) >= 0)) throw new Error('La cantidad disponible no puede ser negativa');
  }

  get agotado() { return this.stock <= 0; }
  get quedanPocos() { return !this.agotado && this.stock <= Producto.UMBRAL_POCOS; }
  get tieneResenas() { return this.num_resenas > 0; }
  get disponibleTexto() { return cantidadUnidad(this.stock, this.unidad); }

  esDe(usuarioId) { return !!usuarioId && this.productor_id === usuarioId; }
  precioPor(cantidad) { return this.precio * cantidad; }
}
