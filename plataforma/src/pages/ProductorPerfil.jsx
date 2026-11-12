import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProductor } from '../services/perfiles.js';
import { listarCatalogo } from '../services/productos.js';
import { fecha } from '../utils/formato.js';
import ProductCard from '../components/ProductCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';

/** Perfil público de un vendedor con todos sus productos. */
export default function ProductorPerfil() {
  const { id } = useParams();
  const [productor, setProductor] = useState(undefined); // undefined = cargando, null = no existe
  const [productos, setProductos] = useState(null);

  useEffect(() => {
    let vigente = true;
    setProductor(undefined); setProductos(null);
    Promise.all([obtenerProductor(id), listarCatalogo({ productor: id })])
      .then(([p, lista]) => { if (vigente) { setProductor(p); setProductos(lista); } })
      .catch(() => vigente && setProductor(null));
    return () => { vigente = false; };
  }, [id]);

  if (productor === undefined) return <Loader />;
  if (!productor) {
    return (
      <div className="container page">
        <EmptyState icono="🧑‍🌾" titulo="Vendedor no encontrado">
          <Link to="/productores" className="btn btn--primary">Ver familias productoras</Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="Ruta"><Link to="/productores"><Icon name="arrowLeft" size={16} /> Familias productoras</Link></nav>
      <header className="seller">
        <div className="avatar avatar--xl">{productor.inicial}</div>
        <div className="seller__info">
          <span className="eyebrow">Vendedor</span>
          <h1>{productor.nombreVisible}</h1>
          <p className="muted"><Icon name="pin" size={14} /> Vereda {productor.vereda}, Guasca{productor.creado_en && ` · en Share.G desde ${fecha(productor.creado_en)}`}</p>
          {productor.descripcion && <p className="seller__desc">{productor.descripcion}</p>}
          <div className="farmer-card__tags">
            <span className="chip chip--soft">{productor.totalProductos} productos</span>
            {productor.calificacion > 0 && <span className="chip chip--soft">★ {productor.calificacion.toFixed(1)}</span>}
            {productor.categorias.map((c) => <span key={c} className="chip chip--soft">{c}</span>)}
          </div>
        </div>
      </header>
      <section className="section">
        <h2>Lo que vende</h2>
        <div style={{ marginTop: 18 }}>
          {productos === null ? <SkeletonGrid n={4} /> : productos.length === 0 ? (
            <EmptyState icono="🌱" titulo="Sin productos publicados" texto="Esta familia aún no tiene productos disponibles." />
          ) : (
            <div className="grid">{productos.map((p) => <ProductCard key={p.id} producto={p} />)}</div>
          )}
        </div>
      </section>
    </div>
  );
}
