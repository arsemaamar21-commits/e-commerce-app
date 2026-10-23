'use client';
import React, { createContext, useContext, useState } from 'react';


const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);


  const addToCart = (product: any) => {
    setCartItems((prevItems) => {

      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
      
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
     
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, totalItemsCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook ለመጠቀም
export const useCart = () => useContext(CartContext);