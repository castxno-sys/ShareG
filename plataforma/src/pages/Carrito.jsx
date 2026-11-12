import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useBilletera } from '../context/BilleteraContext.jsx';
import { crearPedido } from '../services/pedidos.js';
import { pesos, imagen } from '../utils/formato.js';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

const CLAVE = 'shareg_entrega';
const leerEntrega = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? { direccion: '', notas: '' }; }
  catch { return { direccion: '', notas: '' }; }
};

export default function Carrito() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCart();
  const { user } = useAuth();
  const { toast } = useUI();
  const { billetera, actualizar } = useBilletera();
  const navigate = useNavigate();
  const [entrega, setEntrega] = useState(leerEntrega);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Se guarda la dirección para no perderla si el comprador debe iniciar sesión
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(entrega)); } catch { /* sin almacenamiento */ }
  }, [entrega]);

  if (items.length === 0) {
    return (
      <div className="container page">
        <EmptyState icono="🧺" titulo="Tu canasta está vacía" texto="Explora el catálogo y agrega productos frescos de Guasca.">
          <Link to="/catalogo" className="btn btn--primary">Ir al catálogo</Link>
        </EmptyState>
      </div>
    );
  }

  const fincas = new Set(items.map((i) => i.productor_nombre)).size;
  const falta = user && billetera ? billetera.faltaPara(total) : 0;

  const confirmar = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { desde: '/carrito' } });
    setEnviando(true); setError('');
    try {
      await crearPedido(items, entrega.direccion, entrega.notas);
      vaciar();
      actualizar(); // descuenta el pago del saldo mostrado
      setEntrega((x) => ({ ...x, notas: '' }));
      toast('¡Pedido enviado a los productores!');
      navigate('/mis-pedidos');
    } catch (err) {
      setError(err.message);
    } finally { setEnviando(false); }
  };

  return (
    <div className="container page">
      <header className="page__head">
        <h1>Tu canasta</h1>
        <p>{items.length} {items.length === 1 ? 'producto' : 'productos'} de {fincas} {fincas === 1 ? 'finca' : 'fincas'}</p>
      </header>
      <div className="cart">
        <ul className="cart__list">
          {items.map((i) => (
            <li key={i.id} className="card cart__item">
              <img src={imagen(i.imagen_url, 168)} width="84" height="84" alt="" decoding="async" />
              <div className="cart__info">
                <Link to={`/producto/${i.id}`}><strong>{i.nombre}</strong></Link>
                <span className="muted">{i.productor_nombre}</span>
                <span className="muted">{pesos(i.precio)} / {i.unidad}</span>
              </div>
              <div className="cart__controls">
                <div className="qty qty--sm">
                  <button onClick={() => cambiarCantidad(i.id, -1)} aria-label="Menos"><Icon name="minus" size={16} /></button>
                  <span>{i.cantidad}</span>
                  <button onClick={() => cambiarCantidad(i.id, 1)} aria-label="Más"><Icon name="plus" size={16} /></button>
                </div>
                <strong className="cart__sub">{pesos(i.precio * i.cantidad)}</strong>
                <button className="icon-btn icon-btn--danger" onClick={() => quitar(i.id)} aria-label={`Quitar ${i.nombre}`} title="Quitar">
                  <Icon name="trash" size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form className="card cart__summary form" onSubmit={confirmar}>
          <h3>Resumen del pedido</h3>
          <div className="row"><span>Subtotal</span><span>{pesos(total)}</span></div>
          <div className="row"><span>Envío</span><span className="muted">Se acuerda con cada finca</span></div>
          <div className="row row--total"><span>Total</span><span>{pesos(total)}</span></div>
          {user && billetera && (
            <div className={`pay ${falta ? 'pay--low' : ''}`}>
              <Icon name="wallet" size={20} />
              <div>
                <span>Pagas con tu saldo</span>
                <strong>{pesos(billetera.saldo)} disponibles</strong>
                {!falta && <small>Te quedarán {pesos(billetera.saldo - total)}</small>}
                {falta > 0 && <small>Te faltan {pesos(total - billetera.saldo)}</small>}
              </div>
              {falta > 0 && <Link to={`/billetera?monto=${falta}`} className="btn btn--accent btn--sm">Recargar</Link>}
            </div>
          )}
          <label>Dirección de entrega
            <div className="field-icon">
              <Icon name="pin" />
              <input className="input" required value={entrega.direccion}
                onChange={(e) => setEntrega({ ...entrega, direccion: e.target.value })} placeholder="Calle, barrio, municipio" />
            </div>
          </label>
          <label>Notas para el productor <span className="muted">(opcional)</span>
            <textarea className="input" rows="2" value={entrega.notas}
              onChange={(e) => setEntrega({ ...entrega, notas: e.target.value })} placeholder="Horario, indicaciones…" />
          </label>
          {error && <p className="alert alert--error"><Icon name="alert" size={18} /> {error}</p>}
          <button className="btn btn--primary btn--block btn--lg" disabled={enviando || falta > 0}>
            {enviando ? 'Enviando…' : user ? <>Confirmar pedido · {pesos(total)}</> : 'Ingresa para confirmar'}
          </button>
          <p className="muted center small"><Icon name="heart" size={14} /> El 100% del valor llega a los productores.</p>
        </form>
      </div>
    </div>
  );
}
