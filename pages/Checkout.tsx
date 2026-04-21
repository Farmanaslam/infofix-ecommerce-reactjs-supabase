import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, MapPin, Plus, Tag, X, Phone, Home as HomeIcon, ChevronRight } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { Address } from "../types";

type PaymentMethod = "UPI" | "Card" | "NetBanking" | "COD";

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  desc: string;
  comingSoon?: boolean;
}[] = [
    {
      id: "UPI",
      label: "UPI Payment",
      desc: "Google Pay, PhonePe, Paytm or any UPI app.",
      comingSoon: true,
    },
    {
      id: "Card",
      label: "Debit / Credit Card",
      desc: "Visa, MasterCard, RuPay supported.",
      comingSoon: true,
    },
    {
      id: "NetBanking",
      label: "Net Banking",
      desc: "Choose your bank and complete payment securely.",
      comingSoon: true,
    },
    {
      id: "COD",
      label: "Cash on Delivery (COD)",
      desc: "Pay when your order arrives at your doorstep.",
    },
  ];

// ── Inline Address Drawer (Flipkart-style) ────────────────────────────────────
const AddressDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  onSaved: (address: Address) => void;
  userId: string;
  title?: string;
}> = ({ open, onClose, onSaved, userId, title = "Add Delivery Address" }) => {
  const [form, setForm] = useState({
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim()))
      e.phone = "Valid 10-digit mobile number required";
    if (!form.address_line.trim()) e.address_line = "Address required";
    if (!form.city.trim()) e.city = "City required";
    if (!form.state.trim()) e.state = "State required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase
      .from("customers")
      .update({
        address1: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        phone: `91${form.phone.trim()}`,
      })
      .eq("id", userId);

    setSaving(false);
    if (!error) {
      onSaved({
        address_line: form.address_line.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        phone: `91${form.phone.trim()}`,
      });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 sm:px-6 md:px-8 pb-4">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <div className="px-6 sm:px-8 md:px-10 pb-8 pt-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">{title}</h2>
                <p className="text-sm text-gray-400 font-medium mt-0.5">
                  Required to complete your order
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-indigo-50 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Phone className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-black text-indigo-700">Contact</span>
              </div>
              <div className="flex-1 h-px bg-indigo-200" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                  <HomeIcon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-black text-indigo-700">Address</span>
              </div>
              <div className="flex-1 h-px bg-indigo-200" />
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-gray-400" />
                </div>
                <span className="text-xs font-semibold text-gray-400">Done</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Phone */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="10-digit mobile number"
                    className={`w-full bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.phone ? "ring-2 ring-red-400" : ""}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Line */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                  House / Flat / Street *
                </label>
                <input
                  type="text"
                  value={form.address_line}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address_line: e.target.value }))
                  }
                  placeholder="e.g. 12B, Park Street, Near Central Mall"
                  className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.address_line ? "ring-2 ring-red-400" : ""}`}
                />
                {errors.address_line && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.address_line}
                  </p>
                )}
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                    City *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Durgapur"
                    className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.city ? "ring-2 ring-red-400" : ""}`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                    State *
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="West Bengal"
                    className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.state ? "ring-2 ring-red-400" : ""}`}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                  Pincode *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pincode: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="713201"
                  className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.pincode ? "ring-2 ring-red-400" : ""}`}
                />
                {errors.pincode && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Save & Continue to Checkout
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 font-medium mt-3">
              Your address is saved securely and only used for delivery
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const Checkout: React.FC = () => {
  const { cart, currentUser, setCurrentPage, clearCart } = useStore();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  // Address state
  const [addressOptions, setAddressOptions] = useState<{ label: string; address: Address }[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [hasMultipleAddresses, setHasMultipleAddresses] = useState(false);

  // Inline address drawer
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount_amount: number;
    description: string | null;
    product_ids: number[] | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [finalDiscount, setFinalDiscount] = useState(0);

  // Load address
  useEffect(() => {
    const loadAddress = async () => {
      if (!currentUser?.id) return;
      const { data } = await supabase
        .from("customers")
        .select("address1, address2, city, state, pincode, phone")
        .eq("id", currentUser.id)
        .single();

      setAddressLoaded(true);

      if (!data) {
        // Auto-open drawer for new users
        setShowAddressDrawer(true);
        return;
      }

      const options: { label: string; address: Address }[] = [];

      if (data.address1) {
        options.push({
          label: "Primary Address",
          address: {
            address_line: data.address1,
            city: data.city ?? "",
            state: data.state ?? "",
            pincode: data.pincode ?? "",
            phone: data.phone ?? "",
          },
        });
      }

      if (data.address2) {
        options.push({
          label: "Secondary Address",
          address: {
            address_line: data.address2,
            city: data.city ?? "",
            state: data.state ?? "",
            pincode: data.pincode ?? "",
            phone: data.phone ?? "",
          },
        });
      }

      setAddressOptions(options);

      if (options.length === 0) {
        // Has customer row but no address — open drawer
        setShowAddressDrawer(true);
        return;
      }

      const multiple = options.length > 1;
      setHasMultipleAddresses(multiple);

      if (options.length === 1) {
        setAddressConfirmed(true);
        setSelectedAddressIndex(0);
      }

      // If phone missing on selected address — open drawer
      if (!data.phone?.trim()) {
        setShowAddressDrawer(true);
      }
    };
    loadAddress();
  }, [currentUser?.id]);

  const handleAddressSaved = (address: Address) => {
    const newOption = { label: "Primary Address", address };
    setAddressOptions([newOption]);
    setHasMultipleAddresses(false);
    setSelectedAddressIndex(0);
    setAddressConfirmed(true);
    setShowAddressDrawer(false);
  };

  const selectedAddress = addressOptions[selectedAddressIndex]?.address ?? null;

  // Totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = 0;
  const delivery = 0;

  const cartProductIds = cart.map((item) => Number(item.id));

  const isCouponApplicableToCart = (coupon: { product_ids: number[] | null }) => {
    if (!coupon.product_ids || coupon.product_ids.length === 0) return true;
    return coupon.product_ids.some((pid) => cartProductIds.includes(pid));
  };

  const discountAmount =
    appliedCoupon && isCouponApplicableToCart(appliedCoupon)
      ? Math.min(appliedCoupon.discount_amount, subtotal)
      : 0;
  const total = subtotal + tax + delivery - discountAmount;

  const isDigital = selectedPayment && selectedPayment !== "COD";
  const hasPhone = !!selectedAddress?.phone?.trim();
  const canPlaceOrder = selectedPayment && addressConfirmed && cart.length > 0 && hasPhone;

  // Coupon logic
  const applyCoupon = async () => {
    setCouponError(null);
    if (!couponCode.trim()) return;
    setCouponLoading(true);

    const { data, error: fetchError } = await supabase
      .from("coupons")
      .select(
        "id, code, discount_amount, min_order_amount, max_uses, used_count, is_active, expires_at, description, product_ids"
      )
      .eq("code", couponCode.trim().toUpperCase())
      .single();

    if (fetchError || !data) {
      setCouponError("Invalid coupon code. Please check and try again.");
    } else if (!data.is_active) {
      setCouponError("This coupon is no longer active.");
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired.");
    } else if (data.max_uses !== null && data.used_count >= data.max_uses) {
      setCouponError("This coupon has reached its usage limit.");
    } else if (data.min_order_amount > 0 && subtotal < data.min_order_amount) {
      setCouponError(
        `Minimum order of ₹${data.min_order_amount.toLocaleString()} required for this coupon.`
      );
    } else if (
      data.product_ids &&
      data.product_ids.length > 0 &&
      !data.product_ids.some((pid: number) => cartProductIds.includes(pid))
    ) {
      setCouponError("This coupon is not applicable to the products in your cart.");
    } else {
      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_amount: data.discount_amount,
        description: data.description,
        product_ids: data.product_ids ?? null,
      });
      setCouponCode("");
      setCouponError(null);
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !currentUser || !selectedAddress) return;
    setPlacing(true);
    setError(null);

    try {
      const orderItems = cart.map((item) => ({
        product_id: String(item.id),
        name: item.name,
        image: item.image ?? "",
        price: item.price,
        quantity: item.quantity,
      }));

      const { data, error: insertError } = await supabase
        .from("orders")
        .insert({
          user_id: currentUser.id,
          customer_name: currentUser.name,
          customer_email: currentUser.email,
          customer_phone: selectedAddress.phone ?? "",
          address_line: selectedAddress.address_line,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          items: orderItems,
          subtotal,
          tax,
          delivery_charge: delivery,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon?.code ?? null,
          total_amount: total,
          payment_method:
            selectedPayment === "COD" ? "Cash on Delivery" : selectedPayment,
          payment_status: selectedPayment === "COD" ? "Pending" : "Paid",
          status: "Processing",
          notes: appliedCoupon
            ? `Coupon: ${appliedCoupon.code} (₹${discountAmount} off)`
            : null,
        })
        .select("order_number")
        .single();

      if (insertError) throw insertError;

      if (appliedCoupon) {
        await supabase.rpc("increment_coupon_usage", {
          coupon_id: appliedCoupon.id,
        });
      }
      setFinalDiscount(discountAmount);
      await clearCart();

      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              ...data,
              customer_name: currentUser.name,
              customer_email: currentUser.email,
              customer_phone: selectedAddress.phone,
              address_line: selectedAddress.address_line,
              city: selectedAddress.city,
              state: selectedAddress.state,
              pincode: selectedAddress.pincode,
              items: orderItems,
              subtotal,
              tax,
              discount_amount: discountAmount,
              coupon_code: appliedCoupon?.code ?? null,
              total_amount: total,
              payment_method:
                selectedPayment === "COD" ? "Cash on Delivery" : selectedPayment,
              payment_status: selectedPayment === "COD" ? "Pending" : "Paid",
            }),
          }
        );
      } catch (emailErr) {
        console.warn("Email send failed (non-blocking):", emailErr);
      }

      setOrderNumber(data?.order_number ?? "");
      setOrderPlaced(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError("Failed to place order. Please try again.");
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Order Placed!</h1>
        <p className="text-gray-500 text-lg mb-3">
          Thank you, <span className="font-bold text-gray-800">{currentUser?.name}</span>!
        </p>
        {orderNumber && (
          <p className="text-indigo-600 font-black text-xl mb-2">Order #{orderNumber}</p>
        )}
        {appliedCoupon && finalDiscount > 0 && (
          <p className="text-emerald-600 font-semibold text-sm mb-4">
            🎉 You saved ₹{finalDiscount.toLocaleString()} with coupon {appliedCoupon.code}!
          </p>
        )}
        <p className="text-gray-500 mb-6">
          Your order has been received and is now being reviewed by our team.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-5 text-left mb-10 space-y-2">
          <p className="text-indigo-800 font-black text-sm">📞 What happens next?</p>
          <p className="text-indigo-700 text-sm leading-relaxed">
            Our team will reach out to you shortly to confirm your order and collect a{" "}
            <span className="font-bold">minimal advance shipping amount</span> to secure
            your delivery slot.
          </p>
          <p className="text-indigo-600 text-sm font-semibold">
            Please keep your phone reachable — we'll call or WhatsApp you within 24-48 hours.
          </p>
          <p className="text-indigo-700 text-sm">
            For any help or enquiry, feel free to call us at{" "}
            <span className="font-bold">+91 8293295257</span>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setCurrentPage("orders")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition"
          >
            Track My Order
          </button>
          <button
            onClick={() => setCurrentPage("shop")}
            className="border border-gray-200 px-8 py-3 rounded-2xl font-bold hover:bg-gray-50 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Main checkout
  return (
    <>
      {/* Address Drawer */}
      {currentUser?.id && (
        <AddressDrawer
          open={showAddressDrawer}
          onClose={() => setShowAddressDrawer(false)}
          onSaved={handleAddressSaved}
          userId={currentUser.id}
          title={
            addressOptions.length === 0
              ? "Add Delivery Address"
              : "Update Contact & Address"
          }
        />
      )}

      <div className="app-container py-8 md:py-20">
        {/* Header */}
        <div className="mb-14">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Secure <span className="text-indigo-600">Checkout</span>
          </h1>
          <p className="text-gray-500 font-medium mt-4 text-lg">
            Complete your purchase with confidence using our safe and reliable payment system.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* SHIPPING ADDRESS */}
            <div className="bg-white border border-gray-100 p-4 md:p-10 rounded-4xl shadow-xl shadow-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Shipping Address</h2>
              <p className="text-gray-500 font-medium mb-6">
                {hasMultipleAddresses
                  ? "Select which address you'd like your order delivered to."
                  : "Your delivery address for this order."}
              </p>

              {addressOptions.length > 0 ? (
                <div className="space-y-4">
                  {hasMultipleAddresses ? (
                    <>
                      {addressOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedAddressIndex(idx);
                            setAddressConfirmed(false);
                          }}
                          className={`border-2 p-6 rounded-2xl space-y-1 transition-all cursor-pointer ${selectedAddressIndex === idx
                            ? addressConfirmed
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-indigo-300 bg-indigo-50/50"
                            : "border-gray-200 bg-white hover:border-indigo-200"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                              {opt.label}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressIndex === idx
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-300"
                                }`}
                            >
                              {selectedAddressIndex === idx && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            {opt.address.address_line}
                          </p>
                          <p className="text-gray-600 pl-6">
                            {opt.address.city}, {opt.address.state} — {opt.address.pincode}
                          </p>
                          {opt.address.phone && (
                            <p className="text-gray-600 pl-6 font-semibold">
                              📞 {opt.address.phone}
                            </p>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-4 pt-2">
                        <button
                          onClick={() => setAddressConfirmed(true)}
                          disabled={addressConfirmed}
                          className={`px-6 py-2 rounded-xl font-semibold transition ${addressConfirmed
                            ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                          {addressConfirmed ? "✓ Address Confirmed" : "Deliver to This Address"}
                        </button>
                        {addressConfirmed && (
                          <button
                            onClick={() => setAddressConfirmed(false)}
                            className="text-indigo-600 font-bold hover:underline text-sm"
                          >
                            Change
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="border-2 border-indigo-500 bg-indigo-50 p-6 rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                          Delivery Address
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                        {selectedAddress?.address_line}
                      </p>
                      <p className="text-gray-600 pl-6">
                        {selectedAddress?.city}, {selectedAddress?.state} —{" "}
                        {selectedAddress?.pincode}
                      </p>
                      {selectedAddress?.phone && (
                        <p className="text-gray-600 pl-6 font-semibold">
                          📞 {selectedAddress.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Edit address button — opens drawer, not profile */}
                  <button
                    onClick={() => setShowAddressDrawer(true)}
                    className="mt-2 text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add / Change Address
                  </button>
                </div>
              ) : (
                /* No address — prompt inline, not redirect */
                <div
                  className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                  onClick={() => setShowAddressDrawer(true)}
                >
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="font-black text-gray-900 mb-1 text-lg">
                    Add your delivery address
                  </p>
                  <p className="text-sm text-gray-500 mb-5">
                    Required to complete checkout. Takes 30 seconds.
                  </p>
                  <button
                    onClick={() => setShowAddressDrawer(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition inline-flex items-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    <Plus className="w-4 h-4" /> Add Address & Phone
                  </button>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Choose Payment Method</h2>
              <div className="space-y-4">
                {PAYMENT_OPTIONS.map((opt) => {
                  const isSelected = selectedPayment === opt.id;
                  const isDisabled = opt.comingSoon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => !isDisabled && setSelectedPayment(opt.id)}
                      className={`border-2 rounded-2xl p-6 transition-all relative ${isDisabled
                        ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                        : isSelected
                          ? "border-indigo-500 bg-indigo-50 cursor-pointer"
                          : "border-gray-200 hover:border-indigo-300 bg-white cursor-pointer"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p
                              className={`font-bold ${isDisabled ? "text-gray-400" : "text-gray-900"
                                }`}
                            >
                              {opt.label}
                            </p>
                            {isDisabled && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                                Coming Soon
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${isSelected && !isDisabled
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-200"
                            }`}
                        >
                          {isSelected && !isDisabled && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 bg-indigo-50 p-6 rounded-2xl flex gap-4 items-start">
                <ShieldCheck className="text-indigo-600 shrink-0" />
                <p className="text-sm text-indigo-900 font-semibold">
                  Payments are fully encrypted and processed through trusted certified gateways.
                  No card details are stored.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — ORDER SUMMARY */}
          <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-4xl shadow-xl shadow-gray-100 h-fit sticky top-10 space-y-6">
            <h2 className="text-2xl font-black text-gray-900">Order Summary</h2>

            {/* Cart items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 leading-tight">{item.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-indigo-600 shrink-0 ml-2">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* COUPON INPUT */}
            <div className="border border-dashed border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" /> Apply Coupon
              </p>

              {!appliedCoupon ? (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponError) setCouponError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Enter code"
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-black tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase min-w-0"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-black text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>

                  {couponError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      <span className="text-red-400 text-xs mt-0.5">✕</span>
                      <p className="text-xs text-red-600 font-semibold leading-snug">
                        {couponError}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-emerald-800 text-xs tracking-widest">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      ₹{discountAmount.toLocaleString()} off applied!
                    </p>
                    {appliedCoupon.product_ids && appliedCoupon.product_ids.length > 0 && (
                      <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                        🎯 Applied to qualifying products in cart
                      </p>
                    )}
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                    title="Remove coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST / Taxes</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>

              {appliedCoupon && discountAmount > 0 && (
                <div
                  className="flex justify-between font-bold px-3 py-2 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                    border: "1px solid #a7f3d0",
                    animation: "couponFadeIn 0.35s ease forwards",
                  }}
                >
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> {appliedCoupon.code}
                  </span>
                  <span className="text-emerald-700">− ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>🚚 Estimated Delivery</span>
                <span>
                  {(() => {
                    const d1 = new Date();
                    d1.setDate(d1.getDate() + 5);
                    const d2 = new Date();
                    d2.setDate(d2.getDate() + 7);
                    return `${d1.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })} – ${d2.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}`;
                  })()}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="border-t border-gray-200 pt-4 flex justify-between items-end font-black text-xl">
              <span>Total</span>
              <div className="text-right">
                {appliedCoupon && discountAmount > 0 && (
                  <p className="text-xs text-gray-400 line-through font-medium mb-0.5">
                    ₹{(total + discountAmount).toLocaleString()}
                  </p>
                )}
                <span className="text-indigo-600" style={{ transition: "all 0.3s ease" }}>
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div
                className="text-center py-2 rounded-xl text-xs font-black text-emerald-700"
                style={{
                  background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                  animation: "couponFadeIn 0.35s ease forwards",
                }}
              >
                🎉 You're saving ₹{discountAmount.toLocaleString()} on this order!
              </div>
            )}

            {/* Validation hints */}
            {addressOptions.length === 0 && addressLoaded && (
              <div
                className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl cursor-pointer hover:bg-amber-100 transition"
                onClick={() => setShowAddressDrawer(true)}
              >
                <span className="text-amber-500 text-lg">📍</span>
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-700">Delivery address needed</p>
                  <p className="text-xs text-amber-600 font-medium">Tap to add address & phone</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </div>
            )}
            {!addressConfirmed && addressOptions.length > 0 && hasMultipleAddresses && (
              <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-xl">
                ⚠ Please confirm your delivery address above.
              </p>
            )}
            {!selectedPayment && (
              <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-xl">
                ⚠ Please select a payment method.
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              onClick={
                addressOptions.length === 0
                  ? () => setShowAddressDrawer(true)
                  : handlePlaceOrder
              }
              disabled={addressOptions.length > 0 && (!canPlaceOrder || placing)}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition shadow-xl active:scale-[0.98] ${addressOptions.length === 0
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 cursor-pointer"
                : canPlaceOrder && !placing
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                }`}
            >
              {addressOptions.length === 0
                ? "📍 Add Address to Continue"
                : placing
                  ? "Placing Order…"
                  : isDigital
                    ? "Place Order & Pay"
                    : "Place Order"}
            </button>

            <p className="text-xs text-gray-500 text-center font-medium">
              By placing your order, you agree to our Terms, Refund Policy & Privacy Policy.
            </p>

            <div className="text-sm text-gray-500 space-y-1 pt-2 border-t border-gray-100">
              <p className="font-semibold text-gray-700">Need Help?</p>
              <p>📧 infofixcomputers1@gmail.com</p>
              <p>📞 +91 8293295257</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes couponFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
