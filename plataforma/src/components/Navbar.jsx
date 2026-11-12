import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useBilletera } from '../context/BilleteraContext.jsx';
import { pesos } from '../utils/formato.js';

export default function Navbar() {
  const { user, perfil, esProductor, cerrarSesion } = useAuth();
  const { cantidadTotal, pulso } = useCart();
  const [abierto, setAbierto] = useState(false);
  const { toast } = useUI();
  const { billetera } = useBilletera();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => setAbierto(false), [pathname]);

  const salir = async () => {
    navigate('/', { replace: true }); // primero salir de páginas protegidas
    await cerrarSesion();
    toast('Sesión cerrada');
  };

  const [q, setQ] = useState('');
  const buscar = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : '/buscar');
    setQ('');
  };

  const inicial = perfil?.inicial ?? (user?.email || '?')[0].toUpperCase();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Share.G inicio"><Logo /></Link>

        <nav className={`navbar__links ${abierto ? 'is-open' : ''}`}>
          <NavLink to="/catalogo">Catálogo</NavLink>
          <NavLink to="/productores">Productores</NavLink>
          {user && <NavLink to="/mis-pedidos">Mis pedidos</NavLink>}
          {user && <NavLink to="/billetera" className="navbar__mobile-only">Billetera</NavLink>}
          {esProductor && <NavLink to="/panel">Mi finca</NavLink>}
          {user ? (
            <>
              <NavLink to="/perfil" className="navbar__mobile-only">Mi perfil</NavLink>
              <button className="navbar__mobile-only navbar__logout" onClick={salir}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-only">Ingresar</Link>
              <Link to="/registro" className="navbar__mobile-only">Crear cuenta</Link>
            </>
          )}
        </nav>

        <form className="navbar__search navbar__desk-only" role="search" onSubmit={buscar}>
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos o personas" aria-label="Buscar" />
        </form>

        <div className="navbar__actions">
          <Link to="/buscar" className="icon-btn navbar__mobile-search" aria-label="Buscar"><Icon name="search" size={22} /></Link>
          {user && billetera && (
            <Link to="/billetera" className="wallet-chip" title="Mi billetera" aria-label={`Saldo ${pesos(billetera.saldo)}`}>
              <Icon name="wallet" size={18} /> <span>{pesos(billetera.saldo)}</span>
            </Link>
          )}
          <Link to="/carrito" className={`icon-btn navbar__cart ${pulso ? 'is-pulse' : ''}`} aria-label={`Carrito, ${cantidadTotal} productos`}>
            <Icon name="cart" size={22} />
            {cantidadTotal > 0 && <span className="navbar__count">{cantidadTotal}</span>}
          </Link>
          {user ? (
            <div className="navbar__user">
              <Link to="/perfil" className="avatar" title="Mi perfil">{inicial}</Link>
              <button className="icon-btn navbar__desk-only" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
                <Icon name="logout" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm navbar__desk-only">Ingresar</Link>
          )}
          <button className="icon-btn navbar__toggle" aria-label="Menú" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>
            <Icon name={abierto ? 'x' : 'menu'} size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
