import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Product, CartItem, Order, Enquiry } from '../types';
import { PRODUCTS } from '../constants';

// Utility for dynamic pricing
export const calculateDynamicPrice = (basePrice: number, quantity: number, minQty: number) => {
  // Logic: 0.5% discount for every unit above minQty
  // Cap at 10% (Updated from 15%)
  if (quantity <= minQty) return { price: basePrice, discountPercent: 0 };
  
  let discountPercent = (quantity - minQty) * 0.5;
  if (discountPercent > 10) discountPercent = 10;
  
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = Math.round(basePrice - discountAmount);
  
  return { 
    price: finalPrice, 
    discountPercent: parseFloat(discountPercent.toFixed(1)) 
  };
};

interface StoreContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  products: Product[];
  placeOrder: (method: 'UPI' | 'COD', address: string, finalAmount?: number) => Promise<string>;
  orders: Order[];
  isAdmin: boolean;
  addEnquiry: (enquiry: Enquiry) => void;
  enquiries: Enquiry[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('apna_user');
    const storedCart = localStorage.getItem('apna_cart');
    const storedOrders = localStorage.getItem('apna_orders');
    const storedEnquiries = localStorage.getItem('apna_enquiries');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCart) setCart(JSON.parse(storedCart));
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    if (storedEnquiries) setEnquiries(JSON.parse(storedEnquiries));
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('apna_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem('apna_user', JSON.stringify(user));
    else localStorage.removeItem('apna_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('apna_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('apna_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addEnquiry = (enquiry: Enquiry) => {
    setEnquiries(prev => [enquiry, ...prev]);
  };

  const placeOrder = async (method: 'UPI' | 'COD', address: string, finalAmount?: number) => {
    if (!user) throw new Error("Must be logged in");
    
    // Calculate total using dynamic pricing if finalAmount is not provided
    const calculatedTotal = cart.reduce((sum, item) => {
      const { price } = calculateDynamicPrice(item.price, item.quantity, item.minQty);
      return sum + (price * item.quantity);
    }, 0);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      items: [...cart],
      totalAmount: finalAmount !== undefined ? finalAmount : calculatedTotal,
      status: 'Pending',
      paymentMethod: method,
      date: new Date().toISOString(),
      shippingAddress: address
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    return newOrder.id;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <StoreContext.Provider value={{ 
      user, login, logout, 
      cart, addToCart, removeFromCart, clearCart, 
      products, placeOrder, orders, isAdmin,
      addEnquiry, enquiries
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
