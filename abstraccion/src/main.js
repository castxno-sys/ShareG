import { MedioDePago } from './pagos/MedioDePago.js';
import { PagoNequi } from './pagos/PagoNequi.js';
import { PagoPSE } from './pagos/PagoPSE.js';
import { PagoEfectivo } from './pagos/PagoEfectivo.js';
import { Pedido } from './Pedido.js';

const cop = n => n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

console.log('=== share.G · Pilar de POO: ABSTRACCIÓN ===\n');

// 1. No se puede instanciar la clase abstracta
try {
  new MedioDePago('Alguien');
} catch (e) {
  console.log('❌', e.message, '\n');
}

// 2. Mismo pedido, tres medios de pago distintos
const medios = [
  new PagoNequi('Restaurante El Fogón', '3209876543'),
  new PagoPSE('Tienda La Cosecha', 'Bancolombia', 1_000_000),
  new PagoEfectivo('Doña Marta', 200_000),
];

for (const medio of medios) {
  const pedido = new Pedido(medio.titular);
  pedido.agregarItem('Papa pastusa (bulto)', 1, 95000);
  pedido.agregarItem('Fresa (canastilla)', 2, 28000);

  console.log(`🧾 Pedido de ${pedido.comprador} — subtotal ${cop(pedido.calcularTotal())}`);
  // Pedido NO sabe qué medio es: solo usa la interfaz abstracta pagar()
  const r = pedido.pagarCon(medio);
  console.log(`   ${r.aprobado ? '✅' : '❌'} ${r.medio}: comisión ${cop(r.comision)} → total ${cop(r.total)}\n`);
}

// 3. Una subclase incompleta falla: el contrato abstracto se exige
class PagoIncompleto extends MedioDePago {
  getNombre() { return 'Incompleto'; }
}
try {
  new PagoIncompleto('Prueba').pagar(1000);
} catch (e) {
  console.log('❌', e.message);
}
