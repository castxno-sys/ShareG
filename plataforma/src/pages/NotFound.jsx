import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState icono="🐄" titulo="Esta página se fue a pastar" texto="No encontramos lo que buscas.">
        <Link to="/" className="btn btn--primary">Volver al inicio</Link>
      </EmptyState>
    </div>
  );
}
