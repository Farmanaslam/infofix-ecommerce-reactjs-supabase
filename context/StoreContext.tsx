import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
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
import { ArrowRight, Check, X } from "lucide-react";

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

// ─── Global Cart Toast ────────────────────────────────────────────────────────
const CartToast: React.FC<{
  product: Product | null;
  visible: boolean;
  onGoToCart: () => void;
  onDismiss: () => void;
}> = ({ product, visible, onGoToCart, onDismiss }) => {
  if (!product) return null;
  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to   { transform: translate(-50%, 0);     opacity: 1; }
        }
        @keyframes toastSlideDown {
          from { transform: translate(-50%, 0);     opacity: 1; }
          to   { transform: translate(-50%, 100px); opacity: 0; }
        }
        @keyframes toastProgressBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .cart-toast-enter {
          animation: toastSlideUp 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .cart-toast-exit {
          animation: toastSlideDown 0.32s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        .cart-toast-bar {
          animation: toastProgressBar 2.8s linear forwards;
        }
      `}</style>

      <div
        className={`fixed bottom-6 left-1/2 z-9999 w-[calc(100vw-2rem)] max-w-md
  ${visible ? "cart-toast-enter pointer-events-auto" : "cart-toast-exit pointer-events-none"}`}
        style={{ transform: "translateX(-50%)" }}
      >
        <div className="relative overflow-hidden bg-gray-900 rounded-3xl shadow-2xl shadow-black/50 border border-white/8">
          {/* animated progress bar at bottom */}
          <div
            key={visible ? "bar-in" : "bar-out"}
            className={`absolute bottom-0 left-0 h-0.75 rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 ${visible ? "cart-toast-bar" : ""}`}
          />

          <div className="flex items-center gap-4 px-5 py-4">
            {/* product thumbnail */}
            <div className="relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 border border-white/10">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* green check badge */}
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center shadow">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* text */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400 mb-0.5">
                Added to Cart
              </p>
              <p className="text-sm font-bold text-white truncate leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onGoToCart}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/40"
              >
                View Cart
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={onDismiss}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Helper: fetch cart rows from Supabase ────────────────────────────────────
async function fetchCartFromSupabase(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.product_id,
    product_id: row.product_id,
    supabase_row_id: row.id,
    name: row.name,
    price: row.price,
    image: row.image,
    category: row.category,
    quantity: row.quantity,
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
    images: [],
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

  // ── Toast state ───────────────────────────────────────────────────────────
  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCartToast = (product: Product) => {
    // Cancel any running timer so rapid adds reset the countdown
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastProduct(product);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  // ── Wrap setCurrentUser to also load/clear cart ───────────────────────────
  const setCurrentUser = async (user: User | null) => {
    setCurrentUserState(user);
    if (user?.id && user.role === "CUSTOMER") {
      const items = await fetchCartFromSupabase(user.id);
      setCart(items);
    } else if (!user) {
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

  // ── addToCart: writes to Supabase + updates local state + shows toast ─────
  const addToCart = async (product: Product) => {
    // Optimistic local update
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

    // ← Show the toast for every addToCart call, from any page
    showCartToast(product);

    if (!currentUser?.id) return;

    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", currentUser.id)
        .eq("product_id", String(product.id))
        .maybeSingle();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
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

  // ── removeFromCart ────────────────────────────────────────────────────────
  const removeFromCart = async (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    if (!currentUser?.id) return;
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("product_id", productId);
  };

  // ── clearCart ─────────────────────────────────────────────────────────────
  const clearCart = async () => {
    setCart([]);
    if (!currentUser?.id) return;
    await supabase.from("cart_items").delete().eq("user_id", currentUser.id);
  };

  // ── updateQuantity ────────────────────────────────────────────────────────
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

      {/* ── Global Cart Toast — renders on top of everything, always ── */}
      <CartToast
        product={toastProduct}
        visible={toastVisible}
        onGoToCart={() => {
          setToastVisible(false);
          setCurrentPage("cart");
        }}
        onDismiss={() => {
          if (toastTimer.current) clearTimeout(toastTimer.current);
          setToastVisible(false);
        }}
      />

      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
