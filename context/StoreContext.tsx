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
  addToCart: (product: Product) => void;
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

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

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

    setCurrentUser(null);
    setCurrentPage("home");
    setAdminPage("Dashboard");

    window.location.href = "/";
  };

  const switchRole = (role: Role) => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      role,
    });

    if (role === "INVENTORY") setAdminPage("Inventory");
    else setAdminPage("Dashboard");
  };
  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
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
