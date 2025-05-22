"use client";
import { ICartItem } from '@/Helpers/Interfaces';
import { createContext, useCallback, useEffect, useState } from 'react';

interface CartContextProps {
  cart: ICartItem[];
  addToCart: (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => void;
  removeFromCart: (productId: ICartItem['productId']) => void;
  clearCart: () => void;
  updateQuantity: (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => void;
}

export const CartContext = createContext<CartContextProps>({
  cart: [],
  addToCart: () => { },
  removeFromCart: () => { },
  clearCart: () => { },
  updateQuantity: () => { },
});

export const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<ICartItem[]>([]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
    }
  }, []);

  const syncCartToLocalStorage = useCallback((updatedCart: ICartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('zerobeta_cart', JSON.stringify(updatedCart));
  }, []);

  const addToCart = useCallback(
    (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => {
      const updatedCart = cart.some(item => item.productId === productId)
        ? cart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
        : [...cart, { productId, quantity }];

      syncCartToLocalStorage(updatedCart);
    },
    [cart, syncCartToLocalStorage]
  );

  const removeFromCart = useCallback(
    (productId: ICartItem['productId']) => {
      const updatedCart = cart.filter(item => item.productId !== productId);
      syncCartToLocalStorage(updatedCart);
    },
    [cart, syncCartToLocalStorage]
  );

  const clearCart = () => {
    syncCartToLocalStorage([]);
  };

  const updateQuantity = useCallback(
    (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => {
      const updatedCart = cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      syncCartToLocalStorage(updatedCart);
    },
    [cart, syncCartToLocalStorage]
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};