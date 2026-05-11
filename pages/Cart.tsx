import React, { useState, useEffect, useRef } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Tag, ArrowRight, Shield, Truck, RefreshCw, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";
import { SECTION_ACCENT } from '@/lib/sectionTheme';
import { useNavigate } from "react-router-dom";
interface AvailableCoupon {
  code: string;
  discount_amount: number;
  min_order_amount: number;
  description: string | null;
  product_ids: number[] | null;
}

export const Cart: React.FC = () => {
  const {
    cart, products, setCurrentPage, currentUser,
    updateQuantity, removeFromCart, addToCart, cartLoading, setPendingRedirectAfterLogin, selectedStoreSection
  } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const [allCoupons, setAllCoupons] = useState<AvailableCoupon[]>([]);
  const [showFixedCheckout, setShowFixedCheckout] = useState(true);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const checkoutBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  // Drag-scroll refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("code, discount_amount, min_order_amount, description, product_ids")
        .eq("is_active", true)
        .limit(20);
      if (data) setAllCoupons(data);
    };
    fetchCoupons();
  }, []);


  useEffect(() => {
    const btn = checkoutBtnRef.current;
    if (!btn) return;

    const handleScroll = () => {
      const btnRect = btn.getBoundingClientRect();
      const footer = document.querySelector("footer");
      const footerRect = footer?.getBoundingClientRect();

      const btnVisible = btnRect.top < window.innerHeight && btnRect.bottom > 0;
      const footerVisible = footerRect ? footerRect.top < window.innerHeight : false;

      setShowFixedCheckout(!btnVisible && !footerVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [cart.length]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (cart.length === 0) return;

      // Get category names from cart items
      const catNames = [...new Set(cart.map(i => (i.category ?? "").trim()))].filter(Boolean);
      const cartIdNums = cart.map(i => Number(i.id));

      // Step 1: resolve category names → IDs
      const { data: catRows } = await supabase
        .from("categories")
        .select("id, name")
        .in("name", catNames);

      if (!catRows || catRows.length === 0) return;
      const catIds = catRows.map((c: any) => c.id);

      const { data } = await supabase
        .from("products")
        .select("id, name, discounted_price, image_url, category_id, min_order_quantity, stock_quantity")
        .eq("is_active", true)
        .in("category_id", catIds)
        .not("id", "in", `(${cartIdNums.join(",")})`)
        .limit(12);

      if (data) setDbProducts(data.map((p: any) => ({
        ...p,
        id: String(p.id),
        image: p.image_url,
        price: parseFloat(p.discounted_price ?? p.retail_price ?? "0"),
        stock: p.stock_quantity,
        min_order_quantity: p.min_order_quantity ?? 1,
      })));
    };
    fetchSimilar();
  }, [cart]);

  const cartProductIds = cart.map((item) => Number(item.id));
  const applicableCoupons = allCoupons.filter((c) => {
    if (!c.product_ids || c.product_ids.length === 0) return true;
    return c.product_ids.some((pid) => cartProductIds.includes(pid));
  });
  const getCouponApplicableProducts = (coupon: AvailableCoupon) => {
    if (!coupon.product_ids || coupon.product_ids.length === 0) return null;
    return cart.filter((item) => coupon.product_ids!.includes(Number(item.id)));
  };

  const handleSelectProduct = (product: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80);
    navigate(`/products/${slug}-${product.id}`);
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCategories = [...new Set(cart.map((item) => (item.category ?? "").trim().toLowerCase()))];
  const cartIds = new Set(cart.map((item) => String(item.id)));
  const similarProducts = dbProducts.slice(0, 8);

  if (!currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={56} className="mx-auto mb-4" style={{ color: theme.accent }} />
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Please log in to view your cart</h2>
        <p className="text-gray-500 mb-6">Your cart is saved to your account so you never lose your items.</p>
        <button onClick={() => { setPendingRedirectAfterLogin("cart"); setCurrentPage("login"); }} className="text-white px-6 py-3 rounded-xl transition"
          style={{ background: theme.accent }}>
          Log In
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <ShoppingCart size={56} className="mx-auto mb-4" style={{ color: theme.accent }} />
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Your cart is currently empty.</h2>
        <p className="text-gray-500 mb-6">Browse our products to continue shopping.</p>
        <button
          onClick={() => setCurrentPage("shop")}
          className="text-white px-6 py-3 rounded-xl transition-all duration-300"
          style={{ backgroundColor: theme.accent }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = theme.accentHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = theme.accent)
          }
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Fixed bottom checkout bar — mobile only */}
      {showFixedCheckout && (
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3"
          style={{ boxShadow: `0 -8px 32px -4px ${SECTION_ACCENT[selectedStoreSection].accent}26` }}
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</p>
              <p className="text-lg font-black text-gray-900">₹{total.toLocaleString("en-IN")}</p>
            </div>
            <button
              onClick={() => setCurrentPage("checkout")}
              className="flex-1 flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.97] transition-all"
              style={{ background: theme.accent }}            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-28 lg:pb-10">

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-gray-400 mt-1">{cart.length} {cart.length === 1 ? "item" : "items"} in your cart</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Cart Items */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Your Items</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item) => {
                  const itemCoupons = allCoupons.filter(
                    (c: any) => c.is_active !== false && c.product_ids && c.product_ids.includes(Number(item.id))
                  );
                  const moq = item.min_order_quantity ?? 1;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 md:p-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleSelectProduct(item)}
                    >
                      <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} width={96} height={96} />

                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">₹{item.price.toLocaleString("en-IN")} per unit</p>

                        {moq > 1 && (
                          <span className="inline-block mt-1 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                            Min order: {moq} units
                          </span>
                        )}

                        {itemCoupons.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {itemCoupons.map((c) => (
                              <span key={c.code} className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <Tag className="w-2.5 h-2.5" />{c.code} — ₹{c.discount_amount} off
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 mt-3">
                          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            {(() => {
                              const isWholesale = moq > 1;
                              const step = isWholesale ? moq : 1;
                              const stock = item.stock ?? Infinity;
                              const nextUp = item.quantity + step;
                              const nextDown = item.quantity - step;
                              return (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(String(item.id), Math.max(moq, nextDown)); }}
                                    disabled={item.quantity <= moq}
                                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                                  ><Minus className="w-3.5 h-3.5" /></button>
                                  <span className="w-10 text-center font-black text-gray-900 text-sm">{item.quantity}</span>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); updateQuantity(String(item.id), Math.min(stock, nextUp)); }}
                                    disabled={nextUp > stock}
                                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                                  ><Plus className="w-3.5 h-3.5" /></button>
                                </>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="font-black text-base" style={{ color: theme.accent }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFromCart(String(item.id)); }}
                              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                            ><Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Remove</span></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Coupons */}
            {applicableCoupons.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: theme.accent }} />
                  <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Available Coupons</span>
                  <span className="ml-auto text-[10px] text-gray-400 font-semibold">Apply at checkout</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {applicableCoupons.map((c) => {
                    const applicableItems = getCouponApplicableProducts(c);
                    return (
                      <div key={c.code} className="flex items-start gap-4 px-5 py-4">
                        <div className="shrink-0 border-2 border-dashed rounded-xl px-3 py-1.5" style={{ borderColor: theme.accent + '88' }}>
                          <span className="font-black text-sm tracking-widest" style={{ color: theme.accentText }}>{c.code}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">₹{c.discount_amount} off</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {c.description || `On orders above ₹${c.min_order_amount > 0 ? c.min_order_amount : 0}`}
                          </p>
                          {applicableItems && applicableItems.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <span className="text-[10px] text-amber-600 font-black bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">🎯 For:</span>
                              {applicableItems.map((item) => (
                                <span key={item.id} className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{item.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-indigo-50 px-5 py-2.5 border-t border-indigo-50">
                  <p className="text-xs text-indigo-500 font-semibold">💡 Apply coupon on the next step during checkout</p>
                </div>
              </div>
            )}

            {/* Customers Also Bought */}
            {similarProducts.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Customers Also Bought</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Based on items in your cart</p>
                  </div>
                  <button onClick={() => setCurrentPage("shop")} className="text-xs font-bold flex items-center gap-1" style={{ color: theme.accent }}>
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-4 overflow-hidden">
                  <div className="pointer-events-none absolute right-4 top-4 bottom-5 w-10 z-10"
                    style={{ background: `linear-gradient(to right, transparent, white)` }} />
                  {/* Drag-scrollable on desktop, touch-scroll on mobile, no scrollbar */}
                  <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto pb-1"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      cursor: "grab",
                      userSelect: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                  >
                    {similarProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="shrink-0 w-[42vw] sm:w-40 md:w-36 border border-gray-100 rounded-2xl p-3 bg-white transition-all cursor-pointer"
                        style={{ pointerEvents: "auto" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `${theme.accent}55`;
                          e.currentTarget.style.boxShadow = `0 10px 25px ${theme.accent}22`;
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#f3f4f6";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <img src={product.image} className="w-full h-24 object-cover rounded-xl mb-2" alt={product.name} width={144} height={96} draggable={false} />

                        <h3 className="font-semibold text-xs text-gray-800 leading-snug line-clamp-2 mb-1.5">{product.name}</h3>
                        <p className="font-black text-sm mb-2" style={{ color: theme.accent }}>
                          ₹{product.price.toLocaleString("en-IN")}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                          className="w-full text-[10px] font-black border rounded-lg py-1.5 transition uppercase tracking-wide"
                          style={{ borderColor: theme.accent, color: theme.accent }}
                        >+ Add</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk / Corporate */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h4 className="font-bold text-gray-800 text-sm">🏢 Bulk & Corporate Discounts</h4>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                Ordering for your business? We offer special pricing on bulk orders.{" "}
                <button onClick={() => setCurrentPage("contact")} className="text-indigo-600 underline font-semibold hover:text-indigo-800">
                  Contact us for a quote.
                </button>
              </p>
            </div>

            {/* Trust */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Secure Checkout" },
                { icon: <Truck className="w-4 h-4" />, label: "Free Delivery" },
                { icon: <RefreshCw className="w-4 h-4" />, label: "7-Day Returns" },
                { icon: <Tag className="w-4 h-4" style={{ color: theme.accent }} />, label: "Best Price" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3.5 py-3 shadow-sm">
                  <span className="shrink-0" style={{ color: theme.accent }}>{b.icon}</span>

                  <span className="text-[11px] font-black text-gray-600 uppercase tracking-wide">{b.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Order Summary</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Price ({cart.length} items)</span>
                  <span className="font-semibold">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Taxes</span>
                  <span>At checkout</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="font-black text-gray-900">Total Amount</span>
                  <span className="font-black text-xl" style={{ color: theme.accent }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                  🚚 Estimated delivery: 5–7 business days
                </p>
              </div>
              <div className="px-4 pb-4 space-y-2">
                <button
                  ref={checkoutBtnRef}
                  onClick={() => setCurrentPage("checkout")}
                  className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: theme.accent }}
                  onMouseEnter={e => (e.currentTarget.style.background = theme.accentHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = theme.accent)}                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage("shop")}
                  className="w-full py-4 rounded-2xl font-bold text-sm border transition-all"
                  style={{ borderColor: "#f3f4f6" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.accent;
                    e.currentTarget.style.backgroundColor = theme.accentLight;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
