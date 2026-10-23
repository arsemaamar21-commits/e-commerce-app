'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number | string;
  title: string;
  price: string;
  image: string;
  category: string;
  description?: string;
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number | string) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {}
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const nextCart = [...prev, product];
      localStorage.setItem('cart', JSON.stringify(nextCart));
      return nextCart;
    });
    alert(`${product.title} ወደ ጋሪው ተጨምሯል! 🛒`);
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.id !== id);
      localStorage.setItem('cart', JSON.stringify(nextCart));
      return nextCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);