import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo claro />
          <p>Mercado directo de los productores de la vereda La Trinidad, sector San Francisco · Guasca, Cundinamarca.</p>
        </div>
        <nav className="footer__nav">
          <strong>Explorar</strong>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/catalogo?categoria=frutas">Frutas</Link>
          <Link to="/catalogo?categoria=lacteos">Lácteos</Link>
        </nav>
        <nav className="footer__nav">
          <strong>Productores</strong>
          <Link to="/registro?rol=productor">Vender en share.G</Link>
          <Link to="/panel">Mi finca</Link>
        </nav>
      </div>
      <div className="container footer__bottom">
        Proyecto de Ingeniería de Software · Universidad de La Salle · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
