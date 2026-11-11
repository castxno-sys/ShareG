import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProducto, listarResenas, crearResena } from '../services/productos.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { pesos, fecha, cantidadUnidad, IMG_DEFECTO } from '../utils/formato.js';
import Loader from '../components/Loader.jsx';
import Estrellas from '../components/Estrellas.jsx';
import Calificacion from '../components/Calificacion.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';

export default function ProductoDetalle() {
  const { id } = useParams();
  const { agregar } = useCart();
  const { user } = useAuth();
  const { toast } = useUI();
  const [producto, setProducto] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState({ calificacion: 5, comentario: '' });

  const cargar = async () => {
    try {
      const [p, r] = await Promise.all([obtenerProducto(id), listarResenas(id)]);
      setProducto(p);
      setResenas(r);
    } catch { setProducto(null); }
    setCargando(false);
  };

  useEffect(() => { setCargando(true); setCantidad(1); cargar(); }, [id]);

  if (cargando) return <Loader />;
  if (!producto) {
    return (
      <div className="container page">
        <EmptyState icono="🥀" titulo="Producto no encontrado">
          <Link to="/catalogo" className="btn btn--primary">Volver al catálogo</Link>
        </EmptyState>
      </div>
    );
  }

  const { stock } = producto;
  const yaReseno = resenas.some((r) => r.esDe(user?.id));
  const esMio = producto.esDe(user?.id);

  const onAgregar = () => {
    agregar(producto, cantidad);
    toast(`${cantidadUnidad(cantidad, producto.unidad)} de ${producto.nombre} en tu carrito`, { accion: { to: '/carrito', label: 'Ver carrito' } });
  };

  const enviarResena = async (e) => {
    e.preventDefault();
    try {
      await crearResena({ producto_id: id, autor_id: user.id, ...nueva });
      setNueva({ calificacion: 5, comentario: '' });
      toast('¡Gracias por tu reseña!');
      cargar();
    } catch (err) { toast(err.message, { tipo: 'error' }); }
  };

  const comprar = (fija = false) => (
    <div className={`buy ${fija ? 'buy--sticky' : ''}`}>
      <div className="qty">
        <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Menos"><Icon name="minus" size={18} /></button>
        <span aria-live="polite">{cantidad}</span>
        <button onClick={() => setCantidad((c) => Math.min(stock, c + 1))} aria-label="Más"><Icon name="plus" size={18} /></button>
      </div>
      <button className="btn btn--primary btn--lg buy__btn" disabled={producto.agotado} onClick={onAgregar}>
        <Icon name="cart" size={18} /> {producto.agotado ? 'Agotado' : `Agregar · ${pesos(producto.precioPor(cantidad))}`}
      </button>
    </div>
  );

  return (
    <div className="container page page--detail">
      <nav className="breadcrumb" aria-label="Ruta">
        <Link to="/catalogo"><Icon name="arrowLeft" size={16} /> Catálogo</Link>
        {producto.categoria && <><span>/</span><Link to={`/catalogo?categoria=${producto.categoria_slug}`}>{producto.categoria}</Link></>}
      </nav>

      <div className="detail">
        <div className="detail__media">
          <img src={producto.imagen_url || IMG_DEFECTO} alt={producto.nombre} />
        </div>
        <div className="detail__info">
          {producto.categoria && <span className="chip">{producto.categoria_icono} {producto.categoria}</span>}
          <h1>{producto.nombre}</h1>
          <Calificacion valor={producto.calificacion} total={producto.num_resenas} tam="md" vacio={<span className="tag-new">Nuevo · sin reseñas aún</span>} />
          <p className="price price--lg">{pesos(producto.precio)}<small>/{producto.unidad}</small></p>
          {producto.descripcion && <p className="detail__desc">{producto.descripcion}</p>}

          <div className="detail__facts">
            <div><Icon name="package" size={18} /><span>Disponibles</span><b>{producto.disponibleTexto}</b></div>
            <div><Icon name="truck" size={18} /><span>Entrega</span><b>Acordada con el productor</b></div>
          </div>

          {!esMio && comprar()}

          <div className="farmer card">
            <div className="avatar avatar--lg">{producto.productor_nombre[0]}</div>
            <div>
              <span className="muted">Cultivado por</span>
              <strong>{producto.productor_nombre}</strong>
              <span className="muted"><Icon name="pin" size={13} /> Vereda {producto.productor_vereda}, Guasca</span>
            </div>
          </div>
        </div>
      </div>

      <section className="section reviews-section">
        <div className="section__head">
          <h2>Reseñas</h2>
          {resenas.length > 0 && <Calificacion valor={producto.calificacion} total={producto.num_resenas} tam="md" />}
        </div>
        {user && !yaReseno && !esMio && (
          <form className="card form review-form" onSubmit={enviarResena}>
            <label>¿Cómo te pareció?<Estrellas valor={nueva.calificacion} onChange={(n) => setNueva({ ...nueva, calificacion: n })} tam="lg" /></label>
            <textarea className="input" rows="3" placeholder="Cuéntale a otros compradores sobre la frescura, sabor, entrega…"
              value={nueva.comentario} onChange={(e) => setNueva({ ...nueva, comentario: e.target.value })} />
            <button className="btn btn--primary">Publicar reseña</button>
          </form>
        )}
        {!user && <p className="muted"><Link to="/login" className="link">Ingresa</Link> para dejar tu reseña.</p>}
        {resenas.length === 0 ? <p className="muted">Todavía no hay reseñas. ¡Sé el primero en contarle a otros!</p> : (
          <ul className="reviews">
            {resenas.map((r) => (
              <li key={r.id} className="card review">
                <div className="review__head">
                  <div className="avatar">{r.autorNombre[0]}</div>
                  <div><strong>{r.autorNombre}</strong><span className="muted">{fecha(r.creado_en)}</span></div>
                  <Estrellas valor={r.calificacion} tam="sm" />
                </div>
                {r.comentario && <p>{r.comentario}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!esMio && comprar(true)}
    </div>
  );
}
