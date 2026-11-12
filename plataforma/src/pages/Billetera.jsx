import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useBilletera } from '../context/BilleteraContext.jsx';
import { listarMovimientos, recargar } from '../services/billetera.js';
import { Billetera as ModeloBilletera, Movimiento } from '../models/index.js';
import { pesos } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

const FILTROS = { todos: 'Todos', ingresos: 'Entradas', gastos: 'Salidas' };
const fechaHora = (d) =>
  new Date(d).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export default function Billetera() {
  const { esProductor } = useAuth();
  const { toast } = useUI();
  const { billetera, actualizar } = useBilletera();
  const [params] = useSearchParams();
  const [movimientos, setMovimientos] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [metodo, setMetodo] = useState('Nequi');
  const [monto, setMonto] = useState(() => Number(params.get('monto')) || 50_000);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(() => listarMovimientos().then(setMovimientos).catch(() => setMovimientos([])), []);
  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => (movimientos ?? []).filter((m) =>
    filtro === 'todos' ? true : filtro === 'ingresos' ? m.esIngreso : !m.esIngreso), [movimientos, filtro]);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await recargar(monto, metodo);
      toast(`Recargaste ${pesos(monto)} con ${metodo}`);
      await Promise.all([actualizar(), cargar()]);
    } catch (err) {
      toast(err.message, { tipo: 'error' });
    } finally { setEnviando(false); }
  };

  if (!billetera || movimientos === null) return <Loader />;

  const stats = esProductor
    ? [['Recaudado por ventas', billetera.recaudado, 'coins'], ['Recargado', billetera.recargado, 'wallet'], ['Gastado en pedidos', billetera.gastado, 'cart']]
    : [['Recargado', billetera.recargado, 'wallet'], ['Gastado en pedidos', billetera.gastado, 'cart'], ['Movimientos', null, 'refresh']];

  return (
    <div className="container page">
      <header className="page__head">
        <span className="eyebrow">Mi billetera</span>
        <h1>Tu saldo en Share.G</h1>
      </header>

      <div className="wallet">
        <section className="wallet__hero">
          <span>Saldo disponible</span>
          <strong>{pesos(billetera.saldo)}</strong>
          <p>{esProductor
            ? 'Cada pedido entregado suma aquí lo que vendiste.'
            : 'Con este saldo pagas tus pedidos. Si un pedido se cancela, el dinero vuelve aquí.'}</p>
          <Link to={esProductor ? '/panel' : '/catalogo'} className="btn btn--accent btn--sm">
            {esProductor ? 'Ver mis pedidos' : 'Ir a comprar'} <Icon name="arrowRight" size={16} />
          </Link>
        </section>

        <form className="card form wallet__recarga" onSubmit={enviar}>
          <h3>Recargar saldo</h3>
          <div className="wallet__metodos" role="radiogroup" aria-label="Método">
            {Movimiento.METODOS.map((m) => (
              <button type="button" key={m} role="radio" aria-checked={metodo === m}
                className={`chip ${metodo === m ? 'is-active' : ''}`} onClick={() => setMetodo(m)}>{m}</button>
            ))}
          </div>
          <div className="wallet__montos">
            {ModeloBilletera.MONTOS_RAPIDOS.map((v) => (
              <button type="button" key={v} className={`wallet__monto ${monto === v ? 'is-active' : ''}`} onClick={() => setMonto(v)}>
                {pesos(v)}
              </button>
            ))}
          </div>
          <label htmlFor="monto">Otro valor (COP)
            <input id="monto" className="input" type="number" min={ModeloBilletera.RECARGA_MIN} max={ModeloBilletera.RECARGA_MAX}
              step="1000" value={monto} onChange={(e) => setMonto(Number(e.target.value))} />
          </label>
          <button className="btn btn--primary btn--block btn--lg" disabled={enviando}>
            {enviando ? 'Recargando…' : `Recargar ${pesos(monto || 0)}`}
          </button>
          <p className="muted small center"><Icon name="alert" size={14} /> Modo de prueba: no se cobra dinero real ni se piden datos bancarios.</p>
        </form>
      </div>

      <div className="stats stats--3">
        {stats.map(([t, v, i]) => (
          <div key={t} className="card stat">
            <span className="stat__icon stat__icon--verde"><Icon name={i} size={20} /></span>
            <span className="muted">{t}</span>
            <strong>{v === null ? movimientos.length : pesos(v)}</strong>
          </div>
        ))}
      </div>

      <section className="section">
        <div className="section__head">
          <h2>Movimientos</h2>
          <div className="chips" style={{ margin: 0 }}>
            {Object.entries(FILTROS).map(([k, t]) => (
              <button key={k} className={`chip ${filtro === k ? 'is-active' : ''}`} onClick={() => setFiltro(k)}>{t}</button>
            ))}
          </div>
        </div>
        {visibles.length === 0 ? (
          <EmptyState icono="🪙" titulo="Sin movimientos" texto="Tus recargas, pagos y reembolsos aparecerán aquí." />
        ) : (
          <ul className="card movs">
            {visibles.map((m) => (
              <li key={m.id} className="mov">
                <span className={`mov__icon ${m.esIngreso ? 'is-in' : 'is-out'}`}><Icon name={m.icono} size={18} /></span>
                <div className="mov__info">
                  <strong>{m.etiqueta}</strong>
                  <span className="muted">
                    {fechaHora(m.creado_en)}
                    {m.metodo && ` · ${m.metodo}`}
                    {m.codigoPedido && <> · <Link to="/mis-pedidos" className="link">{m.codigoPedido}</Link></>}
                  </span>
                </div>
                <strong className={`mov__monto ${m.esIngreso ? 'is-in' : 'is-out'}`}>
                  {m.esIngreso ? '+' : '−'}{pesos(Math.abs(m.monto))}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
