import Estrellas from './Estrellas.jsx';

// Muestra estrellas solo cuando hay reseñas (nunca estrellas grises vacías).
export default function Calificacion({ valor, total, tam = 'sm', vacio = null }) {
  if (!Number(total)) return vacio;
  return (
    <span className="rating">
      <Estrellas valor={valor} tam={tam} />
      <b>{Number(valor).toFixed(1)}</b>
      <span>({total})</span>
    </span>
  );
}
