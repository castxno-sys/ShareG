import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';

// En GitHub Pages se usa HashRouter (/#/catalogo) para que recargar la página no dé 404.
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router basename={import.meta.env.VITE_ROUTER === 'hash' ? undefined : import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <UIProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </UIProvider>
    </Router>
  </React.StrictMode>
);
