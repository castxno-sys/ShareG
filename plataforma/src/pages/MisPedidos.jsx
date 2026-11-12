import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useBilletera } from '../context/BilleteraContext.jsx';
import { obtenerProducto } from '../services/productos.js';
import { misPedidos, actualizarEstado } from '../services/pedidos.js';
import { pesos, fecha } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EstadoPedido from '../components/EstadoPedido.jsx';
import Icon from '../components/Icon.jsx';

const FILTROS = {
  todos: ['Todos', () => true],
  curso: ['En curso', (p) => !p.cerrado],
  entregados: ['Entregados', (p) => p.estado === 'entregado'],
  cancelados: ['Cancelados', (p) => p.cancelado],
};

export default function MisPedidos() {
  const { user } = useAuth();
  const { toast, confirmar } = useUI();
  const { agregar } = useCart();
  const { billetera, actualizar } = useBilletera();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [repitiendo, setRepitiendo] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(
    () => misPedidos(user.id).then(setPedidos).catch(console.error).finally(() => setCargando(false)),
    [user.id],
  );
  useEffect(() => { cargar(); }, [cargar]);

  const cancelar = async (id) => {
    const ok = await confirmar('¿Cancelar este pedido?', { texto: 'Los productos vuelven a estar disponibles para otros compradores.', boton: 'Sí, cancelar', peligro: true });
    if (!ok) return;
    try { await actualizarEstado(id, 'cancelado'); toast('Pedido cancelado: el dinero volvió a tu saldo'); cargar(); actualizar(); }
    catch (e) { toast(e.message, { tipo: 'error' }); }
  };

  // Vuelve a poner en el carrito los productos de un pedido anterior (con precio y stock de hoy)
  const volverAPedir = async (pedido) => {
    setRepitiendo(pedido.id);
    let agregados = 0;
    const faltantes = [];
    for (const item of pedido.items) {
      const prod = item.producto_id ? await obtenerProducto(item.producto_id).catch(() => null) : null;
      if (!prod || prod.agotado) { faltantes.push(item.nombre_producto); continue; }
      agregar(prod, Math.min(item.cantidad, prod.stock));
      agregados++;
    }
    setRepitiendo(null);
    if (!agregados) return toast('Esos productos ya no están disponibles', { tipo: 'error' });
    toast(faltantes.length ? `Agregado. No disponible: ${faltantes.join(', ')}` : 'Productos agregados a tu canasta');
    navigate('/carrito');
  };

  const resumen = useMemo(() => ({
    total: pedidos.length,
    gastado: pedidos.filter((p) => !p.cancelado).reduce((s, p) => s + p.total, 0),
    entregados: pedidos.filter((p) => p.estado === 'entregado').length,
  }), [pedidos]);
  const visibles = pedidos.filter(FILTROS[filtro][1]);

  if (cargando) return <Loader />;

  return (
    <div className="container page page--narrow">
      <header className="page__head page__head--row">
        <div>
          <h1>Mis pedidos</h1>
          <p>Tu historial de compras en las fincas de La Trinidad.</p>
        </div>
        {billetera && <Link to="/billetera" className="btn btn--outline btn--sm"><Icon name="wallet" size={16} /> Saldo {pesos(billetera.saldo)}</Link>}
      </header>
      {pedidos.length > 0 && (
        <>
          <div className="stats stats--3">
            <div className="card stat"><span className="muted">Pedidos realizados</span><strong>{resumen.total}</strong></div>
            <div className="card stat"><span className="muted">Total gastado</span><strong>{pesos(resumen.gastado)}</strong></div>
            <div className="card stat"><span className="muted">Entregados</span><strong>{resumen.entregados}</strong></div>
          </div>
          <div className="chips">
            {Object.entries(FILTROS).map(([k, [t, fn]]) => (
              <button key={k} className={`chip ${filtro === k ? 'is-active' : ''}`} onClick={() => setFiltro(k)}>
                {t} <span className="chip__n">{pedidos.filter(fn).length}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {pedidos.length === 0 ? (
        <EmptyState icono="📦" titulo="Aún no tienes pedidos" texto="Cuando hagas tu primera compra podrás seguirla aquí.">
          <Link to="/catalogo" className="btn btn--primary">Explorar catálogo</Link>
        </EmptyState>
      ) : (
        <div className="orders">
          {visibles.map((p) => (
            <article key={p.id} className="card order">
              <div className="order__head">
                <div>
                  <strong>Pedido {p.codigo}</strong>
                  <span className="muted">{fecha(p.creado_en)}</span>
                </div>
                <strong className="order__total">{pesos(p.total)}</strong>
              </div>
              <EstadoPedido estado={p.estado} />
              <ul className="order__items">
                {p.items.map((i) => (
                  <li key={i.id}><span>{Number(i.cantidad)} × {i.nombre_producto}</span><span>{pesos(i.subtotal)}</span></li>
                ))}
              </ul>
              <div className="order__foot">
                <div className="order__meta">
                  <span><Icon name="pin" size={14} /> {p.direccion_entrega}</span>
                  <span className={p.cancelado ? 'text-warn' : ''}><Icon name="wallet" size={14} /> {p.estadoPago}</span>
                </div>
                <div className="order__actions">
                  {p.puedeCancelarComprador && (
                    <button className="btn btn--ghost btn--sm text-danger" onClick={() => cancelar(p.id)}>Cancelar pedido</button>
                  )}
                  <button className="btn btn--outline btn--sm" disabled={repitiendo === p.id} onClick={() => volverAPedir(p)}>
                    <Icon name="refresh" size={16} /> {repitiendo === p.id ? 'Agregando…' : 'Volver a pedir'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
