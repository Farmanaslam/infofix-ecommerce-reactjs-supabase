import React, { lazy, Suspense, useEffect, useState } from "react";
import { AdminPage, StoreProvider, useStore } from "./context/StoreContext";
import { CustomerLayout, AdminLayout } from "./components/Layout";
import { supabase } from "./lib/supabaseClient";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Store = lazy(() => import('./pages/Store').then(m => ({ default: m.Store })))
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })))
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })))
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })))
const Branches = lazy(() => import('./pages/Branches').then(m => ({ default: m.Branches })))
const Updates = lazy(() => import('./pages/Updates').then(m => ({ default: m.Updates })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })))
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const MyOrders = lazy(() => import('./pages/MyOrders').then(m => ({ default: m.MyOrders })))
const Policy = lazy(() => import('./pages/Policy').then(m => ({ default: m.Policy })))
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })))
const CareersPage = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Inventory = lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })))
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })))
const Customers = lazy(() => import('./pages/Customers').then(m => ({ default: m.Customers })))
const ContentManager = lazy(() => import('./pages/ContentManager').then(m => ({ default: m.ContentManager })))
const AdminCoupons = lazy(() => import('./pages/Coupons').then(m => ({ default: m.AdminCoupons })))
const CareerPortal = lazy(() => import('./pages/Careerportal').then(m => ({ default: m.CareerPortal })))
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))
const Campaigns = lazy(() => import('./pages/Campaigns').then(m => ({ default: m.Campaigns })))
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
)
const Main: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentPage,
    adminPage,
    viewMode,
    setViewMode,
    setAdminPage,
    fetchDashboardData,
    setCurrentPage,
  } = useStore();
  const [authReady, setAuthReady] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check if this is a password recovery redirect FIRST
        const params = new URLSearchParams(window.location.search);
        const isReset = params.get("page") === "reset-password";

        if (isReset) {
          const code = new URLSearchParams(window.location.search).get("code");
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          } else {
            await supabase.auth.getSession();
          }
          window.history.replaceState({}, document.title, '/reset-password');
          setCurrentPage("reset-password");
          return;
        }
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const user = data.session.user;

          const { data: staff } = await supabase
            .from("staffs")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          if (staff) {
            setCurrentUser({
              id: user.id,
              name: staff.full_name,
              email: staff.email,
              role: staff.role,
              avatar: "",
            });
            const saved = localStorage.getItem("viewMode") as "STORE" | "ADMIN" | null;
            setViewMode(saved ?? "STORE");
            return;
          }

          const { data: profile } = await supabase
            .from("customers")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            await setCurrentUser({
              id: user.id,
              name: profile.full_name,
              email: profile.email,
              role: "CUSTOMER",
              avatar: `https://i.pravatar.cc/150?u=${user.id}`,
            });
          } else {
            const fullName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "User";
            const email = user.email ?? "";

            const { error: insertError } = await supabase
              .from("customers")
              .insert({
                id: user.id,
                full_name: fullName,
                email: email,
                phone: "",
                address1: "",
                address2: "",
                city: "",
                state: "",
                pincode: "",
                country: "India",
                role: "CUSTOMER",
              });

            if (!insertError) {
              await supabase.from("notifications").insert({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                type: "info",
                title: "New Google Signup",
                message: `${fullName} (${email}) signed up via Google.`,
                user_id: user.id,
                user_name: fullName,
                user_role: "CUSTOMER",
                read_by: [],
                created_at: new Date().toISOString(),
              });
            }

            setCurrentUser({
              id: user.id,
              name: fullName,
              email: email,
              role: "CUSTOMER",
              avatar:
                user.user_metadata?.avatar_url ||
                `https://i.pravatar.cc/150?u=${user.id}`,
            });
          }
          const stalePage = localStorage.getItem("currentPage");
        }
      } finally {
        setAuthReady(true);
      }
    };
    restoreSession();
  }, []);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("✅ SW registered:", reg.scope))
          .catch((err) => console.error("❌ SW failed:", err));
      });
    }
  }, []); // Runs once on app mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: currentPage,
        page_path: `/${currentPage}`,
        page_location: window.location.origin + "/" + currentPage,
      });
    }
  }, [currentPage]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setCurrentPage("reset-password");
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const urlToPage: Record<string, AdminPage> = {
      '/admin/dashboard': 'Dashboard',
      '/admin/inventory': 'Inventory',
      '/admin/orders': 'Orders',
      '/admin/customers': 'Customers',
      '/admin/blogs': 'Blogs',
      '/admin/campaigns': 'Campaigns',
      '/admin/coupons': 'Coupons',
      '/admin/careers': 'Careers',
      '/admin/settings': 'Settings',
    };
    const p = urlToPage[location.pathname];
    if (p && p !== adminPage) setAdminPage(p);
  }, [location.pathname]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = currentUser && currentUser.role !== 'CUSTOMER' && viewMode === 'ADMIN'
  if (isAdmin) {
    return (
      <AdminLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/blogs" element={<ContentManager />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/campaigns" element={<Campaigns />} />
            <Route path="/admin/careers" element={<CareerPortal />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AdminLayout>
    )
  }

  return (
    <CustomerLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* ── CORE PAGES ── */}
          <Route path="/shop" element={<Store />} />
          <Route path="/products/:slug" element={<Store />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/blog" element={<Updates />} />
          <Route path="/blog/:slug" element={<Updates />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── SEO SHOP URLS — Infofix new store ── */}
          <Route path="/buy-laptop" element={<Store />} />
          <Route path="/buy-laptop-durgapur" element={<Store />} />
          <Route path="/buy-laptop-asansol" element={<Store />} />
          <Route path="/buy-laptop-west-bengal" element={<Store />} />
          <Route path="/buy-laptop-bengal" element={<Store />} />
          <Route path="/buy-gaming-laptop-durgapur" element={<Store />} />
          <Route path="/buy-desktop-pc" element={<Store />} />
          <Route path="/buy-desktop-pc-durgapur" element={<Store />} />
          <Route path="/buy-desktop-pc-asansol" element={<Store />} />
          <Route path="/buy-gaming-pc-durgapur" element={<Store />} />
          <Route path="/gaming-pc-durgapur" element={<Store />} />
          <Route path="/custom-pc-build-durgapur" element={<Store />} />
          <Route path="/computer-shop-durgapur" element={<Store />} />
          <Route path="/computer-shop-asansol" element={<Store />} />
          <Route path="/laptop-shop-durgapur" element={<Store />} />
          <Route path="/laptop-under-30000" element={<Store />} />
          <Route path="/laptop-under-50000" element={<Store />} />
          <Route path="/gaming-laptop-under-60000" element={<Store />} />
          <Route path="/best-laptop-for-students" element={<Store />} />
          <Route path="/best-laptop-for-programming" element={<Store />} />
          <Route path="/refurbished-laptop-under-20000" element={<Store />} />
          {/* ── SEO SHOP URLS — Refurbished ── */}
          <Route path="/buy-refurbished-laptop" element={<Store />} />
          <Route path="/buy-refurbished-laptop-durgapur" element={<Store />} />
          <Route path="/buy-refurbished-laptop-asansol" element={<Store />} />
          <Route path="/buy-refurbished-laptop-west-bengal" element={<Store />} />
          <Route path="/refurbished-laptop-durgapur" element={<Store />} />
          <Route path="/refurbished-laptop-asansol" element={<Store />} />
          <Route path="/refurbished-desktop-durgapur" element={<Store />} />
          <Route path="/second-hand-laptop-durgapur" element={<Store />} />
          <Route path="/certified-refurbished-laptop" element={<Store />} />

          {/* ── SEO SHOP URLS — Wholesale ── */}
          <Route path="/wholesale-laptop-west-bengal" element={<Store />} />
          <Route path="/wholesale-desktop-durgapur" element={<Store />} />
          <Route path="/bulk-laptop-supplier-durgapur" element={<Store />} />
          <Route path="/computer-wholesale-durgapur" element={<Store />} />

          {/* ── SEO SERVICE URLS ── */}
          <Route path="/computer-repair-durgapur" element={<Branches />} />
          <Route path="/laptop-repair-durgapur" element={<Branches />} />
          <Route path="/laptop-repair-asansol" element={<Branches />} />

          {/* ── Ukhra ── */}
          <Route path="/buy-laptop-ukhra" element={<Store />} />
          <Route path="/buy-laptop-new-ukhra" element={<Store />} />
          <Route path="/buy-laptop-second-hand-ukhra" element={<Store />} />
          <Route path="/refurbished-laptop-ukhra" element={<Store />} />
          <Route path="/buy-desktop-ukhra" element={<Store />} />
          <Route path="/computer-shop-ukhra" element={<Store />} />

          {/* ── India-wide ── */}
          <Route path="/buy-laptop-india" element={<Store />} />
          <Route path="/laptop-shop-india" element={<Store />} />
          <Route path="/buy-desktop-india" element={<Store />} />
          <Route path="/refurbished-laptop-india" element={<Store />} />
          <Route path="/computer-shop-india" element={<Store />} />
          <Route path="/buy-gaming-laptop-india" element={<Store />} />
          <Route path="/buy-laptop-near-me" element={<Store />} />
          <Route path="/computer-store-near-me" element={<Store />} />
          <Route path="/laptop-store-near-me" element={<Store />} />
          {/* ── NEW SEO URLs ── */}
          <Route path="/buy-laptop-online-india" element={<Store />} />
          <Route path="/refurbished-dell-laptop-india" element={<Store />} />
          <Route path="/refurbished-hp-laptop-india" element={<Store />} />
          <Route path="/refurbished-lenovo-laptop-india" element={<Store />} />
          <Route path="/buy-laptop-under-20000-india" element={<Store />} />
          <Route path="/buy-laptop-under-40000-india" element={<Store />} />
          <Route path="/gaming-laptop-under-70000-india" element={<Store />} />
          <Route path="/best-laptop-for-college-students-india" element={<Store />} />
          <Route path="/best-laptop-for-engineering-students-india" element={<Store />} />
          <Route path="/best-laptop-for-video-editing-india" element={<Store />} />
          <Route path="/best-business-laptop-india" element={<Store />} />
          <Route path="/custom-gaming-pc-under-50000" element={<Store />} />
          <Route path="/custom-gaming-pc-under-80000" element={<Store />} />
          <Route path="/refurbished-gaming-laptop-india" element={<Store />} />
          <Route path="/buy-laptop-accessories-online-india" element={<Store />} />
          <Route path="/buy-desktop-pc-under-30000-india" element={<Store />} />
          <Route path="/buy-desktop-pc-under-50000-india" element={<Store />} />
          <Route path="/refurbished-desktop-pc-india" element={<Store />} />
          <Route path="/wholesale-laptop-supplier-india" element={<Store />} />
          <Route path="/dell-laptop-durgapur" element={<Store />} />
          <Route path="/hp-laptop-durgapur" element={<Store />} />
          <Route path="/lenovo-laptop-durgapur" element={<Store />} />
          <Route path="/laptop-repair-service-asansol" element={<Store />} />
          <Route path="/buy-laptop-bardhaman" element={<Store />} />
          <Route path="/computer-shop-bardhaman" element={<Store />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </CustomerLayout>
  )
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;
