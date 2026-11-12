import { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/** Tarjeta de un vendedor (Productor). Si vino de una búsqueda, resalta los productos que coinciden. */
export default memo(function VendedorCard({ productor: p }) {
  return (
    <Link to={`/productor/${p.id}`} className="card farmer-card farmer-card--link">
      <div className="avatar avatar--lg">{p.inicial}</div>
      <div>
        <h3>{p.nombreVisible}</h3>
        <span className="muted"><Icon name="pin" size={13} /> Vereda {p.vereda}</span>
        {p.descripcion && <p>{p.descripcion}</p>}
        {p.productosCoinciden?.length > 0 && (
          <p className="match"><Icon name="search" size={13} /> Vende: <b>{p.productosCoinciden.join(', ')}</b></p>
        )}
        <div className="farmer-card__tags">
          <span className="chip chip--soft">{p.totalProductos} {p.totalProductos === 1 ? 'producto' : 'productos'}</span>
          {p.calificacion > 0 && <span className="chip chip--soft">★ {p.calificacion.toFixed(1)}</span>}
          {p.categorias?.slice(0, 3).map((c) => <span key={c} className="chip chip--soft">{c}</span>)}
        </div>
      </div>
    </Link>
  );
});
