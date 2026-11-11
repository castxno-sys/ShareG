import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listarCatalogo, listarCategorias } from '../services/productos.js';
import ProductCard from '../components/ProductCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(params.get('q') || '');

  const categoria = params.get('categoria') || '';
  const orden = params.get('orden') || 'recientes';

  useEffect(() => { listarCategorias().then(setCategorias); }, []);

  useEffect(() => {
    setCargando(true);
    const t = setTimeout(() => {
      listarCatalogo({ busqueda, categoria, orden })
        .then(setProductos)
        .catch(console.error)
        .finally(() => setCargando(false));
    }, 250);
    return () => clearTimeout(t);
  }, [busqueda, categoria, orden]);

  const setParam = (k, v) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    setParams(n, { replace: true });
  };

  const catActual = categorias.find((c) => c.slug === categoria);

  return (
    <div className="container page">
      <header className="page__head">
        <span className="eyebrow">Mercado</span>
        <h1>{catActual ? `${catActual.icono} ${catActual.nombre}` : 'Catálogo'}</h1>
        <p>{cargando ? 'Buscando en las fincas…' : `${productos.length} ${productos.length === 1 ? 'producto disponible' : 'productos disponibles'} en La Trinidad`}</p>
      </header>

      <div className="toolbar">
        <div className="field-icon toolbar__search">
          <Icon name="search" />
          <input className="input" placeholder="Buscar papa, fresa, queso…" value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar productos" />
          {busqueda && <button className="field-icon__clear" onClick={() => setBusqueda('')} aria-label="Limpiar búsqueda"><Icon name="x" size={16} /></button>}
        </div>
        <select className="input" value={orden} onChange={(e) => setParam('orden', e.target.value)} aria-label="Ordenar">
          <option value="recientes">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="mejor">Mejor calificados</option>
        </select>
      </div>

      <div className="chips chips--scroll">
        <button className={`chip ${!categoria ? 'is-active' : ''}`} onClick={() => setParam('categoria', '')}>Todos</button>
        {categorias.map((c) => (
          <button key={c.id} className={`chip ${categoria === c.slug ? 'is-active' : ''}`} onClick={() => setParam('categoria', c.slug)}>
            {c.icono} {c.nombre}
          </button>
        ))}
      </div>

      {cargando ? <SkeletonGrid /> : productos.length === 0 ? (
        <EmptyState icono="🔎" titulo="No encontramos productos" texto="Prueba con otra búsqueda o categoría.">
          <button className="btn btn--outline" onClick={() => { setBusqueda(''); setParams({}); }}>Ver todo el catálogo</button>
        </EmptyState>
      ) : (
        <div className="grid">{productos.map((p) => <ProductCard key={p.id} producto={p} />)}</div>
      )}
    </div>
  );
}
