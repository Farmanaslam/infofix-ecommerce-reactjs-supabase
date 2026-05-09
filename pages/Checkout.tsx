import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, CheckCircle, MapPin, Plus, Tag, X, Phone, Home as HomeIcon, ChevronRight, ArrowRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { Address } from "../types";
import { SECTION_ACCENT } from '@/lib/sectionTheme';
type PaymentMethod = "UPI" | "Card" | "NetBanking" | "COD";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; desc: string; comingSoon?: boolean }[] = [
  { id: "UPI", label: "UPI Payment", desc: "Google Pay, PhonePe, Paytm or any UPI app.", comingSoon: true },
  { id: "Card", label: "Debit / Credit Card", desc: "Visa, MasterCard, RuPay supported.", comingSoon: true },
  { id: "NetBanking", label: "Net Banking", desc: "Choose your bank and complete payment securely.", comingSoon: true },
  { id: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives at your doorstep." },
];

const AddressDrawer: React.FC<{
  open: boolean; onClose: () => void; onSaved: (address: Address) => void;
  userId: string; title?: string; accent?: string;
}> = ({ open, onClose, onSaved, userId, title = "Add Delivery Address", accent = '#6366f1' }) => {
  const { selectedStoreSection } = useStore();
  const [form, setForm] = useState({ phone: "", address_line: "", city: "", state: "", pincode: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const theme = SECTION_ACCENT[selectedStoreSection];
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) e.phone = "Valid 10-digit number required";
    if (!form.address_line.trim()) e.address_line = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (!form.state.trim()) e.state = "State required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim())) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from("customers").update({
      address1: form.address_line.trim(), city: form.city.trim(),
      state: form.state.trim(), pincode: form.pincode.trim(), phone: `91${form.phone.trim()}`,
    }).eq("id", userId);
    setSaving(false);
    if (!error) onSaved({ address_line: form.address_line.trim(), city: form.city.trim(), state: form.state.trim(), pincode: form.pincode.trim(), phone: `91${form.phone.trim()}` });
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="w-full max-w-2xl bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: "92vh", overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
          <div className="px-5 pb-20 pt-3 md:pb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900">{title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Required to complete your order</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">+91</span>
                  <input type="tel" maxLength={10} value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.phone ? "ring-2 ring-red-400" : ""}`} />
                </div>
                {errors.phone && <p className="text-xs text-red-500 font-semibold mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">House / Flat / Street *</label>
                <input type="text" value={form.address_line} onChange={(e) => setForm(f => ({ ...f, address_line: e.target.value }))}
                  placeholder="e.g. 12B, Park Street, Near Central Mall"
                  className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.address_line ? "ring-2 ring-red-400" : ""}`} />
                {errors.address_line && <p className="text-xs text-red-500 font-semibold mt-1">{errors.address_line}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">City *</label>
                  <input type="text" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Durgapur"
                    className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.city ? "ring-2 ring-red-400" : ""}`} />
                  {errors.city && <p className="text-xs text-red-500 font-semibold mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">State *</label>
                  <input type="text" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="West Bengal"
                    className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.state ? "ring-2 ring-red-400" : ""}`} />
                  {errors.state && <p className="text-xs text-red-500 font-semibold mt-1">{errors.state}</p>}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Pincode *</label>
                <input type="text" maxLength={6} value={form.pincode} onChange={(e) => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, "") }))} placeholder="713201"
                  className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.pincode ? "ring-2 ring-red-400" : ""}`} />
                {errors.pincode && <p className="text-xs text-red-500 font-semibold mt-1">{errors.pincode}</p>}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="mt-5 w-full  disabled:opacity-60 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-200/60 flex items-center justify-center gap-2" style={{ backgroundColor: theme.accent }} onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.accentHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = theme.accent)
              }>
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : <>Save & Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">Your address is saved securely and only used for delivery</p>
          </div>
        </div>
      </div>
    </>
  );
};

export const Checkout: React.FC = () => {
  const { cart, currentUser, setCurrentPage, clearCart, setPendingRedirectAfterLogin, selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>("COD");
  const [addressOptions, setAddressOptions] = useState<{ label: string; address: Address }[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [hasMultipleAddresses, setHasMultipleAddresses] = useState(false);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<{
    id: string; code: string; discount_amount: number;
    description: string | null; product_ids: number[] | null;
  }[]>([]);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [allCoupons, setAllCoupons] = useState<{ code: string; discount_amount: number; min_order_amount: number; description: string | null; product_ids: number[] | null }[]>([]);
  const [showFixedPlaceOrder, setShowFixedPlaceOrder] = useState(false);
  const placeOrderBtnRef = useRef<HTMLButtonElement>(null);
  const orderSummaryRef = useRef<HTMLDivElement>(null);
  // Fixed bottom bar: show when payment selected AND actual button off-screen
  useEffect(() => {
    if (!selectedPayment) { setShowFixedPlaceOrder(false); return; }
    const btn = placeOrderBtnRef.current;
    if (!btn) return;
    const handleScroll = () => {
      const rect = btn.getBoundingClientRect();
      const footer = document.querySelector("footer");
      const footerRect = footer?.getBoundingClientRect();
      const btnVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const footerVisible = footerRect ? footerRect.top < window.innerHeight : false;
      setShowFixedPlaceOrder(!btnVisible && !footerVisible);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedPayment, cart.length]);

  useEffect(() => {
    if (!currentUser) { setPendingRedirectAfterLogin("checkout"); setCurrentPage("login"); }
  }, []);

  useEffect(() => {
    const loadAddress = async () => {
      if (!currentUser?.id) return;
      const { data } = await supabase.from("customers").select("address1, address2, city, state, pincode, phone").eq("id", currentUser.id).single();
      setAddressLoaded(true);
      if (!data) { setShowAddressDrawer(true); return; }
      const options: { label: string; address: Address }[] = [];
      if (data.address1) options.push({ label: "Primary Address", address: { address_line: data.address1, city: data.city ?? "", state: data.state ?? "", pincode: data.pincode ?? "", phone: data.phone ?? "" } });
      if (data.address2) options.push({ label: "Secondary Address", address: { address_line: data.address2, city: data.city ?? "", state: data.state ?? "", pincode: data.pincode ?? "", phone: data.phone ?? "" } });
      setAddressOptions(options);
      if (options.length === 0) { setShowAddressDrawer(true); return; }
      setHasMultipleAddresses(options.length > 1);
      if (options.length === 1) { setAddressConfirmed(true); setSelectedAddressIndex(0); }
      if (!data.phone?.trim()) setShowAddressDrawer(true);
    };
    loadAddress();
  }, [currentUser?.id]);

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase.from("coupons").select("code, discount_amount, min_order_amount, description, product_ids").eq("is_active", true).limit(20);
      if (data) setAllCoupons(data);
    };
    fetchCoupons();
  }, []);

  const handleAddressSaved = (address: Address) => {
    const newOption = { label: "Primary Address", address };
    setAddressOptions([newOption]);
    setHasMultipleAddresses(false);
    setSelectedAddressIndex(0);
    setAddressConfirmed(true);
    setShowAddressDrawer(false);
  };

  const selectedAddress = addressOptions[selectedAddressIndex]?.address ?? null;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartProductIds = cart.map((item) => Number(item.id));

  const discountAmount = appliedCoupons.reduce((total, coupon) => {
    if (coupon.product_ids && coupon.product_ids.length > 0) {
      const matchingQty = cart
        .filter(item => coupon.product_ids!.includes(Number(item.id)))
        .reduce((sum, item) => sum + item.quantity, 0);
      return total + Math.min(coupon.discount_amount * matchingQty, subtotal);
    }
    return total + Math.min(coupon.discount_amount, subtotal);
  }, 0);
  const total = subtotal - discountAmount;
  const canPlaceOrder = selectedPayment && addressConfirmed && cart.length > 0 && !!selectedAddress?.phone?.trim();

  const applyCouponByCode = async (code: string) => {
    setCouponError(null);
    if (!code.trim() || !currentUser?.id) return;

    // Already applied?
    if (appliedCoupons.some(c => c.code === code.trim().toUpperCase())) {
      setCouponError("This coupon is already applied.");
      return;
    }

    setCouponLoading(true);
    const { data, error: fetchError } = await supabase
      .from("coupons")
      .select("id, code, discount_amount, min_order_amount, is_active, expires_at, description, product_ids")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (fetchError || !data) { setCouponError("Invalid coupon code."); }
    else if (!data.is_active) { setCouponError("This coupon is no longer active."); }
    else if (data.expires_at && new Date(data.expires_at) < new Date()) { setCouponError("This coupon has expired."); }
    else if (data.min_order_amount > 0 && subtotal < data.min_order_amount) {
      setCouponError(`Minimum order ₹${data.min_order_amount.toLocaleString()} required.`);
    }
    else if (data.product_ids?.length > 0 && !data.product_ids.some((pid: number) => cartProductIds.includes(pid))) {
      setCouponError("Not applicable to items in cart.");
    }
    else {
      const { data: existingUsage } = await supabase
        .from("coupon_usages").select("id")
        .eq("coupon_id", data.id).eq("user_id", currentUser.id).maybeSingle();
      if (existingUsage) { setCouponError("You've already used this coupon."); }
      else {
        // ✅ Push to array instead of replacing
        setAppliedCoupons(prev => [...prev, {
          id: data.id, code: data.code,
          discount_amount: data.discount_amount,
          description: data.description,
          product_ids: data.product_ids ?? null,
        }]);
        setCouponCode("");
        setCouponError(null);
      }
    }
    setCouponLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !currentUser || !selectedAddress) return;
    setPlacing(true); setError(null);
    try {
      const orderItems = cart.map((item) => ({ product_id: String(item.id), name: item.name, image: item.image ?? "", price: item.price, quantity: item.quantity }));
      const { data, error: insertError } = await supabase.from("orders").insert({
        user_id: currentUser.id, customer_name: currentUser.name, customer_email: currentUser.email,
        customer_phone: selectedAddress.phone ?? "", address_line: selectedAddress.address_line,
        city: selectedAddress.city, state: selectedAddress.state, pincode: selectedAddress.pincode,
        items: orderItems, subtotal, tax: 0, delivery_charge: 0, discount_amount: discountAmount,
        coupon_code: appliedCoupons.map(c => c.code).join(',') || null, total_amount: total,
        payment_method: selectedPayment === "COD" ? "Cash on Delivery" : selectedPayment,
        payment_status: selectedPayment === "COD" ? "Pending" : "Paid", status: "Processing",
        notes: appliedCoupons.length ? `Coupons: ${appliedCoupons.map(c => `${c.code} (-₹${c.discount_amount})`).join(', ')}` : null,
      }).select("order_number").single();
      if (insertError) throw insertError;
      await Promise.all(orderItems.map(async (item) => {
        const { data: prod } = await supabase.from("products").select("stock_quantity").eq("id", item.product_id).single();
        if (prod) await supabase.from("products").update({ stock_quantity: Math.max(0, prod.stock_quantity - item.quantity) }).eq("id", item.product_id);
      }));
      for (const coupon of appliedCoupons) {
        await supabase.from("coupon_usages").insert({ coupon_id: coupon.id, user_id: currentUser.id });
        await supabase.rpc("increment_coupon_usage", { coupon_id: coupon.id });
      }
      setFinalDiscount(discountAmount);
      await clearCart();
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
          body: JSON.stringify({ ...data, customer_name: currentUser.name, customer_email: currentUser.email, customer_phone: selectedAddress.phone, address_line: selectedAddress.address_line, city: selectedAddress.city, state: selectedAddress.state, pincode: selectedAddress.pincode, items: orderItems, subtotal, tax: 0, discount_amount: discountAmount, coupon_code: appliedCoupons.map(c => c.code).join(',') || null, total_amount: total, payment_method: selectedPayment === "COD" ? "Cash on Delivery" : selectedPayment, payment_status: selectedPayment === "COD" ? "Pending" : "Paid" }),
        });
      } catch { }
      setOrderNumber(data?.order_number ?? "");
      setOrderPlaced(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError("Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you, <span className="font-bold text-gray-800">{currentUser?.name}</span>!</p>
        {orderNumber && <p className="text-indigo-600 font-black text-lg mb-2">Order #{orderNumber}</p>}
        {appliedCoupons.length > 0 && finalDiscount > 0 && <p className="text-emerald-600 font-semibold text-sm mb-4">You saved ₹{finalDiscount.toLocaleString()} with {appliedCoupons.length} coupon{appliedCoupons.length > 1 ? 's' : ''}!</p>}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 text-left mb-8 space-y-2">
          <p className="text-indigo-800 font-black text-sm">What happens next?</p>
          <p className="text-indigo-700 text-sm leading-relaxed">Our team will reach out shortly to confirm your order and collect a <span className="font-bold">minimal advance shipping amount</span>.</p>
          <p className="text-indigo-600 text-sm font-semibold">Keep your phone reachable — we'll call or WhatsApp within 24–48 hours.</p>
          <p className="text-indigo-700 text-sm">For help: <span className="font-bold">+91 8293295257</span></p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => setCurrentPage("orders")} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition">Track My Order</button>
          <button onClick={() => setCurrentPage("shop")} className="border border-gray-200 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition">Continue Shopping</button>
        </div>
      </div>
    );
  }

  const placeOrderLabel = addressOptions.length === 0 ? "Add Address to Continue" : placing ? "Placing Order…" : selectedPayment && selectedPayment !== "COD" ? "Place Order & Pay" : "Place Order";
  const placeOrderDisabled = addressOptions.length > 0 && (!canPlaceOrder || placing);
  const placeOrderAction = addressOptions.length === 0 ? () => setShowAddressDrawer(true) : handlePlaceOrder;

  return (
    <>
      {currentUser?.id && (
        <AddressDrawer open={showAddressDrawer} onClose={() => setShowAddressDrawer(false)} onSaved={handleAddressSaved} userId={currentUser.id}
          title={addressOptions.length === 0 ? "Add Delivery Address" : "Update Contact & Address"} />
      )}

      {/* Mobile fixed bottom CTA — only when payment selected */}
      {showFixedPlaceOrder && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-3" style={{ boxShadow: `0 -8px 32px -4px ${theme.accent}26` }}
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total</p>
              <p className="text-base font-black text-gray-900">₹{total.toLocaleString("en-IN")}</p>
              <button
                onClick={() => orderSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
                className="text-[10px] font-bold text-indigo-500 underline underline-offset-2 mt-0.5"
              >
                View price details
              </button>
            </div>
            <button onClick={placeOrderAction} disabled={placeOrderDisabled}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.97] transition-all ${placeOrderDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "text-white"}`}
              style={!placeOrderDisabled ? { background: theme.accent } : {}}>
              {placeOrderLabel} {!placeOrderDisabled && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 pb-28 lg:pb-10">

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure & encrypted checkout</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 lg:items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* DELIVERY ADDRESS */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Delivery Address</h2>
                {addressConfirmed && <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmed</span>}
              </div>
              <div className="p-4 md:p-5">
                {addressOptions.length > 0 ? (
                  <div className="space-y-3">
                    {hasMultipleAddresses ? (
                      <>
                        {addressOptions.map((opt, idx) => (
                          <div key={idx} onClick={() => { setSelectedAddressIndex(idx); setAddressConfirmed(false); }}
                            className={`border-2 p-4 rounded-2xl cursor-pointer transition-all ${selectedAddressIndex === idx ? "" : "border-gray-100"}`}
                            style={selectedAddressIndex === idx ? { borderColor: theme.accent, background: theme.accentLight + '60' } : {}}>
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                style={selectedAddressIndex === idx ? { borderColor: theme.accent, background: theme.accent } : { borderColor: '#d1d5db' }}>
                                {selectedAddressIndex === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: theme.accent }}>{opt.label}</p>

                                <p className="font-bold text-sm text-gray-900">{opt.address.address_line}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{opt.address.city}, {opt.address.state} — {opt.address.pincode}</p>
                                {opt.address.phone && <p className="text-xs text-gray-500 font-semibold mt-0.5">{opt.address.phone}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-3 pt-1 items-center flex-wrap">
                          <button
                            onClick={() => setAddressConfirmed(true)}
                            disabled={addressConfirmed}
                            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${addressConfirmed ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed" : "text-white"}`}
                            style={!addressConfirmed ? { background: theme.accent } : {}}
                          >
                            {addressConfirmed ? "✓ Confirmed" : "Deliver Here"}
                          </button>
                          {addressConfirmed && <button onClick={() => setAddressConfirmed(false)} className="font-bold text-xs hover:underline" style={{ color: theme.accent }}>Change</button>}

                        </div>
                      </>
                    ) : (
                      <div className="border-2 p-4 rounded-2xl" style={{ borderColor: theme.accent, background: theme.accentLight + '40' }}>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />
                          <div>
                            <p className="font-bold text-sm text-gray-900">{selectedAddress?.address_line}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{selectedAddress?.city}, {selectedAddress?.state} — {selectedAddress?.pincode}</p>
                            {selectedAddress?.phone && <p className="text-xs text-gray-500 font-semibold mt-0.5">{selectedAddress.phone}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => setCurrentPage("profile")}
                      className="flex items-center gap-1.5 text-xs font-bold hover:underline"
                      style={{ color: theme.accent }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add / Change Address
                    </button>
                    {!addressConfirmed && (
                      <p className="w-full flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl mt-1">
                        <span>⚠️</span> Tap <strong>"Deliver Here"</strong> to confirm your address before placing order.
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all"
                    style={{ borderColor: theme.accent + '66', background: theme.accentLight + '30' }}
                    onClick={() => setShowAddressDrawer(true)}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = theme.accent + '66')}
                  >
                    <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: theme.accent }} />
                    <p className="font-black text-gray-900 text-sm mb-1">Add delivery address</p>
                    <p className="text-xs text-gray-500 mb-3">Required to complete checkout</p>
                    <button className="text-white px-5 py-2.5 rounded-xl font-black text-xs transition inline-flex items-center gap-1.5 shadow-lg"
                      style={{ background: theme.accent }}>
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: theme.accent }} />
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Payment Method</h2>
                {selectedPayment && <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Selected</span>}
              </div>
              <div className="p-4 space-y-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedPayment === opt.id;
                  const isDisabled = !!opt.comingSoon;
                  return (
                    <div key={opt.id} onClick={() => !isDisabled && setSelectedPayment(opt.id)}
                      className={`border-2 rounded-2xl p-4 transition-all ${isDisabled ? "border-gray-100 bg-gray-50/50 cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      style={!isDisabled && isSelected ? { borderColor: theme.accent, background: theme.accentLight + '80' } : {}}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={isSelected && !isDisabled ? { borderColor: theme.accent, background: theme.accent } : { borderColor: '#d1d5db' }}
                        >
                          {isSelected && !isDisabled && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-bold text-sm ${isDisabled ? "text-gray-400" : "text-gray-900"}`}>{opt.label}</p>
                            {isDisabled && <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Coming Soon</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ORDER ITEMS SUMMARY — mobile only */}
            <div className="lg:hidden bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest">Order Items ({cart.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-indigo-600 text-sm shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end left */}

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-6">
            <div ref={orderSummaryRef} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Order Summary</h3>
              </div>

              {/* Items — desktop only */}
              <div className="hidden lg:block divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-black text-xs shrink-0" style={{ color: theme.accent }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="px-5 py-4 border-t border-gray-50 space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" style={{ color: theme.accent }} />Apply Coupon</p>
                <>
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (couponError) setCouponError(null); }}
                      onKeyDown={(e) => e.key === "Enter" && applyCouponByCode(couponCode)}
                      placeholder="Enter code" className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-black tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 uppercase min-w-0" />
                    <button onClick={() => applyCouponByCode(couponCode)} disabled={couponLoading || !couponCode.trim()}
                      className="text-white px-4 py-2.5 rounded-xl font-black text-xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
                      style={{ background: theme.accent }}>
                      {couponLoading ? "…" : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{couponError}</p>}
                  {appliedCoupons.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Applied</p>
                      {appliedCoupons.map((c) => {
                        const thisDiscount = c.product_ids?.length
                          ? Math.min(c.discount_amount * cart.filter(i => c.product_ids!.includes(Number(i.id))).reduce((s, i) => s + i.quantity, 0), subtotal)
                          : Math.min(c.discount_amount, subtotal);
                        return (
                          <div key={c.code} className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-emerald-800 text-xs tracking-widest">{c.code}</p>
                              <p className="text-xs text-emerald-600 font-semibold">−₹{thisDiscount.toLocaleString()} off</p>
                            </div>
                            <button onClick={() => setAppliedCoupons(prev => prev.filter(x => x.code !== c.code))}
                              className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {(() => {
                    const applicable = allCoupons.filter(c =>
                      !appliedCoupons.some(a => a.code === c.code) &&
                      (!c.product_ids?.length || c.product_ids.some(pid => cartProductIds.includes(pid)))
                    );
                    if (!applicable.length) return null;
                    return (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available</p>
                        {applicable.map((c) => (
                          <div key={c.code} onClick={() => applyCouponByCode(c.code)}
                            className="flex items-center gap-3 border rounded-xl px-3 py-2 cursor-pointer transition-all group"
                            style={{ backgroundColor: theme.accentLight, borderColor: `${theme.accent}20` }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${theme.accent}15`; e.currentTarget.style.borderColor = theme.accent; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = theme.accentLight; e.currentTarget.style.borderColor = `${theme.accent}20`; }}>
                            <span className="font-black text-[11px] tracking-widest border rounded-lg px-2 py-0.5 shrink-0"
                              style={{ color: theme.accentText, borderColor: `${theme.accent}40`, backgroundColor: "#fff" }}>
                              {c.code}
                            </span>
                            <span className="text-xs font-bold" style={{ color: theme.accentText }}>₹{c.discount_amount} off</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              </div>

              {/* Price breakdown */}
              <div className="px-5 pb-4 space-y-2.5 border-t border-gray-50">
                <div className="flex justify-between text-sm text-gray-500 pt-3">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Delivery</span><span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Taxes</span><span>Included</span>
                </div>
                {appliedCoupons.length > 0 && discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{appliedCoupons.length} Coupon{appliedCoupons.length > 1 ? 's' : ''}</span>
                    <span>− ₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between font-black text-gray-900">
                  <span>Total</span>
                  <div className="text-right">
                    {appliedCoupons && discountAmount > 0 && <p className="text-xs text-gray-400 line-through font-medium mb-0.5">₹{(total + discountAmount).toLocaleString("en-IN")}</p>}
                    <span className="text-lg" style={{ color: theme.accent }}>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                {appliedCoupons && discountAmount > 0 && (
                  <p className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl py-2">
                    🎉 You're saving ₹{discountAmount.toLocaleString("en-IN")}!
                  </p>
                )}
              </div>

              {/* Validation hints */}
              <div className="px-4 pb-4 space-y-2">
                {addressOptions.length === 0 && addressLoaded && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl cursor-pointer hover:bg-amber-100 transition" onClick={() => setShowAddressDrawer(true)}>
                    <span className="text-amber-500">📍</span>
                    <div className="flex-1"><p className="text-xs font-black text-amber-700">Add delivery address</p><p className="text-[10px] text-amber-600">Tap to add address & phone</p></div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </div>
                )}
                {!selectedPayment && <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-xl">Select a payment method above.</p>}
                {error && <p className="text-xs text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

                <button ref={placeOrderBtnRef} onClick={placeOrderAction} disabled={placeOrderDisabled}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] ${placeOrderDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : addressOptions.length === 0 ? "bg-amber-500 text-white" : "text-white"}`}
                  style={!placeOrderDisabled && addressOptions.length > 0 ? { background: theme.accent } : {}} onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.accentHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = theme.accent)
                  }>
                  {placeOrderLabel} {!placeOrderDisabled && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-[10px] text-gray-400 text-center">By placing order you agree to our Terms & Privacy Policy.</p>
              </div>
            </div>

            {/* Help */}
            <div className="mt-3 bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-xs font-black text-gray-700 mb-2">Need Help?</p>
              <p className="text-xs text-gray-500">infofixcomputers1@gmail.com</p>
              <p className="text-xs text-gray-500 font-semibold">+91 8293295257</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes couponFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};
