import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useBilletera } from '../context/BilleteraContext.jsx';
import { misProductos, eliminarProducto, guardarProducto } from '../services/productos.js';
import { pedidosRecibidos, actualizarEstado, resumenProductor } from '../services/pedidos.js';
import { pesos, fecha, ESTADOS, imagen } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EstadoPedido from '../components/EstadoPedido.jsx';
import Icon from '../components/Icon.jsx';

const ACCION = { pendiente: 'Confirmar pedido', confirmado: 'Marcar como enviado', enviado: 'Marcar como entregado' };

export default function PanelProductor() {
  const { user, perfil } = useAuth();
  const { toast, confirmar } = useUI();
  const { actualizar: actualizarBilletera } = useBilletera();
  const [tab, setTab] = useState('pedidos');
  const [filtro, setFiltro] = useState('activos');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Las tres consultas van en paralelo
  const cargar = useCallback(async () => {
    const [pr, pe, rs] = await Promise.all([misProductos(user.id), pedidosRecibidos(user.id), resumenProductor()]);
    setProductos(pr); setPedidos(pe); setResumen(rs);
    setCargando(false);
  }, [user.id]);
  useEffect(() => { cargar().catch((e) => toast(e.message, { tipo: 'error' })); }, [cargar, toast]);

  const avanzar = async (p) => {
    const sig = p.siguienteEstado;
    try {
      await actualizarEstado(p.id, sig);
      toast(sig === 'entregado' ? `Pedido entregado: recibiste ${pesos(p.total)}` : `Pedido ${ESTADOS[sig].label.toLowerCase()}`);
      cargar();
      if (sig === 'entregado') actualizarBilletera();
    }
    catch (e) { toast(e.message, { tipo: 'error' }); }
  };
  const cancelar = async (p) => {
    if (!(await confirmar('¿Cancelar este pedido?', { texto: `Se avisará a ${p.comprador?.nombre}.`, boton: 'Sí, cancelar', peligro: true }))) return;
    try { await actualizarEstado(p.id, 'cancelado'); toast('Pedido cancelado'); cargar(); }
    catch (e) { toast(e.message, { tipo: 'error' }); }
  };
  const borrar = async (p) => {
    if (!(await confirmar(`¿Eliminar "${p.nombre}"?`, { texto: 'Esta acción no se puede deshacer.', boton: 'Eliminar', peligro: true }))) return;
    try { await eliminarProducto(p.id); toast('Producto eliminado'); cargar(); }
    catch (e) { toast(e.message, { tipo: 'error' }); }
  };
  const alternar = async (p) => {
    await guardarProducto({ id: p.id, activo: !p.activo });
    toast(p.activo ? 'Producto oculto del catálogo' : 'Producto publicado');
    cargar();
  };

  if (cargando) return <Loader />;

  const stats = [
    ['Dinero recaudado', pesos(resumen.recaudado), 'coins', 'verde'],
    ['Por cobrar', pesos(resumen.por_cobrar), 'wallet', 'azul'],
    ['Por confirmar', resumen.pendientes, 'clock', 'amarillo'],
    ['Productos activos', resumen.productos_activos, 'sprout', 'terracota'],
  ];
  const visibles = pedidos.filter((p) =>
    filtro === 'activos' ? !p.cerrado : p.cerrado);

  return (
    <div className="container page">
      <header className="page__head page__head--row">
        <div>
          <span className="eyebrow">Mi finca</span>
          <h1>Hola, {perfil.primerNombre} 👋</h1>
          <p>{resumen.pendientes > 0 ? `Tienes ${resumen.pendientes} ${resumen.pendientes === 1 ? 'pedido' : 'pedidos'} por confirmar.` : 'Todo al día en tus pedidos.'}</p>
        </div>
        <Link to="/panel/producto/nuevo" className="btn btn--primary"><Icon name="plus" size={18} /> Nuevo producto</Link>
      </header>

      <div className="stats">
        {stats.map(([t, v, i, c]) => (
          <div key={t} className="card stat">
            <span className={`stat__icon stat__icon--${c}`}><Icon name={i} size={20} /></span>
            <span className="muted">{t}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'pedidos'} className={tab === 'pedidos' ? 'is-active' : ''} onClick={() => setTab('pedidos')}>
          Pedidos {resumen.pendientes > 0 && <span className="tabs__count">{resumen.pendientes}</span>}
        </button>
        <button role="tab" aria-selected={tab === 'productos'} className={tab === 'productos' ? 'is-active' : ''} onClick={() => setTab('productos')}>
          Mis productos <span className="tabs__count tabs__count--muted">{productos.length}</span>
        </button>
      </div>

      {tab === 'pedidos' && (
        <>
          <div className="chips">
            <button className={`chip ${filtro === 'activos' ? 'is-active' : ''}`} onClick={() => setFiltro('activos')}>En curso</button>
            <button className={`chip ${filtro === 'cerrados' ? 'is-active' : ''}`} onClick={() => setFiltro('cerrados')}>Entregados y cancelados</button>
          </div>
          {visibles.length === 0 ? (
            <EmptyState icono="📭" titulo={filtro === 'activos' ? 'Sin pedidos en curso' : 'Nada por aquí todavía'} texto="Cuando alguien compre tus productos aparecerá aquí." />
          ) : (
            <div className="orders">
              {visibles.map((p) => (
                <article key={p.id} className={`card order ${p.estado === 'pendiente' ? 'order--attention' : ''}`}>
                  <div className="order__head">
                    <div className="order__buyer">
                      <div className="avatar">{p.comprador?.nombre?.[0]}</div>
                      <div>
                        <strong>{p.comprador?.nombre}</strong>
                        <span className="muted">{p.codigo} · {fecha(p.creado_en)}</span>
                      </div>
                    </div>
                    <strong className="order__total">{pesos(p.total)}</strong>
                  </div>
                  <EstadoPedido estado={p.estado} />
                  <ul className="order__items">
                    {p.items.map((i) => (
                      <li key={i.id}><span>{Number(i.cantidad)} × {i.nombre_producto}</span><span>{pesos(i.subtotal)}</span></li>
                    ))}
                  </ul>
                  <div className="order__meta">
                    <span><Icon name="pin" size={14} /> {p.direccion_entrega}</span>
                    {p.comprador?.telefono && <a href={`tel:${p.comprador.telefono}`}><Icon name="phone" size={14} /> {p.comprador.telefono}</a>}
                    {p.notas && <span className="order__note">“{p.notas}”</span>}
                  </div>
                  {p.siguienteEstado && (
                    <div className="order__actions">
                      <button className="btn btn--primary" onClick={() => avanzar(p)}><Icon name="check" size={18} /> {ACCION[p.estado]}</button>
                      <button className="btn btn--ghost text-danger" onClick={() => cancelar(p)}>Cancelar</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'productos' && (productos.length === 0 ? (
        <EmptyState icono="🌱" titulo="Aún no publicas productos" texto="Publica tu primera cosecha en menos de un minuto.">
          <Link to="/panel/producto/nuevo" className="btn btn--primary">Publicar mi primer producto</Link>
        </EmptyState>
      ) : (
        <div className="inventory">
          {productos.map((p) => (
            <article key={p.id} className={`card inv ${p.activo ? '' : 'inv--off'}`}>
              <img src={imagen(p.imagen_url, 176)} width="88" height="88" alt="" loading="lazy" decoding="async" />
              <div className="inv__info">
                <strong>{p.nombre}</strong>
                <span className="muted">{p.categoria ? `${p.categoria_icono} ${p.categoria}` : 'Sin categoría'}</span>
                <span className="inv__price">{pesos(p.precio)} <small>/ {p.unidad}</small></span>
                <span className={p.quedanPocos || p.agotado ? 'text-warn' : 'muted'}>
                  {(p.quedanPocos || p.agotado) && <Icon name="alert" size={14} />} {p.disponibleTexto} disponibles
                </span>
              </div>
              <div className="inv__actions">
                <label className="switch" title={p.activo ? 'Publicado' : 'Oculto'}>
                  <input type="checkbox" checked={p.activo} onChange={() => alternar(p)} />
                  <span className="switch__track" /><span className="switch__label">{p.activo ? 'Publicado' : 'Oculto'}</span>
                </label>
                <div>
                  <Link to={`/panel/producto/${p.id}`} className="icon-btn" aria-label="Editar" title="Editar"><Icon name="edit" size={18} /></Link>
                  <button className="icon-btn icon-btn--danger" onClick={() => borrar(p)} aria-label="Eliminar" title="Eliminar"><Icon name="trash" size={18} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
