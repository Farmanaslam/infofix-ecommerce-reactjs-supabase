export type Role = "MANAGER" | "INVENTORY" | "SUPPORT" | "CUSTOMER";

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
  image: string;
  price: number;
  retailPrice?: number;
  discountPercent: number;
  stock: number;
  condition: "New" | "Refurbished";
  category: string;
  subcategory?: string;
  brand?: string;
  specs: string[];
  rating: number;
  reviews: number;
  likesCount: number;
  tags: string[];
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
  status: "pending" | "shipped" | "delivered" | "cancelled";
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

// ─── Supabase DB types (Inventory admin panel only) ──────────────────────────
// Maps directly to your Supabase `products` table columns.
// Kept separate from Product so the customer-facing type stays unchanged.

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
}

export interface DBSubcategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
}

export interface DBTag {
  id: number;
  name: string;
}

export interface DBProduct {
  id: number;
  name: string;
  description: string;
  image_url: string;
  retail_price: number;
  discounted_price: number;
  discount_percent: number;
  stock_quantity: number;
  condition: "New" | "Refurbished" | "Used";
  brand: string;
  model: string;
  specs: Record<string, string>;
  rating_avg: number;
  rating_count: number;
  likes_count: number;
  is_active: boolean;
  category_id: number;
  subcategory_id: number | null;
  created_at: string;
  // joined relations (present when fetched with select)
  categories?: { name: string; slug: string };
  subcategories?: { name: string; slug: string } | null;
  product_tags?: { tags: { id: number; name: string } }[];
}

export interface DBProductFormState {
  name: string;
  description: string;
  brand: string;
  model: string;
  retail_price: string;
  discounted_price: string;
  discount_percent: string;
  stock_quantity: string;
  condition: "New" | "Refurbished" | "Used";
  category_id: string;
  subcategory_id: string;
  image_url: string;
  is_active: boolean;
  specs: { key: string; value: string }[];
  tag_ids: number[];
}
