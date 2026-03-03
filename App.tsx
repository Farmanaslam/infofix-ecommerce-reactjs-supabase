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
const Main: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentPage,
    adminPage,
    viewMode,
    setViewMode,
    setAdminPage,
  } = useStore();
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const user = data.session.user;

          // 🔹 Check if staff
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
            if (!localStorage.getItem("adminPage")) {
              setAdminPage("Dashboard");
            }
            return;
          }

          // 🔹 Otherwise check customer
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
              avatar: "",
            });
          }
        }
      } finally {
        setAuthReady(true); // ← ALWAYS runs, even for staff, even on error
      }
    };
    restoreSession();
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
      </CustomerLayout>
    );
  }

  return (
    <AdminLayout>
      {adminPage === "Dashboard" && <Dashboard />}
      {adminPage === "Inventory" && <Inventory />}
      {adminPage === "Settings" && <Settings />}
      {adminPage === "Content" && <ContentManager />}
      {adminPage === "Orders" && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="p-12 bg-white rounded-[40px] border shadow-2xl shadow-gray-200 max-w-lg">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">
              Order Processing
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              The order management module is currently being optimized for bulk
              processing. Please check back shortly.
            </p>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      {adminPage === "Customers" && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="p-12 bg-white rounded-[40px] border shadow-2xl shadow-gray-200 max-w-lg">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">
              Support Terminal
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              The customer interface is undergoing a major AI architectural
              upgrade. Expected uptime: 24h.
            </p>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-2/3 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
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
