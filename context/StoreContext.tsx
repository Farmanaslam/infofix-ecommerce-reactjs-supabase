import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Product,
  Order,
  User,
  CartItem,
  AppState,
  Role,
  Branch,
} from "../types";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  OPERATORS,
  INITIAL_BRANCHES,
} from "../constants";
import { supabase } from "@/lib/supabaseClient";

export type CustomerPage =
  | "home"
  | "shop"
  | "about"
  | "contact"
  | "services"
  | "branches"
  | "updates"
  | "login"
  | "signup"
  | "cart"
  | "profile"
  | "orders"
  | "policy"
  | "careers";
export type AdminPage =
  | "Dashboard"
  | "Inventory"
  | "Orders"
  | "Customers"
  | "Settings"
  | "Content";

interface StoreContextType extends AppState {
  currentPage: CustomerPage;
  adminPage: AdminPage;
  setCurrentPage: (page: CustomerPage) => void;
  setAdminPage: (page: AdminPage) => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setCurrentUser: (user: User | null) => void;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addOrder: (order: Order) => void;
  switchRole: (role: Role) => void;
  addBranch: (branch: Branch) => void;
  updateBranch: (branch: Branch) => void;
  deleteBranch: (branchId: string) => void;
  logout: () => void;
  viewMode: "STORE" | "ADMIN";
  setViewMode: (mode: "STORE" | "ADMIN") => void;
  headerSearchQuery: string;
  setHeaderSearchQuery: (q: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── Helper: fetch cart rows from Supabase ────────────────────────────────────
async function fetchCartFromSupabase(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  // Map Supabase row shape → CartItem shape used in context
  return data.map((row: any) => ({
    id: row.product_id, // keep id = product_id so existing cart icon count works
    product_id: row.product_id,
    supabase_row_id: row.id, // store the UUID row id for updates/deletes
    name: row.name,
    price: row.price,
    image: row.image,
    category: row.category,
    quantity: row.quantity,
    // fill remaining CartItem fields with safe defaults
    description: "",
    stock: 0,
    condition: "New",
    brand: "",
    specs: [],
    rating: 0,
    reviews: 0,
    discountPercent: 0,
    likesCount: 0,
    tags: [],
  }));
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [currentPage, setCurrentPageState] = useState<CustomerPage>(
    (localStorage.getItem("currentPage") as CustomerPage) || "home",
  );
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [viewMode, setViewModeState] = useState<"STORE" | "ADMIN">(
    (localStorage.getItem("viewMode") as "STORE" | "ADMIN") || "STORE",
  );
  const [adminPage, setAdminPageState] = useState<AdminPage>(
    (localStorage.getItem("adminPage") as AdminPage) || "Dashboard",
  );
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Wrap setCurrentUser to also load/clear cart ───────────────────────────
  const setCurrentUser = async (user: User | null) => {
    setCurrentUserState(user);
    if (user?.id && user.role === "CUSTOMER") {
      // Load persisted cart from Supabase whenever a customer logs in
      const items = await fetchCartFromSupabase(user.id);
      setCart(items);
    } else if (!user) {
      // Clear cart on logout
      setCart([]);
    }
  };

  // ── On auth state change (handles page reload) ────────────────────────────
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentUserState(null);
          setCart([]);
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── addToCart: writes to Supabase + updates local state ───────────────────
  const addToCart = async (product: Product) => {
    // Always update local state immediately (optimistic — keeps cart icon count working)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === String(product.id));
      if (existing) {
        return prev.map((item) =>
          item.id === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...(product as any),
          id: String(product.id),
          product_id: String(product.id),
          quantity: 1,
        },
      ];
    });

    // If user is not logged in, stop here — local state only
    if (!currentUser?.id) return;

    try {
      // Check if row already exists in Supabase
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", currentUser.id)
        .eq("product_id", String(product.id))
        .maybeSingle();

      if (existing) {
        // Increment quantity
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
        // Insert new row
        await supabase.from("cart_items").insert({
          user_id: currentUser.id,
          product_id: String(product.id),
          name: product.name,
          price: product.price,
          image: product.image ?? "",
          category: product.category ?? "",
          quantity: 1,
        });
      }
    } catch (err) {
      console.error("[addToCart] Supabase error:", err);
    }
  };

  // ── removeFromCart: deletes from Supabase + local state ───────────────────
  const removeFromCart = async (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    if (!currentUser?.id) return;
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("product_id", productId);
  };

  // ── clearCart: clears Supabase + local state ──────────────────────────────
  const clearCart = async () => {
    setCart([]);
    if (!currentUser?.id) return;
    await supabase.from("cart_items").delete().eq("user_id", currentUser.id);
  };

  // ── updateQuantity: updates Supabase + local state ────────────────────────
  const updateQuantity = async (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
    if (!currentUser?.id) return;
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", currentUser.id)
      .eq("product_id", id);
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const addBranch = (branch: Branch) => {
    setBranches((prev) => [branch, ...prev]);
  };

  const updateBranch = (updated: Branch) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBranch = (branchId: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
  };

  const setViewMode = (mode: "STORE" | "ADMIN") => {
    localStorage.setItem("viewMode", mode);
    setViewModeState(mode);
  };

  const setAdminPage = (page: AdminPage) => {
    localStorage.setItem("adminPage", page);
    setAdminPageState(page);
  };

  const setCurrentPage = (page: CustomerPage) => {
    localStorage.setItem("currentPage", page);
    setCurrentPageState(page);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUserState(null);
    setCart([]);
    setCurrentPage("home");
    setAdminPage("Dashboard");
    window.location.href = "/";
  };

  const switchRole = (role: Role) => {
    if (!currentUser) return;
    setCurrentUserState({ ...currentUser, role });
    if (role === "INVENTORY") setAdminPage("Inventory");
    else setAdminPage("Dashboard");
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        currentUser,
        cart,
        branches,
        currentPage,
        adminPage,
        setAdminPage,
        setCurrentPage,
        setProducts,
        setOrders,
        setCurrentUser,
        addToCart,
        removeFromCart,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        switchRole,
        addBranch,
        updateBranch,
        deleteBranch,
        logout,
        updateQuantity,
        isMessageModalOpen,
        setIsMessageModalOpen,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        viewMode,
        setViewMode,
        headerSearchQuery,
        setHeaderSearchQuery,
        loading,
        setLoading,
      }}
    >
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-9999">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Loading…
            </p>
          </div>
        </div>
      )}
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
