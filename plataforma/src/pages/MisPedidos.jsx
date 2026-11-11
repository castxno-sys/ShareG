import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { misPedidos, actualizarEstado } from '../services/pedidos.js';
import { pesos, fecha } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EstadoPedido from '../components/EstadoPedido.jsx';
import Icon from '../components/Icon.jsx';

export default function MisPedidos() {
  const { user } = useAuth();
  const { toast, confirmar } = useUI();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => misPedidos(user.id).then(setPedidos).finally(() => setCargando(false));
  useEffect(() => { cargar(); }, []);

  const cancelar = async (id) => {
    const ok = await confirmar('¿Cancelar este pedido?', { texto: 'Los productos vuelven a estar disponibles para otros compradores.', boton: 'Sí, cancelar', peligro: true });
    if (!ok) return;
    try { await actualizarEstado(id, 'cancelado'); toast('Pedido cancelado'); cargar(); }
    catch (e) { toast(e.message, { tipo: 'error' }); }
  };

  if (cargando) return <Loader />;

  return (
    <div className="container page page--narrow">
      <header className="page__head"><h1>Mis pedidos</h1></header>
      {pedidos.length === 0 ? (
        <EmptyState icono="📦" titulo="Aún no tienes pedidos" texto="Cuando hagas tu primera compra podrás seguirla aquí.">
          <Link to="/catalogo" className="btn btn--primary">Explorar catálogo</Link>
        </EmptyState>
      ) : (
        <div className="orders">
          {pedidos.map((p) => (
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
                <span className="muted"><Icon name="pin" size={14} /> {p.direccion_entrega}</span>
                {p.puedeCancelarComprador && (
                  <button className="btn btn--ghost btn--sm text-danger" onClick={() => cancelar(p.id)}>Cancelar pedido</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
