export interface Product {
  id: string;
  name: string;
  category: 'Frames' | 'Goggles';
  price: number;
  minQty: number;
  description: string;
  image: string;
  features: string[];
  inStock: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  shopName: string;
  shopAddress: string;
  phone: string;
  role: 'retailer' | 'admin';
  password?: string; // Added for mock auth validation
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  paymentMethod: 'UPI' | 'COD';
  date: string;
  shippingAddress: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
}