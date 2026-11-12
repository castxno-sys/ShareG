import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext(null);
const CLAVE = 'shareg_carrito';

const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(leer);
  const [pulso, setPulso] = useState(false);
  const timer = useRef();

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento */ }
  }, [items]);

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i);
      }
      return [...prev, {
        id: producto.id, nombre: producto.nombre, precio: Number(producto.precio),
        unidad: producto.unidad, imagen_url: producto.imagen_url, stock: Number(producto.stock),
        productor_nombre: producto.productor_nombre, cantidad,
      }];
    });
    setPulso(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPulso(false), 600);
  }, []);

  // delta: +1 / -1 (usa el valor más reciente, así los toques rápidos no se pierden)
  const cambiarCantidad = useCallback((id, delta) =>
    setItems((prev) => prev.map((i) =>
      i.id === id ? { ...i, cantidad: Math.max(1, Math.min(i.cantidad + delta, i.stock)) } : i)), []);

  const quitar = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const vaciar = useCallback(() => setItems([]), []);

  const valor = useMemo(() => ({
    items, agregar, cambiarCantidad, quitar, vaciar, pulso,
    total: items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    cantidadTotal: items.length,
  }), [items, agregar, cambiarCantidad, quitar, vaciar, pulso]);

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
