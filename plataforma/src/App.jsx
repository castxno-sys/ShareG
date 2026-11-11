import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Catalogo from './pages/Catalogo.jsx';
import ProductoDetalle from './pages/ProductoDetalle.jsx';
import Carrito from './pages/Carrito.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import MisPedidos from './pages/MisPedidos.jsx';
import PanelProductor from './pages/PanelProductor.jsx';
import ProductoForm from './pages/ProductoForm.jsx';
import Perfil from './pages/Perfil.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/panel" element={<ProtectedRoute rol="productor"><PanelProductor /></ProtectedRoute>} />
          <Route path="/panel/producto/nuevo" element={<ProtectedRoute rol="productor"><ProductoForm /></ProtectedRoute>} />
          <Route path="/panel/producto/:id" element={<ProtectedRoute rol="productor"><ProductoForm /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
