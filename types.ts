export type Role = "MANAGER" | "INVENTORY" | "ADMIN" | "CUSTOMER";

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
  images: string[];
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
  image_urls: string[];
  is_active: boolean;
  specs: { key: string; value: string }[];
  tag_ids: number[];
}
export interface UpdatePost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  image_url: string;
  published_date: string;
  is_featured: boolean;
}
export type UpdateForm = Omit<UpdatePost, "id" | "published_date">;
export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  created_at: string;
}

export interface AddressForm {
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export const emptyAddressForm: AddressForm = {
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};
export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_charge: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  tracking_id: string | null;
  courier_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface Address {
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: { name: string; quantity: number; image?: string }[];
}
export interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  description: string;
  is_active: boolean;
  created_at: string;
}
export interface EditForm {
  full_name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  tags: string;
}
export type AppNotification = {
  id: string;
  type: "info" | "success" | "warning" | "urgent";
  title: string;
  message: string;
  user_id: string;
  user_name: string;
  user_role: string;
  read_by: string[];
  created_at: string;
};
