// Enumeraciones del dominio share.G (congeladas para que no se modifiquen)

export const Categoria = Object.freeze({
  AGRICOLA: 'AGRICOLA',
  PECUARIO: 'PECUARIO',
  TRANSFORMADO: 'TRANSFORMADO',
});

export const Unidad = Object.freeze({
  KG: 'KG',
  BULTO: 'BULTO',
  CANASTILLA: 'CANASTILLA',
  LITRO: 'LITRO',
  UNIDAD: 'UNIDAD',
});

export const EstadoOferta = Object.freeze({
  ACTIVA: 'ACTIVA',
  AGOTADA: 'AGOTADA',
  VENCIDA: 'VENCIDA',
});

export const EstadoPedido = Object.freeze({
  CREADO: 'CREADO',
  ACEPTADO: 'ACEPTADO',
  PAGADO: 'PAGADO',
  EN_ENTREGA: 'EN_ENTREGA',
  ENTREGADO: 'ENTREGADO',
  CALIFICADO: 'CALIFICADO',
  CANCELADO: 'CANCELADO',
});

export const TipoComprador = Object.freeze({
  PERSONA: 'PERSONA',
  NEGOCIO: 'NEGOCIO',
});

export const MetodoPago = Object.freeze({
  EFECTIVO: 'EFECTIVO',
  PSE: 'PSE',
  NEQUI: 'NEQUI',
  TARJETA: 'TARJETA',
});
