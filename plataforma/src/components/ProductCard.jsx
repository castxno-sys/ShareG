import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { pesos, IMG_DEFECTO } from '../utils/formato.js';
import Calificacion from './Calificacion.jsx';
import Icon from './Icon.jsx';

export default function ProductCard({ producto }) {
  const { agregar } = useCart();
  const { toast } = useUI();
  const { user } = useAuth();
  const [agregado, setAgregado] = useState(false);
  const esMio = user?.id === producto.productor_id;
  const agotado = Number(producto.stock) <= 0;
  const pocos = !agotado && Number(producto.stock) <= 25;

  const onAgregar = () => {
    agregar(producto);
    setAgregado(true);
    toast(`Listo: ${producto.nombre} en tu canasta`, { accion: { to: '/carrito', label: 'Ver carrito' } });
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <article className="card product">
      <Link to={`/producto/${producto.id}`} className="product__media">
        <img src={producto.imagen_url || IMG_DEFECTO} alt={producto.nombre} loading="lazy" />
        {producto.categoria && <span className="chip chip--float">{producto.categoria_icono} {producto.categoria}</span>}
        {pocos && <span className="chip chip--warn">Quedan pocos</span>}
      </Link>
      <div className="product__body">
        <div className="product__top">
          <Link to={`/producto/${producto.id}`} className="product__name"><h3>{producto.nombre}</h3></Link>
          <Calificacion valor={producto.calificacion} total={producto.num_resenas} />
        </div>
        <p className="product__farmer"><Icon name="leaf" size={14} /> {producto.productor_nombre}</p>
        <div className="product__foot">
          <p className="price">{pesos(producto.precio)}<small>/{producto.unidad}</small></p>
          {esMio ? (
            <Link to={`/panel/producto/${producto.id}`} className="btn btn--sm btn--outline product__add"><Icon name="edit" size={16} /> <span>Editar</span></Link>
          ) : (
          <button
            className={`btn btn--sm ${agregado ? 'btn--done' : 'btn--primary'} product__add`}
            disabled={agotado}
            onClick={onAgregar}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            {agotado ? 'Agotado' : agregado ? <><Icon name="check" size={18} /> <span>Listo</span></> : <><Icon name="plus" size={18} /> <span>Agregar</span></>}
          </button>
          )}
        </div>
      </div>
    </article>
  );
}
