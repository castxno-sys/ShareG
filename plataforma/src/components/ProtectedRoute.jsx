import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ children, rol }) {
  const { user, perfil, esProductor, cargando } = useAuth();
  const location = useLocation();

  if (cargando || (user && !perfil)) return <Loader />;
  if (!user) return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  if (rol === 'productor' && !esProductor) return <Navigate to="/" replace />;
  return children;
}
