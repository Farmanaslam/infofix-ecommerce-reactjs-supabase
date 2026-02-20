import React, { useState, useEffect } from "react";
import { useStore, CustomerPage, AdminPage } from "../context/StoreContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  User as UserIcon,
  Store,
  ChevronRight,
  X,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Mail,
  Briefcase,
  Star,
  Gift,
  HelpCircle,
  MessageSquare,
  CreditCard,
  Download,
  Phone,
} from "lucide-react";

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { cart, switchRole, currentUser, logout, currentPage, setCurrentPage } =
    useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentPage]);
  const navLinks: { label: string; id: CustomerPage }[] = [
    { label: "Home", id: "home" },
    { label: "About Us", id: "about" },
    { label: "Shop", id: "shop" },
    { label: "Services", id: "services" },
    { label: "Branches", id: "branches" },
    { label: "Updates", id: "updates" },
    { label: "Careers", id: "careers" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentPage("home")}
              className="text-2xl font-black bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Infofix
            </button>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-500">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setCurrentPage(link.id)}
                  className={`hover:text-indigo-600 transition-colors relative py-2 ${currentPage === link.id ? "text-indigo-600" : ""}`}
                >
                  {link.label}
                  {currentPage === link.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("cart")}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {!currentUser && (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={() => setCurrentPage("login")}
                  className="text-sm font-semibold text-gray-700 hover:text-indigo-600 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentPage("signup")}
                  className="text-sm font-bold px-4 py-2 bg-indigo-600 text-white rounded-xl cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {currentUser && currentUser.role === "CUSTOMER" && (
              <div className="hidden md:flex gap-3">
                <div className="relative group">
                  <button className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors cursor-pointer">
                    My Account
                  </button>

                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <button
                      onClick={() => setCurrentPage("orders")}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      My Orders
                    </button>

                    <button
                      onClick={() => setCurrentPage("profile")}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border-t border-gray-100"
                    >
                      Profile
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const confirmLogout = window.confirm(
                      "Are you sure you want to log out?",
                    );
                    if (confirmLogout) {
                      logout();
                      setCurrentPage("home");
                    }
                  }}
                  className="text-sm font-bold text-red-500 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}

            <div className="hidden md:flex gap-3">
              <button
                onClick={() => switchRole("MANAGER")}
                className="text-xs font-bold px-4 py-2 bg-gray-900 text-white rounded-xl cursor-pointer"
              >
                Staff Portal
              </button>
            </div>

            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-b py-4 px-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentPage(link.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium ${currentPage === link.id ? "bg-indigo-50 text-indigo-600" : "text-gray-600"}`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 bg-white">{children}</main>

      {/* FOOTER */}
      <footer className="bg-[#172337] text-white pt-16 pb-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              About
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => setCurrentPage("contact")}
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("about")}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("services")}
                  className="hover:text-white transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("careers")}
                  className="hover:text-white transition-colors"
                >
                  Careers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("branches")}
                  className="hover:text-white transition-colors"
                >
                  Our Branches
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("updates")}
                  className="hover:text-white transition-colors"
                >
                  Our Blog
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Help
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button className="hover:text-white transition-colors">
                  Payments
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Cancellation & Returns
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  FAQ
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Raise Your Query
                </button>
              </li>
              <li className="flex items-center gap-1">
                <Download className="w-3 h-3 text-orange-500" />
                <button className="hover:text-white transition-colors">
                  Download Apk
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Policy
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Privacy & Security
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Shipping
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Social
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Facebook className="w-3 h-3" />{" "}
                <button className="hover:text-white transition-colors">
                  Facebook
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Twitter className="w-3 h-3" />{" "}
                <button className="hover:text-white transition-colors">
                  Twitter
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Youtube className="w-3 h-3" />{" "}
                <button className="hover:text-white transition-colors">
                  YouTube
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-3 h-3" />{" "}
                <button className="hover:text-white transition-colors">
                  Instagram
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Linkedin className="w-3 h-3" />{" "}
                <button className="hover:text-white transition-colors">
                  Linkedin
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Mail Us:
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <p className="text-xs text-gray-400 break-all">
              infofixcomputers1@gmail.com
            </p>
          </div>
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Office Address
            </h4>
            <div className="w-6 h-[1px] bg-gray-500 mb-4"></div>
            <div className="text-[11px] text-gray-400 leading-relaxed space-y-4">
              <p>
                Address: Ananda Gopal Mukherjee Sarani Rd, near BINA GAS,
                Kamalpur Plot, Benacity, Durgapur, West Bengal 713213
              </p>
              <p className="flex items-center gap-2">Call Us- 8293295257</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700/50 pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-gray-300">
              <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                <Briefcase className="w-4 h-4 text-yellow-500" />
                <span>Became A seller</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Advertise</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                <Gift className="w-4 h-4 text-yellow-500" />
                <span>Gift Cards</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white cursor-pointer">
                <HelpCircle className="w-4 h-4 text-yellow-500" />
                <span>Help Center</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              © {new Date().getFullYear()} Infofix Computers
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "VISA",
                "MASTERCARD",
                "MAESTRO",
                "AMEX",
                "DINERS",
                "DISCOVER",
                "RUPAY",
                "NETBANKING",
                "COD",
                "EMI",
              ].map((method) => (
                <div
                  key={method}
                  className="h-6 px-2 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[8px] font-black text-gray-400 grayscale hover:grayscale-0 transition-all cursor-default"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* MESSAGE US FLOATING BUTTON */}
      <button
        onClick={() => setIsMessageModalOpen(true)}
        className="fixed bottom-6 right-6 z-[60] bg-[#25D366] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform group animate-bounce-subtle"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 fill-white text-[#25D366]" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#25D366]"></span>
        </div>
        <span className="font-bold text-sm tracking-tight">Message Us</span>
      </button>
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          {/* Modal Wrapper */}
          <div className="bg-white w-full max-w-lg h-[90vh] rounded-3xl shadow-2xl flex flex-col animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 relative">
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                Contact Infofix Support
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                We usually reply within 24 hours.
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <form
                action="https://formsubmit.co/infofixcomputers1@gmail.com"
                method="POST"
                className="space-y-4"
              >
                <input type="hidden" name="_captcha" value="false" />
                <input
                  type="hidden"
                  name="_subject"
                  value="New Query from Infofix Website"
                />

                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Order / Product / Complaint / Other"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                    placeholder="Write your query here..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
          @keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
      `,
        }}
      />
    </div>
  );
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, switchRole, adminPage, setAdminPage } = useStore();
  const navItems: { name: AdminPage; icon: any; role: string[] }[] = [
    { name: "Dashboard", icon: LayoutDashboard, role: ["MANAGER"] },
    { name: "Inventory", icon: Package, role: ["MANAGER", "INVENTORY"] },
    { name: "Orders", icon: ShoppingCart, role: ["MANAGER", "SUPPORT"] },
    { name: "Customers", icon: Users, role: ["MANAGER", "SUPPORT"] },
    { name: "Settings", icon: Settings, role: ["MANAGER"] },
  ];

  const visibleNav = navItems.filter((item) =>
    item.role.includes(currentUser.role),
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0 shadow-sm">
        <div className="p-8 border-b  border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Store className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight">
              NexusAdmin
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-200">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {visibleNav.map((item) => (
            <button
              key={item.name}
              onClick={() => setAdminPage(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all group ${
                adminPage === item.name
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform ${adminPage === item.name ? "" : "group-hover:scale-110"}`}
              />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t  border-gray-200 space-y-3">
          <button
            onClick={() => switchRole("CUSTOMER")}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all shadow-sm"
          >
            <Store className="w-5 h-5" />
            Store View
          </button>
          <button
            onClick={() => {
              const confirmLogout = window.confirm(
                "Are you sure you want to sign out?",
              );
              if (confirmLogout) {
                switchRole("CUSTOMER");
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b  border-gray-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-400">
            <span className="text-gray-900">Control Center</span>
            <ChevronRight className="w-4 h-4" />
            <span className="capitalize">{adminPage}</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-green-500 font-bold uppercase">
                  Active
                </p>
              </div>
              <img
                src={currentUser.avatar}
                alt=""
                className="w-10 h-10 rounded-full border-2 border-indigo-100"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};
