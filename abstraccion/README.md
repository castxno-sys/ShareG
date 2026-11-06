# Pilar de POO: Abstracción — share.G

**Abstraer** es quedarse con lo esencial de un objeto (*qué hace*) y ocultar los detalles (*cómo lo hace*).

En share.G un comprador puede pagar su pedido con **Nequi**, **PSE** o **efectivo contra entrega**. Para el `Pedido` todos son lo mismo: *un medio de pago que sabe pagar*. Los detalles de cada medio (validar el celular, debitar el banco o calcular el cambio) quedan ocultos dentro de cada clase.

## Diagrama UML

![Diagrama UML Abstracción](docs/diagrama_uml_abstraccion.png)

## Código del diagrama UML

El código fuente está en [`diagrama_uml.puml`](diagrama_uml.puml) (PlantUML). La misma versión en Mermaid, que GitHub dibuja automáticamente:

```mermaid
classDiagram
    direction BT
    class MedioDePago {
        <<abstract>>
        -Number pagosRealizados
        +String titular
        +getNombre()* String
        +calcularComision(valor: Number)* Number
        +procesar(total: Number)* Boolean
        +pagar(valor: Number) Recibo
    }
    class PagoNequi {
        +String celular
        +getNombre() String
        +calcularComision(valor: Number) Number
        +procesar(total: Number) Boolean
    }
    class PagoPSE {
        +String banco
        +Number saldo
        +getNombre() String
        +calcularComision(valor: Number) Number
        +procesar(total: Number) Boolean
    }
    class PagoEfectivo {
        +Number montoEntregado
        +Number cambio
        +getNombre() String
        +calcularComision(valor: Number) Number
        +procesar(total: Number) Boolean
    }
    class Pedido {
        +String comprador
        +Item[] items
        +Boolean pagado
        +agregarItem(producto: String, cantidad: Number, precio: Number) void
        +calcularTotal() Number
        +pagarCon(medio: MedioDePago) Recibo
    }
    PagoNequi --|> MedioDePago
    PagoPSE --|> MedioDePago
    PagoEfectivo --|> MedioDePago
    Pedido ..> MedioDePago : usa
```

## Ejemplo: 3 opciones de pago

[`ejemplo_pagos.js`](ejemplo_pagos.js) es un solo archivo con todas las clases y un menú para escoger cómo pagar el pedido:

```bash
cd abstraccion
node ejemplo_pagos.js
```

```
¿Cómo desea pagar?
   1. Nequi     (sin comisión)
   2. PSE       (comisión 1,5 %)
   3. Efectivo  (recargo $2.000)
```

Sin importar la opción, el pedido paga con la misma línea: `pedido.pagarCon(medio)`.

## Cómo se aplica la abstracción en JavaScript

| Concepto | Implementación |
|---|---|
| Clase abstracta | `MedioDePago`: el constructor lanza un error si se hace `new MedioDePago()` (`new.target`) |
| Métodos abstractos | `getNombre()`, `calcularComision()` y `procesar()` lanzan un error si la subclase no los implementa |
| Método concreto común | `pagar(valor)` es el mismo algoritmo para todos y usa los métodos abstractos |
| Ocultamiento | `#pagosRealizados` es un campo privado con un getter de solo lectura |
| Uso de la abstracción | `Pedido.pagarCon(medio : MedioDePago)` no conoce las clases concretas |

## Estructura

```
abstraccion/
├── package.json
├── diagrama_uml.puml      # Código del diagrama UML (PlantUML)
├── ejemplo_pagos.js        # Ejemplo con menú de 3 opciones de pago
├── docs/                   # Diagrama UML (PNG, SVG y fuente .dot)
└── src/
    ├── main.js             # Demostración
    ├── Pedido.js           # Usa la abstracción
    └── pagos/
        ├── MedioDePago.js  # «abstract»
        ├── PagoNequi.js
        ├── PagoPSE.js
        └── PagoEfectivo.js
```

## Ejecutar

```bash
cd abstraccion
npm start
```

Salida:

```
❌ MedioDePago es abstracta: use PagoNequi, PagoPSE o PagoEfectivo
🧾 Pedido de Restaurante El Fogón — subtotal $ 151.000
   ✅ Nequi: comisión $ 0 → total $ 151.000
🧾 Pedido de Tienda La Cosecha — subtotal $ 151.000
   ✅ PSE (Bancolombia): comisión $ 2.265 → total $ 153.265
🧾 Pedido de Doña Marta — subtotal $ 151.000
   ✅ Efectivo contra entrega: comisión $ 2.000 → total $ 153.000
❌ PagoIncompleto debe implementar calcularComision()
```

## Integrantes

- Daniel Esteban Castaño Calvo
- Miguel Vega
- Daniel Cortes
- Dilan Correa
- Tomás García
