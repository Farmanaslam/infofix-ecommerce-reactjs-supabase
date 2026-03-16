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
  Store,
  ChevronRight,
  X,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Briefcase,
  Star,
  Gift,
  HelpCircle,
  MessageSquare,
  Download,
  Zap,
} from "lucide-react";
import { CATEGORIES, SUBCATEGORIES } from "../constants";
import { NotificationPanel } from "@/pages/NotificationPanel";
import { InstallPWA } from "./InstallPWA";

export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    cart,
    currentUser,
    logout,
    currentPage,
    setCurrentPage,
    setViewMode,
    setHeaderSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    isMessageModalOpen,
    setIsMessageModalOpen,
  } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<"menu" | "categories">("menu");
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<
    string | null
  >(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

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

  const handleSearch = () => {
    if (!localSearch.trim()) return;
    setHeaderSearchQuery(localSearch.trim());
    setCurrentPage("shop");
  };

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const userInitials = currentUser?.name
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ═══════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════ */}
      <header
        className="w-full sticky top-0 z-50 bg-white transition-all duration-300"
        style={{
          boxShadow: scrolled
            ? "0 4px 32px -4px rgba(15,23,42,0.14), 0 1px 0 0 #e2e8f0"
            : "0 1px 0 0 #e2e8f0",
        }}
      >
        {/* ── PROMO STRIP ───────────────────────── */}
        <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 h-9 flex items-center justify-center px-4 gap-3">
          {/* subtle shimmer line */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full bg-linear-to-b from-transparent via-indigo-400/20 to-transparent" />
          </div>
          <Zap className="w-3 h-3 text-amber-400 shrink-0" />
          <p className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase truncate">
            Free delivery above ₹999 &nbsp;·&nbsp; Open 7 days &nbsp;·&nbsp;
            Expert Tech Support
          </p>
          <Zap className="w-3 h-3 text-amber-400 shrink-0" />
        </div>

        {/* ── UTILITY BAR (desktop only) ────────── */}
        <div className="hidden lg:block border-b border-slate-100 bg-slate-50/70">
          <div className="px-20 h-9 flex items-center justify-between">
            {/* social */}
            <div className="flex items-center gap-3.5">
              {[
                {
                  href: "https://www.facebook.com/profile.php?id=61559131500584",
                  icon: "bi-facebook",
                  color: "text-blue-600",
                },
                {
                  href: "https://www.instagram.com/infofixcomputers11?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
                  icon: "bi-instagram",
                  color: "text-pink-500",
                },
                {
                  href: "https://www.youtube.com/@infofixcomputers",
                  icon: "bi-youtube",
                  color: "text-red-500",
                },
                {
                  href: "https://api.whatsapp.com/send?phone=8293295257&text=hi",
                  icon: "bi-whatsapp",
                  color: "text-emerald-500",
                },
              ].map(({ href, icon, color }) => (
                <a
                  key={icon}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${color} opacity-70 hover:opacity-100 transition-opacity duration-150`}
                >
                  <span className={`bi ${icon} text-xs`} />
                </a>
              ))}
              <span className="h-3.5 w-px bg-slate-200 mx-1" />
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                Follow us
              </span>
            </div>
            {/* links */}
            <div className="flex items-center text-[11px] font-semibold text-slate-500 divide-x divide-slate-200">
              {[
                { id: "contact", label: "Contact" },
                { id: "about", label: "About" },
                { id: "careers", label: "Careers" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setCurrentPage(id as CustomerPage)}
                  className="px-3 hover:text-indigo-600 transition-colors duration-150"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN ROW ──────────────────────────── */}
        <div className="h-16 lg:h-20 flex items-center px-4 lg:px-20 bg-white gap-3 lg:gap-8 relative">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="lg:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ── LOGO ── */}
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2.5 shrink-0 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 group"
          >
            <div className="relative">
              <img
                src="/icons/favicon.svg"
                alt="Infofix"
                className="h-10 w-11 lg:h-11 lg:w-14 object-contain"
              />

              {/* glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-indigo-400/0 group-hover:bg-indigo-400/10 transition-colors duration-200" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[1.45rem] lg:text-[1.65rem] font-black tracking-tight">
                <span className="text-indigo-600">Info</span>
                <span className="text-slate-900">fix</span>
              </span>
              <span className="text-[8.5px] font-bold tracking-[0.2em] text-slate-400 uppercase hidden lg:block">
                Computers
              </span>
            </div>
          </button>

          {/* ── SEARCH (desktop) ── */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-auto">
            {/* pill container with focus glow via CSS below */}
            <div className="search-pill flex w-full bg-slate-50 border border-slate-200 rounded-full overflow-hidden transition-all duration-200 hover:border-indigo-300">
              <input
                type="text"
                placeholder="Search laptops, desktops, components…"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-5 py-2.5 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
              />
              <button
                onClick={handleSearch}
                className="m-1 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full flex items-center gap-1.5 text-xs font-bold transition-colors duration-150"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Search</span>
              </button>
            </div>
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-1.5 lg:gap-3 ml-auto lg:ml-0">
            {/* Phone info (xl+) */}
            <div className="hidden xl:flex flex-col text-xs leading-tight pr-4 mr-1 border-r border-slate-100">
              <span className="font-bold text-slate-700">
                📞 <span className="text-indigo-600">8293295257</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                infofixcomputers1@gmail.com
              </span>
            </div>

            {/* Account / Auth — desktop */}
            <div
              className="hidden lg:block relative"
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              {!currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-150"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentPage("signup")}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full text-sm font-bold transition-all duration-150"
                    style={{ boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}
                  >
                    Register
                  </button>
                </div>
              ) : (
                <>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/60 transition-all duration-150 text-sm font-semibold text-slate-700">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[10px] font-black">
                      {userInitials}
                    </div>
                    <span>My Account</span>
                    <ChevronRight
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isAccountOpen ? "rotate-90" : ""}`}
                    />
                  </button>

                  {/* dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-2.5 w-52 bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 ${isAccountOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
                    style={{ boxShadow: "0 12px 40px rgba(15,23,42,0.12)" }}
                  >
                    {/* user info header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-700 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentPage("profile");
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                    >
                      My Profile
                    </button>
                    <div className="h-px bg-slate-100 mx-3" />
                    <button
                      onClick={() => {
                        setCurrentPage("orders");
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                    >
                      My Orders
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Staff / Logout */}
            <div className="hidden md:flex">
              {currentUser?.role === "MANAGER" ||
              currentUser?.role === "INVENTORY" ||
              currentUser?.role === "ADMIN" ? (
                <button
                  onClick={() => setViewMode("ADMIN")}
                  className="text-xs font-bold px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-full transition-all duration-150"
                >
                  Staff Portal
                </button>
              ) : currentUser ? (
                <button
                  onClick={() => {
                    if (window.confirm("Log out?")) logout();
                  }}
                  className="text-xs font-bold px-4 py-2 text-rose-500 border border-rose-100 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-full transition-all duration-150"
                >
                  Logout
                </button>
              ) : null}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCurrentPage("cart")}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-150" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[9px] min-w-4.5 h-4.5 flex items-center justify-center rounded-full font-black border-2 border-white"
                  style={{ boxShadow: "0 2px 6px rgba(99,102,241,0.5)" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE SEARCH ─────────────────────── */}
        <div className="lg:hidden px-4 pb-3 pt-0.5 bg-white border-b border-slate-100">
          <div className="search-pill flex w-full bg-slate-50 border border-slate-200 rounded-full overflow-hidden transition-all duration-200">
            <input
              type="text"
              placeholder="Search products…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-5 py-2 bg-transparent outline-none text-sm placeholder-slate-400 text-slate-700"
            />
            <button
              onClick={handleSearch}
              className="m-1 px-4 bg-indigo-600 text-white rounded-full flex items-center justify-center"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── NAV ROW (desktop) ─────────────────── */}
        <div className="hidden lg:block border-t border-slate-100 bg-white">
          <div className="flex h-11 items-center px-20">
            {/* ── CATEGORIES mega-button ── */}
            <div
              className="relative h-full shrink-0"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => {
                setIsCategoryOpen(false);
                setHoveredCategory(null);
              }}
            >
              <button
                className="h-full px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 transition-colors duration-150 rounded-b-xl"
                style={{ boxShadow: "0 6px 20px rgba(99,102,241,0.3)" }}
              >
                <Menu className="w-3.5 h-3.5" />
                ALL CATEGORIES
                <ChevronRight
                  className={`w-3 h-3 transition-transform duration-200 ${isCategoryOpen ? "rotate-90" : "rotate-0"}`}
                />
              </button>

              {isCategoryOpen && (
                <div
                  className="absolute top-full left-0 z-50 flex border border-slate-100 rounded-b-2xl overflow-hidden max-h-[72vh]"
                  style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.16)" }}
                >
                  <ul className="bg-white w-56 overflow-y-auto py-2">
                    {CATEGORIES.map((cat) => (
                      <li
                        key={cat}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubcategory(null);
                          setCurrentPage("shop");
                          setIsCategoryOpen(false);
                        }}
                        className={`flex items-center justify-between px-5 py-2.5 text-sm font-medium cursor-pointer transition-all duration-150 ${hoveredCategory === cat ? "bg-indigo-50 text-indigo-600 pl-6" : "text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 hover:pl-6"}`}
                      >
                        {cat}
                        {SUBCATEGORIES[cat] && (
                          <ChevronRight className="w-3 h-3 opacity-40" />
                        )}
                      </li>
                    ))}
                  </ul>
                  {hoveredCategory && SUBCATEGORIES[hoveredCategory] && (
                    <div className="bg-slate-50/80 border-l border-slate-100 w-64 p-4 overflow-y-auto">
                      {SUBCATEGORIES[hoveredCategory].groups.map((group) => (
                        <div key={group.label} className="mb-4">
                          <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                            {group.label}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((sub) => (
                              <li
                                key={sub}
                                onClick={() => {
                                  setSelectedCategory(hoveredCategory);
                                  setSelectedSubcategory(sub);
                                  setCurrentPage("shop");
                                  setIsCategoryOpen(false);
                                }}
                                className="text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150"
                              >
                                {sub}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── NAV LINKS ── */}
            <nav className="flex items-center h-full px-5 text-sm font-semibold text-slate-600 gap-0.5">
              {navLinks.map((link) =>
                link.id === "shop" ? (
                  <div
                    key={link.id}
                    className="relative h-full flex items-center group"
                  >
                    <button
                      onClick={() => setCurrentPage("shop")}
                      className={`relative px-3.5 h-full flex items-center gap-1 transition-colors duration-150 ${currentPage === "shop" ? "text-indigo-600" : "hover:text-indigo-600"}`}
                    >
                      {currentPage === "shop" && (
                        <span className="absolute bottom-0 inset-x-2 h-0.5 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full" />
                      )}
                      Shop
                      <ChevronRight className="w-3 h-3 rotate-90 group-hover:rotate-270 transition-transform duration-200 opacity-60" />
                    </button>
                    {/* shop mega dropdown */}
                    <div
                      className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 z-50 bg-white border border-slate-100 rounded-b-2xl w-140 max-h-[72vh] overflow-y-auto p-6"
                      style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.14)" }}
                    >
                      <div className="grid grid-cols-3 gap-6">
                        {CATEGORIES.map((cat) => (
                          <div key={cat}>
                            <button
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedSubcategory(null);
                                setCurrentPage("shop");
                              }}
                              className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2.5 hover:text-indigo-600 transition-colors duration-150 text-left w-full"
                            >
                              {cat}
                            </button>
                            {SUBCATEGORIES[cat] && (
                              <ul className="space-y-0.5">
                                {SUBCATEGORIES[cat].groups
                                  .flatMap((g) => g.items)
                                  .slice(0, 4)
                                  .map((sub) => (
                                    <li key={sub}>
                                      <button
                                        onClick={() => {
                                          setSelectedCategory(cat);
                                          setSelectedSubcategory(sub);
                                          setCurrentPage("shop");
                                        }}
                                        className="text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all duration-150 text-left w-full"
                                      >
                                        {sub}
                                      </button>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    key={link.id}
                    onClick={() => setCurrentPage(link.id)}
                    className={`relative px-3.5 h-full flex items-center transition-colors duration-150 ${currentPage === link.id ? "text-indigo-600" : "hover:text-indigo-600"}`}
                  >
                    {currentPage === link.id && (
                      <span className="absolute bottom-0 inset-x-2 h-0.5 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full" />
                    )}
                    {link.label}
                  </button>
                ),
              )}
            </nav>

            {/* store open badge */}
            <div className="ml-auto flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Store Open
            </div>
          </div>
        </div>

        {/* ── MOBILE DRAWER ─────────────────────── */}
        <div
          className={`fixed inset-0 z-60 lg:hidden transition-all duration-300 ${isMenuOpen ? "visible" : "invisible"}`}
        >
          {/* backdrop */}
          <div
            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setIsMenuOpen(false)}
          />

          {/* panel */}
          <div
            className={`absolute top-0 right-0 h-full w-[320px] max-w-[88vw] bg-white flex flex-col transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            style={{ boxShadow: "-8px 0 40px rgba(15,23,42,0.2)" }}
          >
            {/* head */}
            <div className="h-20 flex items-center justify-between px-5 bg-white border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/icons/favicon.svg"
                  alt="Infofix"
                  className="h-12 w-13 object-contain"
                />

                <div className="flex flex-col leading-none">
                  <span className="text-[1.35rem] font-black tracking-tight">
                    <span className="text-indigo-600">Info</span>
                    <span className="text-slate-900">fix</span>
                  </span>
                  <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                    Computers
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(["menu", "categories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setMobileTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold capitalize border-b-2 transition-colors duration-150 ${mobileTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              {mobileTab === "menu" ? (
                <>
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setCurrentPage(link.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${currentPage === link.id ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                      style={
                        currentPage === link.id
                          ? { boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }
                          : {}
                      }
                    >
                      {link.label}
                    </button>
                  ))}

                  <div className="h-px bg-slate-100 my-2" />

                  {!currentUser ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage("login");
                          setIsMenuOpen(false);
                        }}
                        className="py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setCurrentPage("signup");
                          setIsMenuOpen(false);
                        }}
                        className="py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"
                        style={{
                          boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                        }}
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-black text-slate-700">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage("profile");
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors duration-150"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-500 text-sm font-bold border border-rose-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}

                  {(currentUser?.role === "MANAGER" ||
                    currentUser?.role === "INVENTORY") && (
                    <button
                      onClick={() => {
                        setViewMode("ADMIN");
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold mt-1"
                    >
                      Staff Portal
                    </button>
                  )}

                  {/* mobile socials */}
                  <div className="h-px bg-slate-100 my-2" />
                  <div className="flex items-center gap-4 px-1 py-1">
                    {[
                      {
                        href: "https://www.facebook.com/profile.php?id=61559131500584",
                        icon: "bi-facebook",
                        color: "text-blue-600",
                      },
                      {
                        href: "https://www.instagram.com/infofixcomputers11?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
                        icon: "bi-instagram",
                        color: "text-pink-500",
                      },
                      {
                        href: "https://www.youtube.com/@infofixcomputers",
                        icon: "bi-youtube",
                        color: "text-red-500",
                      },
                      {
                        href: "https://api.whatsapp.com/send?phone=8293295257&text=hi",
                        icon: "bi-whatsapp",
                        color: "text-emerald-500",
                      },
                    ].map(({ href, icon, color }) => (
                      <a
                        key={icon}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={`${color} opacity-75 hover:opacity-100 transition-opacity duration-150`}
                      >
                        <span className={`bi ${icon} text-base`} />
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                /* categories tab */
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="rounded-xl border border-slate-100 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedMobileCategory(
                            expandedMobileCategory === cat ? null : cat,
                          )
                        }
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-600 transition-colors duration-150"
                      >
                        {cat}
                        {SUBCATEGORIES[cat] && (
                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedMobileCategory === cat ? "rotate-90" : ""}`}
                          />
                        )}
                      </button>
                      {expandedMobileCategory === cat && SUBCATEGORIES[cat] && (
                        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 space-y-3">
                          {SUBCATEGORIES[cat].groups.map((group) => (
                            <div key={group.label}>
                              <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">
                                {group.label}
                              </p>
                              <div className="space-y-0.5">
                                {group.items.map((sub) => (
                                  <button
                                    key={sub}
                                    onClick={() => {
                                      setSelectedCategory(cat);
                                      setSelectedSubcategory(sub);
                                      setCurrentPage("shop");
                                      setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-150"
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════ */}
      <main className="flex-1 bg-white">{children}</main>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="bg-[#0f172a] text-white pt-16 pb-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {[
            {
              title: "About",
              items: [
                { label: "Contact Us", page: "contact" },
                { label: "About Us", page: "about" },
                { label: "Services", page: "services" },
                { label: "Careers", page: "careers" },
                { label: "Our Branches", page: "branches" },
                { label: "Our Blog", page: "updates" },
              ],
            },
          ].map(({ title, items }) => (
            <div key={title} className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                {title}
              </h4>
              <div className="w-5 h-px bg-slate-600" />
              <ul className="space-y-2">
                {items.map(({ label, page }) => (
                  <li key={label}>
                    <button
                      onClick={() => setCurrentPage(page as CustomerPage)}
                      className="text-xs text-slate-500 hover:text-white transition-colors duration-150 cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Help
            </h4>
            <div className="w-5 h-px bg-slate-600" />
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Payments
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("contact")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Raise Query
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <InstallPWA />
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Policy
            </h4>
            <div className="w-5 h-px bg-slate-600" />
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage("policy")}
                  className="hover:text-white transition-colors duration-150"
                >
                  Shipping
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Social
            </h4>
            <div className="w-5 h-px bg-slate-600" />
            <>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-center gap-2">
                  <Facebook className="w-3 h-3" />
                  <a
                    href="https://www.facebook.com/profile.php?id=61559131500584"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors duration-150"
                  >
                    Facebook
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Youtube className="w-3 h-3" />
                  <a
                    href="https://www.youtube.com/@infofixcomputers"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors duration-150"
                  >
                    YouTube
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-3 h-3" />
                  <a
                    href="https://www.instagram.com/infofixcomputers11?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors duration-150"
                  >
                    Instagram
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Linkedin className="w-3 h-3" />
                  <a
                    href="https://www.linkedin.com/company/infofix-computers11/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors duration-150"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Mail Us
            </h4>
            <div className="w-5 h-px bg-slate-600" />
            <p className="text-xs text-slate-500 break-all">
              infofixcomputers1@gmail.com
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">
              Address
            </h4>
            <div className="w-5 h-px bg-slate-600" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ananda Gopal Mukherjee Sarani Rd, Durgapur, WB 713213
            </p>
            <p className="text-xs text-slate-500">📞 8293295257</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-150">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Become A Seller</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-150">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Advertise</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-150">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Gift Cards</span>
              </div>
              <div className="flex items-center gap-2 hover:text-white transition-colors duration-150">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Help Center</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              © {new Date().getFullYear()} Infofix Computers
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {
                // ✅ Updated (EMI removed):
                [
                  "VISA",
                  "MASTERCARD",
                  "MAESTRO",
                  "AMEX",
                  "RUPAY",
                  "NETBANKING",
                  "COD",
                ].map((m) => (
                  <div
                    key={m}
                    className="h-6 px-2 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[8px] font-black text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all duration-150 cursor-default"
                  >
                    {m}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </footer>

      {/* MESSAGE US FAB */}
      <button
        onClick={() => setIsMessageModalOpen(true)}
        className="fixed bottom-6 right-6 z-60 text-white px-5 py-3 rounded-full flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 animate-fab-pulse"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 8px 30px rgba(99,102,241,0.5)",
        }}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        </div>
        <span className="font-bold text-sm tracking-tight">Message Us</span>
      </button>

      {/* MESSAGE MODAL */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div
            className="bg-white w-full max-w-lg h-[88vh] rounded-3xl flex flex-col animate-modal-in"
            style={{ boxShadow: "0 24px 80px rgba(15,23,42,0.4)" }}
          >
            <div className="p-6 border-b border-slate-100 relative">
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all duration-150"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-black text-slate-900">
                Contact Infofix Support
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                We usually reply within 24 hours.
              </p>
            </div>
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
                {[
                  {
                    label: "Full Name",
                    name: "name",
                    type: "text",
                    placeholder: "Your name",
                    required: true,
                  },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    placeholder: "your@email.com",
                    required: true,
                  },
                  {
                    label: "Phone",
                    name: "phone",
                    type: "tel",
                    placeholder: "Optional",
                    required: false,
                  },
                  {
                    label: "Subject",
                    name: "subject",
                    type: "text",
                    placeholder: "Order / Product / Complaint / Other",
                    required: true,
                  },
                ].map(({ label, name, type, placeholder, required }) => (
                  <div key={name}>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      required={required}
                      placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all duration-150"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Write your query here…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm resize-none transition-all duration-150"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-bold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Search pill focus glow — Tailwind v4 compatible */
        .search-pill:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        /* FAB pulse */
        @keyframes fab-pulse {
          0%, 100% { box-shadow: 0 8px 30px rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 8px 40px rgba(139,92,246,0.7); }
        }
        .animate-fab-pulse { animation: fab-pulse 3s ease-in-out infinite; }

        /* Modal entrance */
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-modal-in { animation: modal-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }

        /* Slide-in for mobile drawer (utility) */
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in   { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ADMIN LAYOUT — unchanged
═══════════════════════════════════════════════════════════ */
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    currentUser,
    adminPage,
    setAdminPage,
    logout,
    setViewMode,
    setCurrentPage,
    notifications,
    pushNotification,
  } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => {
    if (!currentUser) return false;
    if (n.read_by.includes(currentUser.id)) return false;
    if (currentUser.role === "ADMIN") return true;
    if (currentUser.role === "MANAGER")
      return ["INVENTORY", "CUSTOMER"].includes(n.user_role);
    if (currentUser.role === "INVENTORY") return n.user_id === currentUser.id;
    return false;
  }).length;
  const navItems: { name: AdminPage; icon: any; role: string[] }[] = [
    { name: "Dashboard", icon: LayoutDashboard, role: ["MANAGER", "ADMIN"] },
    {
      name: "Inventory",
      icon: Package,
      role: ["MANAGER", "INVENTORY", "ADMIN"],
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      role: ["MANAGER", "SUPPORT", "ADMIN"],
    },
    { name: "Customers", icon: Users, role: ["MANAGER", "SUPPORT", "ADMIN"] },
    {
      name: "Blogs",
      icon: MessageSquare,
      role: ["MANAGER", "INVENTORY", "ADMIN"],
    },
    { name: "Settings", icon: Settings, role: ["MANAGER", "ADMIN"] },
  ];

  const visibleNav = navItems.filter((i) => i.role.includes(currentUser.role));

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"
              style={{ boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}
            >
              <Store className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">
              NexusAdmin
            </span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200">
            {(currentUser.avatar_url ?? currentUser.avatar) ? (
              <img
                src={currentUser.avatar_url ?? currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                {currentUser.name
                  ?.split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-1.5 overflow-hidden">
          {visibleNav.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setAdminPage(item.name);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 group ${adminPage === item.name ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"}`}
              style={
                adminPage === item.name
                  ? { boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }
                  : {}
              }
            >
              <item.icon
                className={`w-5 h-5 ${adminPage !== item.name ? "group-hover:scale-110 transition-transform duration-150" : ""}`}
              />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-200 space-y-2">
          <button
            onClick={() => {
              setViewMode("STORE");
              localStorage.setItem("currentPage", "home");
              setCurrentPage("home");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors duration-150"
          >
            <Store className="w-5 h-5" /> Store View
          </button>
          <button
            onClick={() => {
              if (window.confirm("Sign out?")) logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors duration-150"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col lg:ml-72 overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
            <button
              className="lg:hidden p-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-slate-900 font-semibold">Control Center</span>
            <ChevronRight className="w-4 h-4" />
            <span className="capitalize">{adminPage}</span>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-150"
            >
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="hidden lg:block h-10 w-px bg-slate-200" />
            <div className="flex items-center gap-2 lg:gap-3">
              {(currentUser.avatar_url ?? currentUser.avatar) ? (
                <img
                  src={currentUser.avatar_url ?? currentUser.avatar}
                  alt=""
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-indigo-100 object-cover"
                />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-indigo-100 bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                  {currentUser.name
                    ?.split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">
                  Active
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-slate-50/60">
          {children}
        </main>
      </div>
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};
