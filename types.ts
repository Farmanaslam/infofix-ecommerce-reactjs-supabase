
export type Role = 'MANAGER' | 'INVENTORY' | 'SUPPORT' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  rating: number;
  reviews: number;
}

export interface Branch {
  id: string;
  title: string;
  address: string;
  city: string;
  hours: string;
  days: string;
  phone: string;
  mapsUrl: string;
  image: string;
  details: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AppState {
  products: Product[];
  orders: Order[];
  currentUser: User;
  cart: CartItem[];
  branches: Branch[];
}
