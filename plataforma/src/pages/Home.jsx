import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarCatalogo, listarCategorias } from '../services/productos.js';
import { listarProductores, estadisticasPublicas } from '../services/perfiles.js';
import { haceCuanto } from '../utils/formato.js';
import ProductCard from '../components/ProductCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import VendedorCard from '../components/VendedorCard.jsx';
import Icon from '../components/Icon.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

export default function Home() {
  const [destacados, setDestacados] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productores, setProductores] = useState([]);
  const [cifras, setCifras] = useState(null);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const escritorio = useMediaQuery('(min-width: 721px)'); // en celular no se descargan las fotos grandes

  useEffect(() => {
    listarCatalogo({ limite: 8 }).then(setDestacados).catch(() => setDestacados([]));
    listarCategorias().then(setCategorias).catch(console.error);
    listarProductores().then(setProductores).catch(console.error);
    estadisticasPublicas().then(setCifras).catch(console.error);
  }, []);

  const buscar = (e) => {
    e.preventDefault();
    navigate(`/catalogo${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow"><Icon name="pin" size={14} /> Vereda La Trinidad · Guasca</span>
            <h1>Del campo de Guasca a tu mesa, <em>sin intermediarios.</em></h1>
            <p>
              Compra papa, fresa, arándanos, lácteos y más directamente a las familias que los cultivan
              en el sector San Francisco. Precio justo para ellas, frescura para ti.
            </p>
            <form className="hero__search" onSubmit={buscar} role="search">
              <Icon name="search" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué buscas hoy? Papa, fresa, queso…" aria-label="Buscar productos" />
              <button className="btn btn--primary">Buscar</button>
            </form>
            <div className="hero__facts">
              <div><strong>{cifras?.productores ?? '—'}</strong><span>familias productoras</span></div>
              <div><strong>{cifras?.compradores ?? '—'}</strong><span>compradores</span></div>
              <div><strong>{cifras?.productos ?? '—'}</strong><span>productos frescos</span></div>
            </div>
          </div>
          {escritorio && (
          <div className="hero__art" aria-hidden="true">
            <img className="hero__img hero__img--main" src={`${import.meta.env.BASE_URL}img/guasca-lagunas.webp`} alt="" width="1000" height="562" fetchpriority="high" />
            <img className="hero__img hero__img--b" src={`${import.meta.env.BASE_URL}img/guasca-iglesia.webp`} alt="" width="260" height="260" decoding="async" />
            <div className="hero__badge">
              <Icon name="pin" size={22} />
              <div><strong>Guasca, Cundinamarca</strong><span>Lagunas de Siecha</span></div>
            </div>
          </div>
          )}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Explora por categoría</h2>
        </div>
        <div className="cats">
          {categorias.map((c) => (
            <Link key={c.id} to={`/catalogo?categoria=${c.slug}`} className={`cat cat--${c.slug}`}>
              <span className="cat__icon">{c.icono}</span>
              <span>{c.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section__head">
          <h2>Cosecha reciente</h2>
          <Link to="/catalogo" className="link">Ver todo <Icon name="arrowRight" size={16} /></Link>
        </div>
        {destacados === null ? <SkeletonGrid n={4} /> : (
          <div className="grid">{destacados.map((p) => <ProductCard key={p.id} producto={p} />)}</div>
        )}
      </section>

      {cifras?.recientes?.length > 0 && (
        <section className="container section">
          <div className="joined card">
            <div className="joined__text">
              <span className="eyebrow">Comunidad</span>
              <h2>{cifras.compradores} compradores ya le compran a La Trinidad</h2>
              <p className="muted">Los últimos en unirse:</p>
            </div>
            <ul className="joined__list">
              {cifras.recientes.map((c) => (
                <li key={c.nombre + c.creado_en}>
                  <span className="avatar">{c.nombre[0]}</span>
                  <div><strong>{c.nombre}</strong><span className="muted">{haceCuanto(c.creado_en)}</span></div>
                </li>
              ))}
            </ul>
            <Link to="/registro" className="btn btn--primary">Únete como comprador</Link>
          </div>
        </section>
      )}

      {productores.length > 0 && (
        <section className="container section">
          <div className="section__head">
            <div>
              <h2>Conoce a quienes cultivan</h2>
              <p className="muted">Cada compra llega completa a estas familias.</p>
            </div>
            <Link to="/productores" className="link">Ver todas y buscar <Icon name="arrowRight" size={16} /></Link>
          </div>
          <div className="farmers">
            {productores.map((p) => <VendedorCard key={p.id} productor={p} />)}
          </div>
        </section>
      )}

      <section className="container section">
        <div className="steps">
          <div className="steps__intro">
            <span className="eyebrow eyebrow--light">Cómo funciona</span>
            <h2>Tres pasos, cero intermediarios</h2>
          </div>
          {[
            ['sprout', 'El productor publica', 'Sube su cosecha con precio, unidad y disponibilidad desde su panel.'],
            ['cart', 'Tú eliges y pides', 'Arma tu carrito con productos de varias fincas y confirma la entrega.'],
            ['truck', 'Entrega directa', 'El productor confirma, despacha y marca tu pedido como entregado.'],
          ].map(([i, t, d], n) => (
            <div className="step" key={t}>
              <span className="step__icon"><Icon name={i} size={22} /></span>
              <span className="step__n">0{n + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="cta">
          <div>
            <h2>¿Cultivas en La Trinidad?</h2>
            <p>Publica tus productos gratis y vende directo a compradores de Guasca y Bogotá.</p>
          </div>
          <Link to="/registro?rol=productor" className="btn btn--accent btn--lg">Quiero vender <Icon name="arrowRight" size={18} /></Link>
        </div>
      </section>
    </>
  );
}
