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

export const SIGUIENTE_ESTADO = { pendiente: 'confirmado', confirmado: 'enviado', enviado: 'entregado' };

export const UNIDADES = ['kg', 'libra', 'unidad', 'litro', 'caja', 'frasco', 'bulto', 'docena'];

const PLURALES = { kg: 'kg', libra: 'libras', unidad: 'unidades', litro: 'litros', caja: 'cajas', frasco: 'frascos', bulto: 'bultos', docena: 'docenas' };
export const cantidadUnidad = (n, unidad) => {
  const num = Number(n);
  return `${num.toLocaleString('es-CO')} ${num === 1 ? unidad : PLURALES[unidad] ?? unidad}`;
};

export const IMG_DEFECTO = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=80&auto=format&fit=crop';
