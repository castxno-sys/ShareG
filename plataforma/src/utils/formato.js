export const pesos = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const fecha = (d) =>
  new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'badge--amarillo' },
  confirmado: { label: 'Confirmado', clase: 'badge--azul' },
  enviado: { label: 'Enviado', clase: 'badge--morado' },
  entregado: { label: 'Entregado', clase: 'badge--verde' },
  cancelado: { label: 'Cancelado', clase: 'badge--rojo' },
};

export const UNIDADES = ['kg', 'libra', 'unidad', 'litro', 'caja', 'frasco', 'bulto', 'docena'];

const PLURALES = { kg: 'kg', libra: 'libras', unidad: 'unidades', litro: 'litros', caja: 'cajas', frasco: 'frascos', bulto: 'bultos', docena: 'docenas' };
export const cantidadUnidad = (n, unidad) => {
  const num = Number(n);
  return `${num.toLocaleString('es-CO')} ${num === 1 ? unidad : PLURALES[unidad] ?? unidad}`;
};


export const IMG_DEFECTO = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&q=80&auto=format&fit=crop';

/** Pide a Unsplash la foto al ancho exacto que se va a mostrar (otras URLs quedan igual). */
export function imagen(url, ancho) {
  const u = url || IMG_DEFECTO;
  if (!u.includes('images.unsplash.com')) return u;
  const x = new URL(u);
  x.searchParams.set('w', ancho);
  x.searchParams.set('q', '75');
  x.searchParams.set('auto', 'format');
  x.searchParams.set('fit', 'crop');
  return x.toString();
}

/** srcset con varios anchos para que el navegador elija según la pantalla. */
export const srcset = (url, anchos) => anchos.map((w) => `${imagen(url, w)} ${w}w`).join(', ');

/** "hoy", "ayer", "hace 3 días", "hace 2 semanas"… */
export function haceCuanto(d) {
  const dias = Math.floor((Date.now() - new Date(d)) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 14) return `hace ${dias} días`;
  if (dias < 60) return `hace ${Math.floor(dias / 7)} semanas`;
  return `hace ${Math.floor(dias / 30)} meses`;
}

export const VEREDAS = ['La Trinidad', 'San Francisco', 'Siecha', 'Santa Bárbara', 'Mariano Ospina', 'Otra vereda de Guasca'];

