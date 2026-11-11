import Logo from './Logo.jsx';
import Icon from './Icon.jsx';

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__brand" style={{ '--auth-img': `url(${import.meta.env.BASE_URL}img/guasca-tractor.webp)` }}>
        <Logo claro />
        <div>
          <h2>El mercado de la vereda, en tu bolsillo.</h2>
          <ul>
            <li><Icon name="leaf" size={18} /> Productos frescos de La Trinidad</li>
            <li><Icon name="heart" size={18} /> Precio justo para quien cultiva</li>
            <li><Icon name="truck" size={18} /> Entrega acordada directo con la finca</li>
          </ul>
        </div>
        <span className="auth__foot">Guasca · Cundinamarca</span>
      </aside>
      <div className="auth__main">{children}</div>
    </div>
  );
}
