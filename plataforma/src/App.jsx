import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';

// Cada página se descarga solo cuando se visita (code splitting por ruta).
const cargarCatalogo = () => import('./pages/Catalogo.jsx');
const cargarDetalle = () => import('./pages/ProductoDetalle.jsx');
const Catalogo = lazy(cargarCatalogo);
const ProductoDetalle = lazy(cargarDetalle);
const Carrito = lazy(() => import('./pages/Carrito.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Registro = lazy(() => import('./pages/Registro.jsx'));
const MisPedidos = lazy(() => import('./pages/MisPedidos.jsx'));
const PanelProductor = lazy(() => import('./pages/PanelProductor.jsx'));
const ProductoForm = lazy(() => import('./pages/ProductoForm.jsx'));
const Perfil = lazy(() => import('./pages/Perfil.jsx'));
const Billetera = lazy(() => import('./pages/Billetera.jsx'));
const Buscar = lazy(() => import('./pages/Buscar.jsx'));
const Productores = lazy(() => import('./pages/Productores.jsx'));
const ProductorPerfil = lazy(() => import('./pages/ProductorPerfil.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  // Cuando el navegador queda libre, adelanta la descarga de las páginas más visitadas.
  useEffect(() => {
    const precargar = () => { cargarCatalogo(); cargarDetalle(); };
    const id = window.requestIdleCallback ? requestIdleCallback(precargar) : setTimeout(precargar, 1500);
    return () => (window.cancelIdleCallback ? cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/productores" element={<Productores />} />
            <Route path="/productor/:id" element={<ProductorPerfil />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/billetera" element={<ProtectedRoute><Billetera /></ProtectedRoute>} />
            <Route path="/panel" element={<ProtectedRoute rol="productor"><PanelProductor /></ProtectedRoute>} />
            <Route path="/panel/producto/nuevo" element={<ProtectedRoute rol="productor"><ProductoForm /></ProtectedRoute>} />
            <Route path="/panel/producto/:id" element={<ProtectedRoute rol="productor"><ProductoForm /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
