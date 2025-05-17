"use client";
import { ICartItem } from '@/Helpers/Interfaces';
import { createContext, useEffect, useState } from 'react';

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
    const storedCart = localStorage.getItem('cart') || '[]';
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const syncCartToLocalStorage = (updatedCart: ICartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const addToCart = (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.productId === productId);

    if (itemIndex !== -1) {
      if (updatedCart[itemIndex]) {
        updatedCart[itemIndex].quantity = quantity;
      }
    } else {
      updatedCart.push({ productId, quantity });
    }

    syncCartToLocalStorage(updatedCart);
  };

  const removeFromCart = (productId: ICartItem['productId']) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    syncCartToLocalStorage(updatedCart);
  };

  const clearCart = () => {
    syncCartToLocalStorage([]);
  };

  const updateQuantity = (productId: ICartItem['productId'], quantity: ICartItem['quantity']) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.productId === productId);

    if (itemIndex !== -1) {
      if (updatedCart[itemIndex]) {
        updatedCart[itemIndex].quantity = quantity;
      }
    }

    syncCartToLocalStorage(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};