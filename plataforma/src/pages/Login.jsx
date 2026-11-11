import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Icon from '../components/Icon.jsx';

const DEMO = [
  ['🧑‍🌾', 'Productor', 'ernesto@shareg.co'],
  ['🛒', 'Comprador', 'comprador@shareg.co'],
];

export default function Login() {
  const { iniciarSesion } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true); setError('');
    const { error } = await iniciarSesion(form.email, form.password);
    setCargando(false);
    if (error) return setError('Correo o contraseña incorrectos.');
    toast('¡Bienvenido de nuevo!');
    navigate(location.state?.desde || '/');
  };

  return (
    <AuthLayout>
      <form className="auth__card form" onSubmit={enviar}>
        <h1>Bienvenido de nuevo</h1>
        <p className="muted">Ingresa a tu cuenta de share.G</p>
        <label>Correo
          <div className="field-icon"><Icon name="user" />
            <input className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </label>
        <label>Contraseña
          <input className="input" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="alert alert--error"><Icon name="alert" size={18} /> {error}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={cargando}>{cargando ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="center muted">¿No tienes cuenta? <Link to="/registro" className="link">Regístrate gratis</Link></p>

        <div className="demo">
          <span className="demo__title">Cuentas de prueba · contraseña <code>ShareG2026!</code></span>
          <div className="demo__btns">
            {DEMO.map(([i, rol, email]) => (
              <button type="button" key={email} className="demo__btn" onClick={() => setForm({ email, password: 'ShareG2026!' })}>
                <span>{i}</span><b>{rol}</b><small>{email}</small>
              </button>
            ))}
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
