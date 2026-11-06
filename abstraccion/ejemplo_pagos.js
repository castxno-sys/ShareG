// =============================================================
//  share.G — Pilar de POO: ABSTRACCIÓN
//  Ejemplo: un pedido con 3 opciones de pago (Nequi, PSE, Efectivo)
//  Ejecutar:  node ejemplo_pagos.js
// =============================================================
import readline from 'node:readline';

// ---------- CLASE ABSTRACTA ----------
class MedioDePago {
  #pagosRealizados = 0; // dato oculto

  constructor(titular) {
    if (new.target === MedioDePago) {
      throw new TypeError('MedioDePago es abstracta: use PagoNequi, PagoPSE o PagoEfectivo');
    }
    this.titular = titular;
  }

  // Métodos ABSTRACTOS: cada subclase DEBE implementarlos
  getNombre() { throw new Error(`${this.constructor.name} debe implementar getNombre()`); }
  calcularComision(valor) { throw new Error(`${this.constructor.name} debe implementar calcularComision()`); }
  procesar(total) { throw new Error(`${this.constructor.name} debe implementar procesar()`); }

  // Método CONCRETO: el mismo para todos los medios de pago
  pagar(valor) {
    const comision = this.calcularComision(valor);
    const total = valor + comision;
    const aprobado = this.procesar(total);
    if (aprobado) this.#pagosRealizados++;
    return { medio: this.getNombre(), valor, comision, total, aprobado };
  }

  get pagosRealizados() { return this.#pagosRealizados; }
}

// ---------- OPCIÓN 1: NEQUI ----------
class PagoNequi extends MedioDePago {
  constructor(titular, celular) {
    super(titular);
    this.celular = celular;
  }
  getNombre() { return 'Nequi'; }
  calcularComision(valor) { return 0; } // sin comisión
  procesar(total) {
    const valido = /^3\d{9}$/.test(this.celular); // celular colombiano
    if (valido) console.log(`   📱 Notificación enviada al ${this.celular}`);
    else console.log('   ⚠️  Número de celular inválido');
    return valido;
  }
}

// ---------- OPCIÓN 2: PSE ----------
class PagoPSE extends MedioDePago {
  constructor(titular, banco, saldo) {
    super(titular);
    this.banco = banco;
    this.saldo = saldo;
  }
  getNombre() { return `PSE (${this.banco})`; }
  calcularComision(valor) { return Math.round(valor * 0.015); } // 1,5 %
  procesar(total) {
    if (total > this.saldo) {
      console.log('   ⚠️  Saldo insuficiente');
      return false;
    }
    this.saldo -= total;
    console.log(`   🏦 Débito en ${this.banco}. Saldo restante: ${cop(this.saldo)}`);
    return true;
  }
}

// ---------- OPCIÓN 3: EFECTIVO ----------
class PagoEfectivo extends MedioDePago {
  constructor(titular, montoEntregado) {
    super(titular);
    this.montoEntregado = montoEntregado;
    this.cambio = 0;
  }
  getNombre() { return 'Efectivo contra entrega'; }
  calcularComision(valor) { return 2000; } // recargo fijo por recaudo
  procesar(total) {
    if (this.montoEntregado < total) {
      console.log('   ⚠️  El dinero entregado no alcanza');
      return false;
    }
    this.cambio = this.montoEntregado - total;
    console.log(`   💵 Cambio a devolver: ${cop(this.cambio)}`);
    return true;
  }
}

// ---------- PEDIDO: usa solo la abstracción ----------
class Pedido {
  constructor(comprador) {
    this.comprador = comprador;
    this.items = [];
    this.pagado = false;
  }
  agregarItem(producto, cantidad, precio) {
    this.items.push({ producto, cantidad, precio });
  }
  calcularTotal() {
    return this.items.reduce((s, i) => s + i.cantidad * i.precio, 0);
  }
  pagarCon(medio) {
    // No sabe si es Nequi, PSE o Efectivo: solo llama a pagar()
    const recibo = medio.pagar(this.calcularTotal());
    this.pagado = recibo.aprobado;
    return recibo;
  }
}

// ---------- PROGRAMA: menú con las 3 opciones ----------
function cop(n) {
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

const rl = readline.createInterface({ input: process.stdin });
const lineas = rl[Symbol.asyncIterator]();
async function preguntar(texto) {
  process.stdout.write(texto);
  const { value } = await lineas.next();
  const respuesta = (value ?? '').trim();
  if (!process.stdin.isTTY) console.log(respuesta);
  return respuesta;
}

console.log('==============================================');
console.log('   share.G — Pago de pedido (Abstracción)');
console.log('==============================================');

const nombre = (await preguntar('Nombre del comprador: ')) || 'Restaurante El Fogón';
const pedido = new Pedido(nombre);
pedido.agregarItem('Papa pastusa (bulto)', 1, 95000);
pedido.agregarItem('Fresa (canastilla)', 2, 28000);

console.log('\n🧾 Pedido:');
pedido.items.forEach(i => console.log(`   ${i.cantidad} x ${i.producto} — ${cop(i.cantidad * i.precio)}`));
console.log(`   Subtotal: ${cop(pedido.calcularTotal())}\n`);

console.log('¿Cómo desea pagar?');
console.log('   1. Nequi     (sin comisión)');
console.log('   2. PSE       (comisión 1,5 %)');
console.log('   3. Efectivo  (recargo $2.000)');
const opcion = await preguntar('Opción: ');

let medio;
switch (opcion) {
  case '1': {
    const cel = await preguntar('Número de celular Nequi: ');
    medio = new PagoNequi(nombre, cel);
    break;
  }
  case '2': {
    const banco = (await preguntar('Banco: ')) || 'Bancolombia';
    const saldo = Number(await preguntar('Saldo disponible: '));
    medio = new PagoPSE(nombre, banco, saldo);
    break;
  }
  case '3': {
    const monto = Number(await preguntar('¿Con cuánto paga?: '));
    medio = new PagoEfectivo(nombre, monto);
    break;
  }
  default:
    console.log('Opción no válida');
    rl.close();
    process.exit(1);
}
rl.close();

console.log('\nProcesando pago...');
const r = pedido.pagarCon(medio); // MISMA línea sin importar la opción elegida
console.log(`\n${r.aprobado ? '✅ Pago aprobado' : '❌ Pago rechazado'}`);
console.log(`   Medio:    ${r.medio}`);
console.log(`   Valor:    ${cop(r.valor)}`);
console.log(`   Comisión: ${cop(r.comision)}`);
console.log(`   Total:    ${cop(r.total)}`);

// Demostración: la clase abstracta no se puede instanciar
try {
  new MedioDePago('Prueba');
} catch (e) {
  console.log(`\n(Prueba de abstracción) ${e.message}`);
}
