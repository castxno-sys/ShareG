import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { obtenerPerfil } from '../services/perfiles.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const idCargado = useRef(undefined); // evita volver a pedir el mismo perfil

  const cargarPerfil = useCallback(async (userId, forzar = false) => {
    if (!forzar && idCargado.current === (userId ?? null)) return;
    idCargado.current = userId ?? null;
    setPerfil(userId ? await obtenerPerfil().catch(() => null) : null); // Productor o Comprador
  }, []);

  useEffect(() => {
    // onAuthStateChange emite INITIAL_SESSION al cargar, así no hace falta getSession() aparte.
    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSession(s);
      // Las llamadas a Supabase van fuera del callback (recomendación de supabase-js).
      setTimeout(async () => {
        await cargarPerfil(s?.user.id);
        if (evento === 'INITIAL_SESSION') setCargando(false);
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [cargarPerfil]);

  const iniciarSesion = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), []);
  const registrarse = useCallback((email, password, datos) => supabase.auth.signUp({
    email, password,
    options: { data: datos, emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
  }), []);
  const cerrarSesion = useCallback(() => supabase.auth.signOut(), []);
  const recargarPerfil = useCallback(() => cargarPerfil(session?.user.id, true), [cargarPerfil, session]);

  const valor = useMemo(() => ({
    session,
    user: session?.user ?? null,
    perfil,
    esProductor: perfil?.esProductor ?? false,
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    recargarPerfil,
  }), [session, perfil, cargando, iniciarSesion, registrarse, cerrarSesion, recargarPerfil]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
