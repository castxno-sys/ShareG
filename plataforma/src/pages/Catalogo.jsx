import { useEffect, useState } from 'react';
import useDebounce from '../hooks/useDebounce.js';
import { useSearchParams } from 'react-router-dom';
import { listarCatalogo, listarCategorias } from '../services/productos.js';
import ProductCard from '../components/ProductCard.jsx';
import { SkeletonGrid } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [productos, setProductos] = useState(null); // null = primera carga
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(params.get('q') || '');

  const categoria = params.get('categoria') || '';
  const orden = params.get('orden') || 'recientes';
  const texto = useDebounce(busqueda, 300); // solo la escritura espera; filtros y orden son inmediatos

  useEffect(() => { listarCategorias().then(setCategorias).catch(console.error); }, []);

  useEffect(() => {
    let vigente = true; // descarta respuestas de búsquedas anteriores que lleguen tarde
    setCargando(true);
    listarCatalogo({ busqueda: texto, categoria, orden })
      .then((lista) => { if (vigente) setProductos(lista); })
      .catch(console.error)
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [texto, categoria, orden]);

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
        <p>{productos === null ? 'Buscando en las fincas…' : `${productos.length} ${productos.length === 1 ? 'producto disponible' : 'productos disponibles'} en La Trinidad`}</p>
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

      {productos === null ? <SkeletonGrid /> : productos.length === 0 ? (
        <EmptyState icono="🔎" titulo="No encontramos productos" texto="Prueba con otra búsqueda o categoría.">
          <button className="btn btn--outline" onClick={() => { setBusqueda(''); setParams({}); }}>Ver todo el catálogo</button>
        </EmptyState>
      ) : (
        // Mientras se actualiza se dejan los resultados anteriores (sin parpadeo de esqueletos)
        <div className={`grid ${cargando ? 'is-refreshing' : ''}`} aria-busy={cargando}>
          {productos.map((p) => <ProductCard key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  );
}
