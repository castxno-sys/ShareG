import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import Icon from '../components/Icon.jsx';
import { VEREDAS } from '../utils/formato.js';

export default function Registro() {
  const { registrarse } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '',
    rol: params.get('rol') === 'productor' ? 'productor' : 'comprador',
    vereda: VEREDAS[0], descripcion: '',
  });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const esProductor = form.rol === 'productor';

  const enviar = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (esProductor && form.descripcion.trim().length < 5) return setError('Cuéntanos qué produces (por ejemplo: papa, fresa, leche).');
    setCargando(true); setError('');
    const { data, error } = await registrarse(form.email, form.password, {
      nombre: form.nombre,
      rol: form.rol,
      telefono: form.telefono,
      ...(esProductor ? { vereda: form.vereda, descripcion: form.descripcion } : {}),
    });
    setCargando(false);
    if (error) return setError(error.message);
    if (data.session) {
      toast(esProductor ? '¡Bienvenido! Publica tu primer producto.' : '¡Bienvenido a Share.G! Recarga tu billetera para comprar.');
      navigate(esProductor ? '/panel/producto/nuevo' : '/billetera');
    } else {
      setMensaje('Te enviamos un correo para confirmar tu cuenta. Revísalo y luego ingresa.');
    }
  };

  return (
    <AuthLayout>
      <form className="auth__card form" onSubmit={enviar}>
        <h1>Crea tu cuenta</h1>
        <p className="muted">Únete al mercado de La Trinidad</p>

        <fieldset className="role-q">
          <legend>¿Eres productor?</legend>
          <div className="role-pick">
            {[
              ['comprador', '🛒', 'No, quiero comprar', 'Pide a las fincas y paga con tu saldo'],
              ['productor', '🧑‍🌾', 'Sí, soy productor', 'Publica tu cosecha y recibe pedidos'],
            ].map(([v, i, t, d]) => (
              <button type="button" key={v} aria-pressed={form.rol === v}
                className={`role ${form.rol === v ? 'is-active' : ''}`} onClick={() => setForm({ ...form, rol: v })}>
                <span>{i}</span><b>{t}</b><small>{d}</small>
              </button>
            ))}
          </div>
        </fieldset>

        <label>{esProductor ? 'Nombre de la familia o finca' : 'Nombre completo'}
          <input className="input" required value={form.nombre} onChange={set('nombre')}
            placeholder={esProductor ? 'Ej: Familia Rojas · Finca El Roble' : ''} />
        </label>
        <label>Correo<input className="input" type="email" autoComplete="email" required value={form.email} onChange={set('email')} /></label>
        <label>Teléfono<input className="input" type="tel" value={form.telefono} onChange={set('telefono')} placeholder="3xx xxx xxxx" /></label>

        {esProductor && (
          <div className="productor-extra">
            <label>Vereda
              <select className="input" value={form.vereda} onChange={set('vereda')}>
                {VEREDAS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label>¿Qué produces?
              <textarea className="input" rows="2" required value={form.descripcion} onChange={set('descripcion')}
                placeholder="Ej: papa pastusa, arveja y leche de nuestras vacas" />
            </label>
          </div>
        )}

        <label>Contraseña<input className="input" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} /></label>

        {error && <p className="alert alert--error"><Icon name="alert" size={18} /> {error}</p>}
        {mensaje && <p className="alert alert--ok">{mensaje}</p>}
        <button className="btn btn--primary btn--block btn--lg" disabled={cargando}>
          {cargando ? 'Creando…' : esProductor ? 'Registrar mi finca' : 'Crear cuenta de comprador'}
        </button>
        <p className="center muted">¿Ya tienes cuenta? <Link to="/login" className="link">Ingresa</Link></p>
      </form>
    </AuthLayout>
  );
}
