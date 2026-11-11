import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listarCategorias, obtenerMiProducto, guardarProducto, subirImagen } from '../services/productos.js';
import { UNIDADES } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import Icon from '../components/Icon.jsx';
import { useUI } from '../context/UIContext.jsx';

const VACIO = { nombre: '', descripcion: '', precio: '', unidad: 'kg', stock: '', categoria_id: '', imagen_url: '', activo: true };

export default function ProductoForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(!!id);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listarCategorias().then(setCategorias);
    if (id) obtenerMiProducto(id).then((p) => { setForm(p); setCargando(false); });
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendo(true);
    try { setForm((f) => ({ ...f, imagen_url: '' })); const url = await subirImagen(user.id, archivo); setForm((f) => ({ ...f, imagen_url: url })); }
    catch (err) { setError(err.message); }
    setSubiendo(false);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setGuardando(true); setError('');
    try {
      await guardarProducto({
        id: id || undefined,
        productor_id: user.id,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        unidad: form.unidad,
        stock: Number(form.stock),
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        imagen_url: form.imagen_url || null,
        activo: form.activo,
      });
      toast(id ? 'Cambios guardados' : '¡Producto publicado!');
      navigate('/panel');
    } catch (err) { setError(err.message); }
    setGuardando(false);
  };

  if (cargando) return <Loader />;

  return (
    <div className="container page page--narrow">
      <Link to="/panel" className="breadcrumb"><Icon name="arrowLeft" size={16} /> Mi finca</Link>
      <header className="page__head"><h1>{id ? 'Editar producto' : 'Nuevo producto'}</h1></header>

      <form className="card form form--grid" onSubmit={enviar}>
        <label className="span-2">Nombre<input className="input" required value={form.nombre} onChange={set('nombre')} placeholder="Ej: Papa pastusa" /></label>
        <label className="span-2">Descripción<textarea className="input" rows="3" value={form.descripcion || ''} onChange={set('descripcion')} placeholder="Cuéntale al comprador cómo cultivas tu producto" /></label>
        <label>Categoría
          <select className="input" value={form.categoria_id || ''} onChange={set('categoria_id')}>
            <option value="">Sin categoría</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
          </select>
        </label>
        <label>Unidad
          <select className="input" value={form.unidad} onChange={set('unidad')}>
            {UNIDADES.map((u) => <option key={u}>{u}</option>)}
          </select>
        </label>
        <label>Precio (COP)<input className="input" type="number" min="0" step="50" required value={form.precio} onChange={set('precio')} /></label>
        <label>Cantidad disponible<input className="input" type="number" min="0" step="0.5" required value={form.stock} onChange={set('stock')} /></label>

        <div className="span-2 upload">
          {form.imagen_url ? <img src={form.imagen_url} alt="" /> : <div className="upload__ph"><Icon name="image" size={32} /></div>}
          <div>
            <label className="btn btn--outline btn--sm">
              {subiendo ? 'Subiendo…' : <><Icon name="image" size={16} /> Subir foto</>}
              <input type="file" accept="image/*" hidden onChange={onImagen} />
            </label>
            <p className="muted">o pega un enlace:</p>
            <input className="input" value={form.imagen_url || ''} onChange={set('imagen_url')} placeholder="https://…" />
          </div>
        </div>

        <label className="check span-2"><input type="checkbox" checked={form.activo} onChange={set('activo')} /> Publicado en el catálogo</label>
        {error && <p className="alert alert--error span-2">{error}</p>}
        <div className="span-2 form__actions">
          <Link to="/panel" className="btn btn--ghost">Cancelar</Link>
          <button className="btn btn--primary" disabled={guardando || subiendo}>{guardando ? 'Guardando…' : 'Guardar producto'}</button>
        </div>
      </form>
    </div>
  );
}
