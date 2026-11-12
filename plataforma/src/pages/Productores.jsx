import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buscarProductores } from '../services/perfiles.js';
import useDebounce from '../hooks/useDebounce.js';
import VendedorCard from '../components/VendedorCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loader from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import { VEREDAS } from '../utils/formato.js';

/** Directorio de familias productoras con buscador y filtro por vereda. */
export default function Productores() {
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(params.get('q') ?? '');
  const vereda = params.get('vereda') || null;
  const q = useDebounce(texto, 300);
  const [lista, setLista] = useState(null);

  useEffect(() => {
    let vigente = true;
    buscarProductores(q, vereda).then((r) => vigente && setLista(r)).catch(() => vigente && setLista([]));
    return () => { vigente = false; };
  }, [q, vereda]);

  const setVereda = (v) => { const n = new URLSearchParams(params); v ? n.set('vereda', v) : n.delete('vereda'); setParams(n, { replace: true }); };

  return (
    <div className="container page">
      <header className="page__head">
        <span className="eyebrow">Vendedores</span>
        <h1>Familias productoras</h1>
        <p>{lista ? `${lista.length} ${lista.length === 1 ? 'familia' : 'familias'} vendiendo en Share.G` : 'Cargando…'}</p>
      </header>
      <div className="toolbar">
        <div className="field-icon toolbar__search">
          <Icon name="search" />
          <input className="input" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca por nombre, vereda o lo que venden (ej. trucha)" aria-label="Buscar vendedores" />
          {texto && <button className="field-icon__clear" onClick={() => setTexto('')} aria-label="Limpiar"><Icon name="x" size={16} /></button>}
        </div>
      </div>
      <div className="chips chips--scroll">
        <button className={`chip ${!vereda ? 'is-active' : ''}`} onClick={() => setVereda(null)}>Todas las veredas</button>
        {VEREDAS.slice(0, -1).map((v) => (
          <button key={v} className={`chip ${vereda === v ? 'is-active' : ''}`} onClick={() => setVereda(v)}>{v}</button>
        ))}
      </div>
      {lista === null ? <Loader /> : lista.length === 0 ? (
        <EmptyState icono="🧑‍🌾" titulo="No encontramos vendedores" texto="Prueba con otra palabra o quita el filtro de vereda.">
          <button className="btn btn--outline" onClick={() => { setTexto(''); setVereda(null); }}>Ver todas</button>
        </EmptyState>
      ) : (
        <div className="farmers">{lista.map((p) => <VendedorCard key={p.id} productor={p} />)}</div>
      )}
    </div>
  );
}
