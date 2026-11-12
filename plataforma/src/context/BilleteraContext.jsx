import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { obtenerBilletera } from '../services/billetera.js';

const BilleteraContext = createContext(null);

/** Saldo del usuario conectado, disponible en toda la app (navbar, carrito, billetera). */
export function BilleteraProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [billetera, setBilletera] = useState(null);

  const actualizar = useCallback(async () => {
    if (!userId) return setBilletera(null);
    try { setBilletera(await obtenerBilletera()); } catch { setBilletera(null); }
  }, [userId]);

  useEffect(() => { actualizar(); }, [actualizar]);

  const valor = useMemo(() => ({ billetera, actualizar }), [billetera, actualizar]);
  return <BilleteraContext.Provider value={valor}>{children}</BilleteraContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBilletera = () => useContext(BilleteraContext);
