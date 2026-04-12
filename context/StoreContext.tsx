import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
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
import { INITIAL_PRODUCTS, OPERATORS, INITIAL_BRANCHES } from "../constants";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Check, X } from "lucide-react";
import { AppNotification } from "../types";
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
  | "Blogs";

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
  updateQuantity: (id: string, quantity: number) => void;
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
  totalRevenue: number;
  activeCustomersCount: number;
  isMessageModalOpen: boolean;
  setIsMessageModalOpen: (open: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (sub: string | null) => void;
  notifications: AppNotification[];
  pushNotification: (
    n: Omit<AppNotification, "id" | "created_at" | "read_by">,
  ) => Promise<void>;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  fetchDashboardData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ─── Cart Toast ───────────────────────────────────────────────────────────────
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
        @keyframes toastProgressBar { from { width: 100%; } to { width: 0%; } }
        .cart-toast-enter { animation: toastSlideUp 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .cart-toast-exit  { animation: toastSlideDown 0.32s cubic-bezier(0.4,0,1,1) forwards; }
        .cart-toast-bar   { animation: toastProgressBar 2.8s linear forwards; }
      `}</style>
      <div
        className={`fixed bottom-6 left-1/2 z-9999 w-[calc(100vw-2rem)] max-w-md
          ${visible ? "cart-toast-enter pointer-events-auto" : "cart-toast-exit pointer-events-none"}`}
        style={{ transform: "translateX(-50%)" }}
      >
        <div className="relative overflow-hidden bg-gray-900 rounded-3xl shadow-2xl shadow-black/50 border border-white/8">
          <div
            key={visible ? "bar-in" : "bar-out"}
            className={`absolute bottom-0 left-0 h-0.75 rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 ${visible ? "cart-toast-bar" : ""}`}
          />
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="relative shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 border border-white/10">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-gray-900 flex items-center justify-center shadow">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>
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
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onGoToCart}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-900/40"
              >
                View Cart <ArrowRight className="w-3 h-3" />
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

// ─── Helper: fetch cart from Supabase ─────────────────────────────────────────
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
    model: "",
  }));
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  // Start empty — populated from Supabase, not mock data
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const savedPage = localStorage.getItem("currentPage") as CustomerPage;
  const safePage: CustomerPage =
    savedPage && !["login", "signup"].includes(savedPage) ? savedPage : "home";
  const [currentPage, setCurrentPageState] = useState<CustomerPage>(safePage);
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
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeCustomersCount, setActiveCustomersCount] = useState(0);

  const [toastProduct, setToastProduct] = useState<Product | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const currentUserRef = useRef<User | null>(null);
  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error && data) setNotifications(data as AppNotification[]);
    };

    fetchNotifications();

    // Unique channel name per mount to avoid stale duplicate channels
    const channelName = `notifications-realtime-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) =>
            [payload.new as AppNotification, ...prev].slice(0, 50),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as AppNotification;
          setNotifications((prev) =>
            prev.map((n) => {
              if (n.id !== updated.id) return n;
              const mergedReadBy = Array.from(
                new Set([...(n.read_by ?? []), ...(updated.read_by ?? [])]),
              );
              return { ...updated, read_by: mergedReadBy };
            }),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== (payload.old as AppNotification).id),
          );
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Notifications] Realtime channel active");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);
  const pushNotification = useCallback(
    async (n: Omit<AppNotification, "id" | "created_at" | "read_by">) => {
      const newNotif: AppNotification = {
        ...n,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        read_by: [],
        created_at: new Date().toISOString(),
      };
      await supabase.from("notifications").insert(newNotif);
    },
    [],
  );

  const markAllNotificationsRead = useCallback(async () => {
    const user = currentUserRef.current;
    if (!user) return;

    // Optimistically update local state immediately
    setNotifications((prev) =>
      prev.map((n) =>
        n.read_by.includes(user.id)
          ? n
          : { ...n, read_by: [...n.read_by, user.id] },
      ),
    );

    // Fetch ALL notifications, filter unread in JS (avoids broken jsonb filter)
    const { data } = await supabase.from("notifications").select("id, read_by");

    if (data && data.length > 0) {
      const unread = data.filter(
        (n: { id: string; read_by: string[] }) =>
          !Array.isArray(n.read_by) || !n.read_by.includes(user.id),
      );
      if (unread.length > 0) {
        await Promise.all(
          unread.map((n: { id: string; read_by: string[] }) =>
            supabase
              .from("notifications")
              .update({ read_by: [...(n.read_by ?? []), user.id] })
              .eq("id", n.id),
          ),
        );
      }
    }
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    // Only ADMIN should truly delete; others just clear local view
    if (currentUser?.role === "ADMIN") {
      await supabase.from("notifications").delete().neq("id", "no-op");
    }
  }, [currentUser]);
  // 1. Add this ref to track if already fetching (prevents duplicate calls)
  const isFetchingRef = useRef(false);

  // 2. Replace the entire dashboard useEffect with this:
  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      type OrderRow = {
        id: string;
        order_number: string;
        user_id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string | null;
        total_amount: string | number;
        subtotal: string | number;
        tax: string | number;
        delivery_charge: string | number;
        status: string;
        payment_status: string | null;
        payment_method: string | null;
        tracking_id: string | null;
        courier_name: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      };
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, order_number, user_id, customer_name, customer_email, customer_phone, " +
            "total_amount, subtotal, tax, delivery_charge, status, payment_status, " +
            "payment_method, tracking_id, courier_name, notes, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .returns<OrderRow[]>();

      if (!ordersError && ordersData) {
        setOrders(ordersData as unknown as Order[]);
        const revenue = ordersData.reduce(
          (sum, o) => sum + (parseFloat(String(o.total_amount)) || 0),
          0,
        );
        setTotalRevenue(revenue);
      }

      const { count, error: countError } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true });
      if (!countError && count !== null) setActiveCustomersCount(count);

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;
      if (sessionUser) {
        const { data: staffRow } = await supabase
          .from("staffs")
          .select("full_name, email, role, avatar_url")
          .eq("id", sessionUser.id)
          .maybeSingle();
        if (staffRow) {
          setCurrentUserState(
            (prev) =>
              ({
                ...(prev ?? {}),
                id: sessionUser.id,
                name: staffRow.full_name,
                email: staffRow.email,
                role: staffRow.role,
                avatar_url: staffRow.avatar_url,
              }) as any,
          );
        }
      }
    } catch (err) {
      console.error("[StoreContext] fetchDashboardData error:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // TO:
  useEffect(() => {
    // Wait for Supabase to restore session, THEN fetch
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "INITIAL_SESSION") {
          // Auth is now ready (session may be null for logged-out users)
          fetchDashboardData();
        } else if (event === "SIGNED_IN") {
          fetchDashboardData();
        }
      },
    );

    const channel = supabase
      .channel("orders-watch-global")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchDashboardData(),
      )
      .subscribe();

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  const showCartToast = useCallback((product: Product) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastProduct(product);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2800);
  }, []);

  const setCurrentUser = useCallback(async (user: User | null) => {
    setCurrentUserState(user);
    currentUserRef.current = user;
    if (user?.id && user.role === "CUSTOMER") {
      const items = await fetchCartFromSupabase(user.id);
      setCart(items);
    } else if (!user) {
      setCart([]);
    }
    // Re-fetch notifications so read_by state is fresh for this user
    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setNotifications(data as AppNotification[]);
    }
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_OUT") {
          setCurrentUserState(null);
          setCart([]);
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
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
    },
    [currentUser?.id, showCartToast],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      if (!currentUser?.id) return;
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("product_id", productId);
    },
    [currentUser?.id],
  );

  const clearCart = useCallback(async () => {
    setCart([]);
    if (!currentUser?.id) return;
    await supabase.from("cart_items").delete().eq("user_id", currentUser.id);
  }, [currentUser?.id]);

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
      if (!currentUser?.id) return;
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("user_id", currentUser.id)
        .eq("product_id", id);
    },
    [currentUser?.id],
  );

  const addProduct = useCallback(
    (p: Product) => setProducts((prev) => [p, ...prev]),
    [],
  );
  const updateProduct = useCallback(
    (u: Product) =>
      setProducts((prev) => prev.map((p) => (p.id === u.id ? u : p))),
    [],
  );
  const deleteProduct = useCallback(
    (id: string) => setProducts((prev) => prev.filter((p) => p.id !== id)),
    [],
  );
  const addOrder = useCallback(
    (o: Order) => setOrders((prev) => [o, ...prev]),
    [],
  );
  const addBranch = useCallback(
    (b: Branch) => setBranches((prev) => [b, ...prev]),
    [],
  );
  const updateBranch = useCallback(
    (u: Branch) =>
      setBranches((prev) => prev.map((b) => (b.id === u.id ? u : b))),
    [],
  );
  const deleteBranch = useCallback(
    (id: string) => setBranches((prev) => prev.filter((b) => b.id !== id)),
    [],
  );

  const setViewMode = useCallback((mode: "STORE" | "ADMIN") => {
    localStorage.setItem("viewMode", mode);
    setViewModeState(mode);
  }, []);

  const setAdminPage = useCallback((page: AdminPage) => {
    localStorage.setItem("adminPage", page);
    setAdminPageState(page);
  }, []);
  const setCurrentPage = useCallback(
    (page: CustomerPage) => {
      // If already on same page → force scroll to top
      if (currentPage === page) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      localStorage.setItem("currentPage", page);
      setCurrentPageState(page);

      // Also scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 0);
    },
    [currentPage],
  );

  const logout = useCallback(async () => {
    if (currentUser) {
      await supabase.from("notifications").insert({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "info",
        title:
          currentUser.role === "CUSTOMER" ? "Customer Logout" : "Staff Logout",
        message:
          currentUser.role === "CUSTOMER"
            ? `${currentUser.name} (${currentUser.email}) logged out.`
            : `${currentUser.name} (${currentUser.role}) signed out of the admin portal.`,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        read_by: [],
        created_at: new Date().toISOString(),
      });
    }
    await supabase.auth.signOut();
    setCurrentUserState(null);
    setCart([]);
    setCurrentPageState("home");
    setAdminPageState("Dashboard");
    window.location.href = "/";
  }, [currentUser]);

  const switchRole = useCallback(
    (role: Role) => {
      if (!currentUser) return;
      setCurrentUserState({ ...currentUser, role });
      setAdminPageState(role === "INVENTORY" ? "Inventory" : "Dashboard");
    },
    [currentUser],
  );

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
        updateQuantity,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        switchRole,
        addBranch,
        updateBranch,
        deleteBranch,
        logout,
        viewMode,
        setViewMode,
        headerSearchQuery,
        setHeaderSearchQuery,
        loading,
        setLoading,
        totalRevenue,
        activeCustomersCount,
        isMessageModalOpen,
        setIsMessageModalOpen,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        notifications,
        pushNotification,
        markAllNotificationsRead,
        clearNotifications,
        fetchDashboardData,
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
