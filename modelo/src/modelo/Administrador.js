import { Usuario } from './Usuario.js';

/** Administrador de la plataforma. Hereda de Usuario. */
export class Administrador extends Usuario {
  constructor(nombre, correo, telefono, contrasena, nivelAcceso = 1) {
    super(nombre, correo, telefono, contrasena);
    /** @type {Number} */ this.nivelAcceso = nivelAcceso;
  }

  getRol() { return 'ADMIN'; }

  /** Dependencia «verifica» → Productor */
  verificarProductor(productor) {
    productor.verificado = true;
  }

  /** @param {import('./PlataformaShareG.js').PlataformaShareG} plataforma @returns {Object} */
  generarReporte(plataforma) {
    return {
      usuarios: plataforma.usuarios.length,
      ofertasActivas: plataforma.ofertas.filter(o => o.estado === 'ACTIVA').length,
      pedidos: plataforma.pedidos.length,
      ventasTotales: plataforma.pedidos
        .filter(p => p.pago && p.pago.aprobado)
        .reduce((s, p) => s + p.pago.valor, 0),
    };
  }
}
