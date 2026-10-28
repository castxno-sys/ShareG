// Demostración del flujo TO-BE de share.G: publicar → pedir → pagar → entregar → calificar
import {
  PlataformaShareG, Productor, Comprador, Administrador, Producto,
  Categoria, Unidad, TipoComprador, MetodoPago,
} from './index.js';

const cop = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const plataforma = new PlataformaShareG();

// 1. Registro de usuarios
const admin = new Administrador('Admin share.G', 'admin@shareg.co', '3000000000', 'admin123', 2);
const productor = new Productor('Doña Rosa', 'rosa@shareg.co', '3101234567', 'rosa123', 'La Trinidad', 'San Francisco');
const comprador = new Comprador('Restaurante El Fogón', 'fogon@shareg.co', '3209876543', 'fogon123',
  TipoComprador.NEGOCIO, 'Calle 85 #12-30, Bogotá');
[admin, productor, comprador].forEach(u => plataforma.registrarUsuario(u));

// 2. Verificación (RN1)
try {
  productor.publicarOferta(new Producto('Papa'), 10, Unidad.BULTO, 90000, new Date());
} catch (e) {
  console.log('⚠️ ', e.message);
}
admin.verificarProductor(productor);
console.log(`✅ ${productor.nombre} verificado por ${admin.nombre}`);

// 3. Productos y ofertas
const papa = new Producto('Papa pastusa', Categoria.AGRICOLA, false, 'Papa de primera');
const fresa = new Producto('Fresa', Categoria.AGRICOLA, true, 'Fresa fresca de la vereda');
const queso = new Producto('Queso campesino', Categoria.TRANSFORMADO, true);
[papa, fresa, queso].forEach(p => plataforma.registrarProducto(p));

const ofPapa = productor.publicarOferta(papa, 20, Unidad.BULTO, 95000, new Date());
const ofFresa = productor.publicarOferta(fresa, 15, Unidad.CANASTILLA, 28000, new Date());
const ofQueso = productor.publicarOferta(queso, 30, Unidad.UNIDAD, 12000, new Date());
[ofPapa, ofFresa, ofQueso].forEach(o => plataforma.registrarOferta(o));

console.log('\n🔎 Búsqueda "fresa":', plataforma.buscarOfertas('fresa').map(o => `${o.producto.nombre} - ${cop(o.precioUnitario)}/${o.unidad}`));

// 4. Pedido
const pedido = comprador.crearPedido();
plataforma.registrarPedido(pedido);
pedido.agregarDetalle(ofPapa, 4);
pedido.agregarDetalle(ofFresa, 5);
try {
  pedido.agregarDetalle(ofQueso, 50); // RN3
} catch (e) {
  console.log('⚠️ ', e.message);
}
console.log(`\n🧾 Pedido ${pedido.id} — total ${cop(pedido.calcularTotal())} — estado ${pedido.estado}`);

// 5. Ciclo de vida del pedido
productor.aceptarPedido(pedido);
const pago = comprador.pagar(pedido, MetodoPago.NEQUI);
console.log(`💳 Pago ${pago.id} por ${cop(pago.valor)} vía ${pago.metodo}: ${pago.aprobado ? 'aprobado' : 'rechazado'}`);
pedido.programarEntrega(comprador.direccion, new Date(), 'Transportes Guasca');
console.log(`🚚 Estado: ${pedido.estado}`);
pedido.confirmarEntrega();
const cal = comprador.calificar(pedido, 5, 'Producto fresco y entrega puntual');
console.log(`⭐ Calificación ${cal.puntaje}/5: "${cal.comentario}" — estado final ${pedido.estado}`);

// 6. Reportes
console.log(`\n💰 Ventas de ${productor.nombre}: ${cop(productor.calcularVentas())}`);
console.log('📊 Reporte admin:', admin.generarReporte(plataforma));
