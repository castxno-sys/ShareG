import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarPerfil = useCallback(async (userId) => {
    if (!userId) return setPerfil(null);
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    setPerfil(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await cargarPerfil(data.session?.user.id);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      // evitar llamadas a Supabase dentro del callback síncrono
      setTimeout(() => cargarPerfil(s?.user.id), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [cargarPerfil]);

  const iniciarSesion = (email, password) => supabase.auth.signInWithPassword({ email, password });

  const registrarse = (email, password, datos) =>
    supabase.auth.signUp({
      email, password,
      options: { data: datos, emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
    });

  const cerrarSesion = () => supabase.auth.signOut();

  const valor = {
    session,
    user: session?.user ?? null,
    perfil,
    esProductor: perfil?.rol === 'productor' || perfil?.rol === 'admin',
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    recargarPerfil: () => cargarPerfil(session?.user.id),
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
