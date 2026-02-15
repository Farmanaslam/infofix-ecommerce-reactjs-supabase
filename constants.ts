
import { Product, User, Order, Branch } from './types';

export const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Nebula Pro Headphones',
    description: 'Immersive noise-canceling headphones with spatial audio and 40-hour battery life.',
    price: 299.99,
    category: 'Electronics',
    stock: 45,
    image: 'https://picsum.photos/seed/nebula/600/600',
    rating: 4.8,
    reviews: 128
  },
  {
    id: '2',
    name: 'Eco-Smart Watch Series X',
    description: 'Track your health, sleep, and fitness with our most advanced sensor array yet.',
    price: 199.50,
    category: 'Electronics',
    stock: 12,
    image: 'https://picsum.photos/seed/watch/600/600',
    rating: 4.5,
    reviews: 89
  },
  {
    id: '3',
    name: 'Minimalist Canvas Backpack',
    description: 'Durable, waterproof, and stylish. Perfect for daily commutes or weekend trips.',
    price: 75.00,
    category: 'Fashion',
    stock: 100,
    image: 'https://picsum.photos/seed/bag/600/600',
    rating: 4.7,
    reviews: 215
  },
  {
    id: '4',
    name: 'Artisan Ceramic Pour-Over Kit',
    description: 'Elevate your morning ritual with hand-crafted ceramics for the perfect brew.',
    price: 45.99,
    category: 'Home',
    stock: 28,
    image: 'https://picsum.photos/seed/coffee/600/600',
    rating: 4.9,
    reviews: 56
  },
  {
    id: '5',
    name: 'Sonic Whitening Toothbrush',
    description: '30,000 vibrations per minute for a dentist-clean feel every single day.',
    price: 120.00,
    category: 'Beauty',
    stock: 64,
    image: 'https://picsum.photos/seed/brush/600/600',
    rating: 4.4,
    reviews: 142
  }
];

export const OPERATORS: User[] = [
  { id: 'admin1', name: 'Sarah Chen', role: 'MANAGER', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'admin2', name: 'Marcus Thorne', role: 'INVENTORY', avatar: 'https://i.pravatar.cc/150?u=marcus' },
  { id: 'admin3', name: 'Elena Rodriguez', role: 'SUPPORT', avatar: 'https://i.pravatar.cc/150?u=elena' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'cust101',
    customerName: 'James Wilson',
    items: [{ productId: '1', quantity: 1, price: 299.99 }],
    total: 299.99,
    status: 'delivered',
    createdAt: '2023-10-25T14:30:00Z'
  },
  {
    id: 'ORD-002',
    customerId: 'cust102',
    customerName: 'Linda May',
    items: [{ productId: '3', quantity: 2, price: 75.00 }],
    total: 150.00,
    status: 'shipped',
    createdAt: '2023-11-01T09:15:00Z'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-1',
    title: "Benachity Main Branch",
    address: "Ananda Gopal Mukherjee Sarani Rd, near BINA GAS, Kamalpur Plot, Benachity, Durgapur, West Bengal 713213",
    city: "Durgapur",
    days: "Monday - Sunday",
    hours: "11:00 AM - 8:30 PM",
    phone: "8293295257",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Infofix+Computer+Benachity+Durgapur+near+BINA+GAS",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2070",
    details: "Our central hub for hardware sales and expert technical diagnostics."
  },
  {
    id: 'br-2',
    title: "Nabapally Service Point",
    address: "Ananda Gopal Mukherjee Sarani Rd, beside NEAR BANK OF BARODA, Nabapally, Benachity, Durgapur, West Bengal 713213",
    city: "Durgapur",
    days: "Monday - Sunday",
    hours: "11:00 AM - 8:30 PM",
    phone: "8670777330",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Infofix+Computer+Nabapally+Benachity+Durgapur",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&q=80&w=2074",
    details: "Specialized service center for laptop repairs and component replacement."
  },
  {
    id: 'br-3',
    title: "Ukhra Regional Hub",
    address: "Natun Hat Tala, Ukhra, West Bengal 713363",
    city: "Durgapur",
    days: "Monday - Sunday",
    hours: "11:00 AM - 8:30 PM",
    phone: "7318621222",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Natun+Hat+Tala+Ukhra+West+Bengal+713363",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2070",
    details: "Serving the local community with high-quality peripherals and network solutions."
  },
  {
    id: 'br-4',
    title: "Asansol Flagship",
    address: "Infinity Tower, Ground floor, Beside Reliance Digital, Ashram more, Asansol, West Bengal 713303",
    city: "Asansol",
    days: "Monday - Sunday",
    hours: "10:00 AM - 10:00 PM",
    phone: "8670777086",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Infinity+Tower+Ashram+more+Asansol",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070",
    details: "Our largest showroom featuring the latest custom gaming builds and professional workstations."
  }
];
