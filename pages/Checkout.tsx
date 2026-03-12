import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, MapPin, Plus } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { Address } from "../types";

type PaymentMethod = "UPI" | "Card" | "NetBanking" | "COD";

// paymennt methods...
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

export const Checkout: React.FC = () => {
  const { cart, currentUser, setCurrentPage, clearCart } = useStore();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ── Load address from customers profile ──────────────────────────────────
  useEffect(() => {
    const loadAddress = async () => {
      if (!currentUser?.id) return;
      const { data } = await supabase
        .from("customers")
        .select("address1, address2, city, state, pincode, phone")
        .eq("id", currentUser.id)
        .single();
      if (data?.address1) {
        setSavedAddress({
          address_line: [data.address1, data.address2]
            .filter(Boolean)
            .join(", "),
          city: data.city ?? "",
          state: data.state ?? "",
          pincode: data.pincode ?? "",
          phone: data.phone ?? "",
        });
      }
    };
    loadAddress();
  }, [currentUser?.id]);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = 0;
  const delivery = 0;
  const total = subtotal + tax + delivery;

  const isDigital = selectedPayment && selectedPayment !== "COD";
  const canPlaceOrder = selectedPayment && addressConfirmed && cart.length > 0;

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!canPlaceOrder || !currentUser || !savedAddress) return;
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
          customer_phone: savedAddress.phone ?? "",
          address_line: savedAddress.address_line,
          city: savedAddress.city,
          state: savedAddress.state,
          pincode: savedAddress.pincode,
          items: orderItems,
          subtotal,
          tax,
          delivery_charge: delivery,
          total_amount: total,
          payment_method:
            selectedPayment === "COD" ? "Cash on Delivery" : selectedPayment,
          payment_status: selectedPayment === "COD" ? "Pending" : "Paid",
          status: "Processing",
        })
        .select("order_number")
        .single();

      if (insertError) throw insertError;

      // Clear cart from Supabase + context
      await clearCart();

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

  // ── Order success screen ──────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Order Placed!
        </h1>
        <p className="text-gray-500 text-lg mb-3">
          Thank you,{" "}
          <span className="font-bold text-gray-800">{currentUser?.name}</span>!
        </p>
        {orderNumber && (
          <p className="text-indigo-600 font-black text-xl mb-2">
            Order #{orderNumber}
          </p>
        )}
        <p className="text-gray-500 mb-6">
          Your order has been received and is now being reviewed by our team.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-5 text-left mb-10 space-y-2">
          <p className="text-indigo-800 font-black text-sm">
            📞 What happens next?
          </p>
          <p className="text-indigo-700 text-sm leading-relaxed">
            Our team will reach out to you shortly to confirm your order and
            collect a{" "}
            <span className="font-bold">minimal advance shipping amount</span>{" "}
            to secure your delivery slot.
          </p>
          <p className="text-indigo-600 text-sm font-semibold">
            Please keep your phone reachable — we'll call or WhatsApp you within
            24-48 hours.
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

  // ── Main checkout ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="mb-14">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Secure <span className="text-indigo-600">Checkout</span>
        </h1>
        <p className="text-gray-500 font-medium mt-4 text-lg">
          Complete your purchase with confidence using our safe and reliable
          payment system.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-10">
          {/* SHIPPING ADDRESS */}
          <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Shipping Address
            </h2>
            <p className="text-gray-500 font-medium mb-6">
              Select a delivery address where you want your order delivered.
            </p>

            {savedAddress ? (
              <div
                className={`border-2 p-6 rounded-2xl space-y-1 transition-all ${
                  addressConfirmed
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {savedAddress.address_line}
                </p>
                <p className="text-gray-600 pl-6">
                  {savedAddress.city}, {savedAddress.state} —{" "}
                  {savedAddress.pincode}
                </p>
                {savedAddress.phone && (
                  <p className="text-gray-600 pl-6 font-semibold">
                    📞 {savedAddress.phone}
                  </p>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setAddressConfirmed(true)}
                    disabled={addressConfirmed}
                    className={`px-6 py-2 rounded-xl font-semibold transition ${
                      addressConfirmed
                        ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {addressConfirmed
                      ? "✓ Address Confirmed"
                      : "Use This Address"}
                  </button>

                  {!addressConfirmed && (
                    <button
                      onClick={() => setCurrentPage("profile")}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Edit Address
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-500">
                <p className="font-semibold mb-1">No saved address found</p>
                <p className="text-sm mb-4">
                  Add your delivery address in your profile first.
                </p>
                <button
                  onClick={() => setCurrentPage("profile")}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Address in Profile
                </button>
              </div>
            )}

            {addressConfirmed && (
              <button
                onClick={() => setCurrentPage("profile")}
                className="mt-4 text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add / Change Address in Profile
              </button>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Choose Payment Method
            </h2>

            <div className="space-y-4">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = selectedPayment === opt.id;
                const isDisabled = opt.comingSoon;

                return (
                  <div
                    key={opt.id}
                    onClick={() => !isDisabled && setSelectedPayment(opt.id)}
                    className={`border-2 rounded-2xl p-6 transition-all relative ${
                      isDisabled
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
                            className={`font-bold ${isDisabled ? "text-gray-400" : "text-gray-900"}`}
                          >
                            {opt.label}
                          </p>
                          {isDisabled && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-4 transition-all ${
                          isSelected && !isDisabled
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

            {/* Security note */}
            <div className="mt-8 bg-indigo-50 p-6 rounded-2xl flex gap-4 items-start">
              <ShieldCheck className="text-indigo-600 shrink-0" />
              <p className="text-sm text-indigo-900 font-semibold">
                Payments are fully encrypted and processed through trusted
                certified gateways. No card details are stored.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100 h-fit sticky top-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">
            Order Summary
          </h2>

          <div className="space-y-5">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-100"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-indigo-600 shrink-0 ml-2">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST / Taxes</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-xs text-green-600 font-semibold pt-1">
              <span>🚚 Estimated Delivery</span>
              <span>
                {(() => {
                  const d1 = new Date();
                  d1.setDate(d1.getDate() + 5);
                  const d2 = new Date();
                  d2.setDate(d2.getDate() + 7);
                  return `${d1.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d2.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
                })()}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between font-black text-xl">
            <span>Total</span>
            <span className="text-indigo-600">₹{total.toLocaleString()}</span>
          </div>

          {/* Validation hints */}
          {!addressConfirmed && (
            <p className="mt-4 text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-xl">
              ⚠ Please confirm your delivery address above.
            </p>
          )}
          {!selectedPayment && (
            <p className="mt-2 text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 rounded-xl">
              ⚠ Please select a payment method.
            </p>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder || placing}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition shadow-xl active:scale-[0.98] ${
              canPlaceOrder && !placing
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {placing
              ? "Placing Order…"
              : isDigital
                ? "Place Order & Pay"
                : selectedPayment === "COD"
                  ? "Place Order"
                  : "Place Order"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4 font-medium">
            By placing your order, you agree to our Terms, Refund Policy &
            Privacy Policy.
          </p>

          <div className="mt-8 text-sm text-gray-500 space-y-2">
            <p className="font-semibold text-gray-700">Need Help?</p>
            <p>📧 infofixcomputers1@gmail.com</p>
            <p>📞 +91 8293295257</p>
          </div>
        </div>
      </div>
    </div>
  );
};
