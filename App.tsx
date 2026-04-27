import React, { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext";
import { CustomerLayout, AdminLayout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Settings } from "./pages/Settings";
import { Store } from "./pages/Store";
import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";
import { Contact } from "./pages/Contact";
import { Services } from "./pages/Services";
import { Branches } from "./pages/Branches";
import { Updates } from "./pages/Updates";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { generateCustomerResponse } from "./services/geminiService";
import { supabase } from "./lib/supabaseClient";
import { Cart } from "./pages/Cart";
import { Profile } from "./pages/Profile";
import { MyOrders } from "./pages/MyOrders";
import { Policy } from "./pages/Policy";
import { Checkout } from "./pages/Checkout";
import { CareersPage } from "./pages/CareersPage";
import { ContentManager } from "./pages/ContentManager";
import { Orders } from "./pages/Orders";
import { Customers } from "./pages/Customers";
import { AdminCoupons } from "./pages/Coupons";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

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
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // ✅ Check if this is a password recovery redirect FIRST
        const params = new URLSearchParams(window.location.search);
        const isReset = params.get("page") === "reset-password";

        if (isReset) {
          const code = new URLSearchParams(window.location.search).get("code");
          if (code) {
            await supabase.auth.exchangeCodeForSession(code);
          } else {
            await supabase.auth.getSession();
          }
          window.history.replaceState({}, document.title, window.location.pathname);
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
            .single();

          if (staff) {
            setCurrentUser({
              id: user.id,
              name: staff.full_name,
              email: staff.email,
              role: staff.role,
              avatar: "",
            });
            setViewMode("STORE");
            return;
          }

          const { data: profile } = await supabase
            .from("customers")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCurrentUser({
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
          if (
            !stalePage ||
            stalePage === "login" ||
            stalePage === "signup" ||
            stalePage === "checkout"
          ) {
            localStorage.setItem("currentPage", "home");
          }
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
  if (!authReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role === "CUSTOMER" || viewMode === "STORE") {
    return (
      <CustomerLayout>
        {currentPage === "home" && <Home />}
        {currentPage === "shop" && <Store />}
        {currentPage === "about" && <AboutUs />}
        {currentPage === "contact" && <Contact />}
        {currentPage === "services" && <Services />}
        {currentPage === "branches" && <Branches />}
        {currentPage === "updates" && <Updates />}
        {currentPage === "login" && <Login />}
        {currentPage === "signup" && <Signup />}
        {currentPage === "cart" && <Cart />}
        {currentPage === "profile" && <Profile />}
        {currentPage === "orders" && <MyOrders />}
        {currentPage === "policy" && <Policy />}
        {currentPage === "checkout" && <Checkout />}
        {currentPage === "careers" && <CareersPage />}
        {currentPage === "forgot-password" && <ForgotPassword />}
        {currentPage === "reset-password" && <ResetPassword />}
      </CustomerLayout>
    );
  }

  return (
    <AdminLayout>
      {adminPage === "Dashboard" && <Dashboard />}
      {adminPage === "Inventory" && <Inventory />}
      {adminPage === "Settings" && <Settings />}
      {adminPage === "Blogs" && <ContentManager />}
      {adminPage === "Orders" && <Orders />}
      {adminPage === "Customers" && <Customers />}
      {adminPage === "Coupons" && <AdminCoupons />}
    </AdminLayout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
};

export default App;
