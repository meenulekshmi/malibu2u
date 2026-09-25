'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  condition: string;
  platform: string;
}

export interface CartItem {
  id: string; // Product ID or unique cart item key
  product: CartProduct;
  quantity: number;
  condition: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on client side
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem('malibu2u_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('malibu2u_cart', JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product: CartProduct, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { id: product.id, product, quantity, condition: product.condition }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.discountPrice ?? item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);

  const totalDiscount = cart.reduce((sum, item) => {
    if (item.product.discountPrice && item.product.discountPrice < item.product.price) {
      return sum + (item.product.price - item.product.discountPrice) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        totalDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
