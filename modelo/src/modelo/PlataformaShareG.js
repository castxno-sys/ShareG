/** Clase contenedora: agrega usuarios, productos, ofertas y pedidos. */
export class PlataformaShareG {
  constructor() {
    /** @type {import('./Usuario.js').Usuario[]}   */ this.usuarios = [];
    /** @type {import('./Producto.js').Producto[]} */ this.productos = [];
    /** @type {import('./Oferta.js').Oferta[]}     */ this.ofertas = [];
    /** @type {import('./Pedido.js').Pedido[]}     */ this.pedidos = [];
  }

  registrarUsuario(usuario) {
    if (this.usuarios.some(u => u.correo === usuario.correo)) {
      throw new Error(`Ya existe un usuario con el correo ${usuario.correo}`);
    }
    this.usuarios.push(usuario);
  }

  registrarProducto(producto) {
    this.productos.push(producto);
  }

  registrarOferta(oferta) {
    this.ofertas.push(oferta);
  }

  /** @param {String} filtro @returns {import('./Oferta.js').Oferta[]} */
  buscarOfertas(filtro = '') {
    const f = filtro.toLowerCase();
    return this.ofertas.filter(o =>
      o.estado === 'ACTIVA' &&
      (o.producto.nombre.toLowerCase().includes(f) || o.producto.categoria.toLowerCase().includes(f))
    );
  }

  registrarPedido(pedido) {
    this.pedidos.push(pedido);
  }
}
