import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { actualizarPerfil } from '../services/perfiles.js';
import { useUI } from '../context/UIContext.jsx';

export default function Perfil() {
  const { user, perfil, recargarPerfil } = useAuth();
  const [form, setForm] = useState({
    nombre: perfil.nombre || '', telefono: perfil.telefono || '',
    vereda: perfil.vereda || '', sector: perfil.sector || '', descripcion: perfil.descripcion || '',
  });
  const { toast } = useUI();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    try { await actualizarPerfil(user.id, form); await recargarPerfil(); toast('Perfil actualizado'); }
    catch (err) { toast(err.message, { tipo: 'error' }); }
  };

  return (
    <div className="container page page--narrow">
      <header className="page__head page__head--row">
        <div className="farmer">
          <div className="avatar avatar--xl">{form.nombre[0]?.toUpperCase()}</div>
          <div><h1>Mi perfil</h1><span className="badge badge--verde">{perfil.rol}</span></div>
        </div>
      </header>
      <form className="card form form--grid" onSubmit={enviar}>
        <label className="span-2">Nombre<input className="input" value={form.nombre} onChange={set('nombre')} /></label>
        <label>Correo<input className="input" value={user.email} disabled /></label>
        <label>Teléfono<input className="input" value={form.telefono} onChange={set('telefono')} /></label>
        <label>Vereda<input className="input" value={form.vereda} onChange={set('vereda')} /></label>
        <label>Sector<input className="input" value={form.sector} onChange={set('sector')} /></label>
        <label className="span-2">Sobre mí / mi finca<textarea className="input" rows="3" value={form.descripcion} onChange={set('descripcion')} /></label>
        <div className="span-2 form__actions"><button className="btn btn--primary">Guardar cambios</button></div>
      </form>
    </div>
  );
}
