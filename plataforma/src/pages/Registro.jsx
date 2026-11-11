import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Registro() {
  const { registrarse } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '',
    rol: params.get('rol') === 'productor' ? 'productor' : 'comprador',
  });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    setCargando(true); setError('');
    const { data, error } = await registrarse(form.email, form.password, {
      nombre: form.nombre, rol: form.rol, telefono: form.telefono,
    });
    setCargando(false);
    if (error) return setError(error.message);
    if (data.session) navigate(form.rol === 'productor' ? '/panel' : '/catalogo');
    else setMensaje('Te enviamos un correo para confirmar tu cuenta. Revísalo y luego ingresa.');
  };

  return (
    <AuthLayout>
      <form className="auth__card form" onSubmit={enviar}>
        <h1>Crea tu cuenta</h1>
        <p className="muted">Únete al mercado de La Trinidad</p>

        <div className="role-pick">
          {[['comprador', '🛒', 'Quiero comprar'], ['productor', '🧑‍🌾', 'Soy productor']].map(([v, i, t]) => (
            <button type="button" key={v} className={`role ${form.rol === v ? 'is-active' : ''}`} onClick={() => setForm({ ...form, rol: v })}>
              <span>{i}</span><b>{t}</b>
            </button>
          ))}
        </div>

        <label>Nombre completo<input className="input" required value={form.nombre} onChange={set('nombre')} /></label>
        <label>Correo<input className="input" type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Teléfono<input className="input" value={form.telefono} onChange={set('telefono')} placeholder="3xx xxx xxxx" /></label>
        <label>Contraseña<input className="input" type="password" required value={form.password} onChange={set('password')} /></label>

        {error && <p className="alert alert--error">{error}</p>}
        {mensaje && <p className="alert alert--ok">{mensaje}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={cargando}>{cargando ? 'Creando…' : 'Crear cuenta'}</button>
        <p className="center muted">¿Ya tienes cuenta? <Link to="/login" className="link">Ingresa</Link></p>
      </form>
    </AuthLayout>
  );
}
