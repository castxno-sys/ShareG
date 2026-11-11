import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CLAVE = 'shareg_carrito';

const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(leer);
  const [pulso, setPulso] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(items)); } catch { /* sin almacenamiento */ }
  }, [items]);

  const agregar = (producto, cantidad = 1) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i
        );
      }
      return [...prev, {
        id: producto.id, nombre: producto.nombre, precio: Number(producto.precio),
        unidad: producto.unidad, imagen_url: producto.imagen_url, stock: Number(producto.stock),
        productor_nombre: producto.productor_nombre, cantidad,
      }];
    });
    setPulso(true);
    setTimeout(() => setPulso(false), 600);
  };

  // delta: +1 / -1 (usa el valor más reciente, así los toques rápidos no se pierden)
  const cambiarCantidad = (id, delta) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, Math.min(i.cantidad + delta, i.stock)) } : i)));

  const quitar = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const vaciar = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + i.precio * i.cantidad, 0), [items]);
  const cantidadTotal = items.length;

  return (
    <CartContext.Provider value={{ items, agregar, cambiarCantidad, quitar, vaciar, total, cantidadTotal, pulso }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
