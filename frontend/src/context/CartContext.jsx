import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as apiAdd, updateCartItem, removeCartItem } from '../api/client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, item_count: 0 });
      return;
    }
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart({ items: [], subtotal: 0, item_count: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, qty = 1) => {
    if (!user) throw new Error('Please log in to add items to cart');
    const data = await apiAdd(productId, qty);
    setCart(data);
    return data;
  };

  const updateQuantity = async (itemId, qty) => {
    const data = await updateCartItem(itemId, qty);
    setCart(data);
    return data;
  };

  const removeItem = async (itemId) => {
    const data = await removeCartItem(itemId);
    setCart(data);
    return data;
  };

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
