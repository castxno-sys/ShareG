# Share.G 🌱

Mercado digital que conecta a los productores rurales de la **vereda La Trinidad, sector San Francisco (Guasca, Cundinamarca)** con compradores, sin intermediarios.

**Stack:** React 18 + Vite (JavaScript) · Supabase (PostgreSQL, Auth, Storage, RLS) · React Router.

---

## 🚀 Cómo correrlo

Necesitas [Node.js 18+](https://nodejs.org).

```bash
npm install
npm run dev
```

Se abre en `http://localhost:5173`. El archivo `.env` ya trae las claves del proyecto de Supabase **shareg**.

### Cuentas de prueba (contraseña `ShareG2026!`)

| Rol        | Correo                |
|------------|-----------------------|
| Productor  | ernesto@shareg.co     |
| Productor  | marlene@shareg.co     |
| Productor  | lacteos@shareg.co     |
| Comprador  | comprador@shareg.co   |

---

## 📁 Estructura

```
shareg/
├── supabase/migrations/     ← Todo el SQL (PostgreSQL) de la base de datos
│   ├── 001_esquema.sql              tablas, tipos e índices
│   ├── 002_funciones_y_triggers.sql funciones, triggers y vista catálogo
│   ├── 003_seguridad_rls.sql        políticas RLS y storage
│   └── 004_datos_iniciales.sql      categorías
├── src/
│   ├── lib/supabase.js       cliente de Supabase
│   ├── context/              AuthContext (sesión/perfil) y CartContext (carrito)
│   ├── services/             acceso a datos: productos, pedidos, perfiles
│   ├── models/               clases POO del dominio (Usuario, Producto, Pedido…)
│   ├── components/           Navbar, Footer, ProductCard, Loader, Estrellas…
│   ├── pages/                Home, Catálogo, Detalle, Carrito, Login, Registro,
│   │                         MisPedidos, PanelProductor, ProductoForm, Perfil
│   ├── utils/formato.js      formato de pesos, fechas y estados
│   └── styles/global.css     sistema de diseño
└── .env                      URL y clave pública de Supabase
```

## 🗄️ Modelo de datos

| Tabla          | Qué guarda |
|----------------|------------|
| `perfiles`     | Datos de cada usuario (rol: productor / comprador / admin), enlazado a `auth.users` |
| `categorias`   | Tubérculos, Hortalizas, Frutas, Lácteos, Cárnicos, Transformados |
| `productos`    | Lo que publica cada productor: precio, unidad, stock, imagen |
| `pedidos`      | Pedido de un comprador: estado, total, dirección |
| `pedido_items` | Productos de cada pedido (puede mezclar varias fincas) |
| `resenas`      | Calificación 1–5 y comentario por producto |

**Funciones PostgreSQL (RPC):** `crear_pedido` (transacción que valida y descuenta stock), `actualizar_estado_pedido`, `resumen_productor`. **Vista:** `catalogo` (productos + productor + calificación promedio).

**Seguridad:** RLS en todas las tablas — cada productor solo edita sus productos, cada comprador solo ve sus pedidos, y nadie puede cambiarse el rol.

## 🧩 Modelos POO y diagrama de clases

La capa `src/models/` contiene las clases del dominio, usadas por los servicios y componentes:

- `Modelo` (abstracta) → `Usuario` (abstracta) → `Productor` / `Comprador`
- `Categoria`, `Producto`, `Pedido` ◆ `PedidoItem` (composición), `Resena`

Diagramas en [`docs/`](docs/): `diagrama-clases.png` y `diagrama-arquitectura.png` (fuente Mermaid en los `.mmd`).

Pruebas de los modelos: `npm test` · Revisión de código: `npm run lint` (ESLint, 0 problemas)

## ⚡ Optimización

- **Code splitting**: cada página se descarga solo al visitarla (`React.lazy`); catálogo y detalle se precargan cuando el navegador está libre.
- **Caché de datos** (`src/lib/cache.js`): categorías, catálogo y productores se reutilizan y se invalidan al crear pedidos, reseñas o editar productos. Un recorrido típico pasa de 14 a 6 consultas.
- **Imágenes a la medida**: `srcset` con anchos de 300–1100 px, `loading="lazy"`, y en celular no se descargan las fotos grandes de la portada.
- **Menos renders**: contextos memorizados (`useMemo`/`useCallback`) y `React.memo` en las tarjetas.
- Librerías en archivos aparte (`react`, `supabase`) para aprovechar la caché del navegador.

## ✨ Funcionalidades

- **Compradores:** catálogo con búsqueda, filtros y orden · detalle con reseñas · carrito · pedidos y cancelación.
- **Productores ("Mi finca"):** estadísticas de ventas · gestión de pedidos (pendiente → confirmado → enviado → entregado) · CRUD de productos con subida de fotos.
- Diseño responsive (celular y computador).
