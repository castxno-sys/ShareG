import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listarCatalogo } from '../services/productos.js';
import { buscarProductores, listarNuevosCompradores } from '../services/perfiles.js';
import useDebounce from '../hooks/useDebounce.js';
import ProductCard from '../components/ProductCard.jsx';
import VendedorCard from '../components/VendedorCard.jsx';
import CompradorCard from '../components/CompradorCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

/** Buscador general: productos, vendedores y (solo para productores) compradores. */
export default function Buscar() {
  const { esProductor } = useAuth();
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const tipo = params.get('tipo') ?? 'todo';
  const q = useDebounce(texto.trim(), 300);
  const [res, setRes] = useState({ productos: [], vendedores: [], compradores: [] });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const n = new URLSearchParams(params);
    q ? n.set('q', q) : n.delete('q');
    if (n.toString() !== params.toString()) setParams(n, { replace: true });
  }, [q, params, setParams]);

  useEffect(() => {
    if (!q) { setRes({ productos: [], vendedores: [], compradores: [] }); return undefined; }
    let vigente = true;
    setCargando(true);
    Promise.all([
      listarCatalogo({ busqueda: q }),
      buscarProductores(q),
      esProductor ? listarNuevosCompradores(50, q) : Promise.resolve([]),
    ])
      .then(([productos, vendedores, compradores]) => { if (vigente) setRes({ productos, vendedores, compradores }); })
      .catch(console.error)
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [q, esProductor]);

  const pestañas = [
    ['todo', 'Todo', res.productos.length + res.vendedores.length + res.compradores.length],
    ['productos', 'Productos', res.productos.length],
    ['vendedores', 'Vendedores', res.vendedores.length],
    ...(esProductor ? [['compradores', 'Compradores', res.compradores.length]] : []),
  ];
  const ver = (t) => tipo === 'todo' || tipo === t;
  const setTipo = (t) => { const n = new URLSearchParams(params); t === 'todo' ? n.delete('tipo') : n.set('tipo', t); setParams(n, { replace: true }); };
  const nada = q && !cargando && pestañas[0][2] === 0;

  return (
    <div className="container page">
      <header className="page__head">
        <span className="eyebrow">Buscador</span>
        <h1>Buscar en Share.G</h1>
        <p>{esProductor ? 'Productos, vendedores y compradores.' : 'Productos y vendedores de las fincas de Guasca.'}</p>
      </header>

      <div className="field-icon search-big">
        <Icon name="search" />
        <input className="input" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder={esProductor ? 'Busca “trucha”, “Marlene”, “Sopó”, “Andrés”…' : 'Busca “trucha”, “Marlene”, “miel”, “Siecha”…'}
          aria-label="Buscar" />
        {texto && <button className="field-icon__clear" onClick={() => setTexto('')} aria-label="Limpiar"><Icon name="x" size={16} /></button>}
      </div>

      {q && (
        <div className="chips" role="tablist">
          {pestañas.map(([k, t, n]) => (
            <button key={k} role="tab" aria-selected={tipo === k} className={`chip ${tipo === k ? 'is-active' : ''}`} onClick={() => setTipo(k)}>
              {t} <span className="chip__n">{n}</span>
            </button>
          ))}
        </div>
      )}

      {!q && (
        <div className="search-hints">
          <p className="muted">Prueba con:</p>
          {['papa', 'trucha', 'miel', 'La Trinidad', 'Marlene'].map((s) => (
            <button key={s} className="chip" onClick={() => setTexto(s)}>{s}</button>
          ))}
          <Link to="/productores" className="link">Ver todas las familias productoras <Icon name="arrowRight" size={16} /></Link>
        </div>
      )}

      {nada && <EmptyState icono="🔎" titulo={`Nada para “${q}”`} texto="Revisa la ortografía o prueba con otra palabra." />}

      <div className={cargando ? 'is-refreshing' : ''}>
        {ver('vendedores') && res.vendedores.length > 0 && (
          <section className="results">
            <h2>Vendedores <span className="muted">({res.vendedores.length})</span></h2>
            <div className="farmers">{res.vendedores.map((p) => <VendedorCard key={p.id} productor={p} />)}</div>
          </section>
        )}
        {ver('productos') && res.productos.length > 0 && (
          <section className="results">
            <h2>Productos <span className="muted">({res.productos.length})</span></h2>
            <div className="grid">{res.productos.slice(0, tipo === 'todo' ? 8 : undefined).map((p) => <ProductCard key={p.id} producto={p} />)}</div>
            {tipo === 'todo' && res.productos.length > 8 && <button className="link" onClick={() => setTipo('productos')}>Ver los {res.productos.length} productos</button>}
          </section>
        )}
        {esProductor && ver('compradores') && res.compradores.length > 0 && (
          <section className="results">
            <h2>Compradores <span className="muted">({res.compradores.length})</span></h2>
            <div className="buyers">{res.compradores.map((c) => <CompradorCard key={c.id} comprador={c} />)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
