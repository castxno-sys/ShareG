import { memo } from 'react';
import Icon from './Icon.jsx';
import { pesos, fecha, haceCuanto } from '../utils/formato.js';

/** Tarjeta de un comprador tal como la ve un productor (sin correo ni teléfono). */
export default memo(function CompradorCard({ comprador: c }) {
  return (
    <article className={`card buyer ${c.esNuevo ? 'buyer--new' : ''}`}>
      <div className="avatar avatar--lg">{c.inicial}</div>
      <div className="buyer__info">
        <strong>{c.nombreVisible} {c.esNuevo && <span className="tag-new">Nuevo</span>}</strong>
        <span className="muted"><Icon name="pin" size={13} /> {c.vereda || 'Sin vereda'} · se unió {haceCuanto(c.creado_en)} ({fecha(c.creado_en)})</span>
        {c.teHaComprado ? (
          <span className="buyer__stat buyer__stat--ok"><Icon name="check" size={14} /> Te ha comprado {c.comprasConmigo} {c.comprasConmigo === 1 ? 'vez' : 'veces'} · {pesos(c.totalConmigo)}</span>
        ) : (
          <span className="buyer__stat">{c.pedidos > 0 ? `Ha hecho ${c.pedidos} ${c.pedidos === 1 ? 'pedido' : 'pedidos'} a otras fincas` : 'Todavía no ha hecho pedidos'}</span>
        )}
      </div>
    </article>
  );
});
