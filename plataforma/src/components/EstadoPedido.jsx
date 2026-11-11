import { ESTADOS } from '../utils/formato.js';
import Icon from './Icon.jsx';

const PASOS = ['pendiente', 'confirmado', 'enviado', 'entregado'];

// Línea de progreso del pedido: Pendiente → Confirmado → Enviado → Entregado
export default function EstadoPedido({ estado }) {
  if (estado === 'cancelado') return <span className="badge badge--rojo">Cancelado</span>;
  const actual = PASOS.indexOf(estado);
  return (
    <ol className="timeline" aria-label={`Estado: ${ESTADOS[estado].label}`}>
      {PASOS.map((p, i) => (
        <li key={p} className={i < actual ? 'is-done' : i === actual ? 'is-current' : ''}>
          <span className="timeline__dot">{i < actual ? <Icon name="check" size={12} stroke={3} /> : null}</span>
          <span className="timeline__label">{ESTADOS[p].label}</span>
        </li>
      ))}
    </ol>
  );
}
