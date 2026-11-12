import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogo, setDialogo] = useState(null);
  const resolver = useRef(null);

  const toast = useCallback((texto, { tipo = 'ok', accion } = {}) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t.slice(-2), { id, texto, tipo, accion }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const confirmar = useCallback((titulo, { texto, boton = 'Confirmar', peligro = false } = {}) =>
    new Promise((res) => {
      resolver.current = res;
      setDialogo({ titulo, texto, boton, peligro });
    }), []);

  // Valor estable: mostrar un aviso no obliga a redibujar a todos los que usan useUI()
  const valor = useMemo(() => ({ toast, confirmar }), [toast, confirmar]);

  const cerrar = (respuesta) => {
    resolver.current?.(respuesta);
    setDialogo(null);
  };

  return (
    <UIContext.Provider value={valor}>
      {children}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item toast-item--${t.tipo}`}>
            <Icon name={t.tipo === 'error' ? 'alert' : 'check'} size={18} />
            <span>{t.texto}</span>
            {t.accion && <Link to={t.accion.to} className="toast-item__action">{t.accion.label}</Link>}
          </div>
        ))}
      </div>

      {dialogo && (
        <div className="modal" onClick={() => cerrar(false)}>
          <div className="modal__box card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{dialogo.titulo}</h3>
            {dialogo.texto && <p className="muted">{dialogo.texto}</p>}
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => cerrar(false)}>Volver</button>
              <button className={`btn ${dialogo.peligro ? 'btn--danger' : 'btn--primary'}`} autoFocus onClick={() => cerrar(true)}>
                {dialogo.boton}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUI = () => useContext(UIContext);
