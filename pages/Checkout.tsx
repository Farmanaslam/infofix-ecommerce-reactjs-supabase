import React from "react";
import { ShieldCheck, CreditCard, Truck } from "lucide-react";
import { useStore } from "../context/StoreContext";

export const Checkout: React.FC = () => {
  const { cart } = useStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const delivery = 0;
  const tax = 0;
  const total = subtotal + delivery + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* HEADER */}
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
        {/* LEFT SIDE - MAIN CHECKOUT */}
        <div className="lg:col-span-2 space-y-10">
          {/* SHIPPING SECTION */}
          <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Shipping Address
            </h2>

            <p className="text-gray-500 font-medium mb-6">
              Select a delivery address where you want your order delivered.
            </p>

            <div className="border border-indigo-200 bg-indigo-50 p-6 rounded-2xl space-y-2">
              <p className="font-bold text-gray-900">
                Ananda Gopal Mukherjee Sarani Rd,
              </p>
              <p className="text-gray-600">Near BINA GAS, Benachity,</p>
              <p className="text-gray-600">Durgapur, West Bengal – 713213</p>
              <p className="text-gray-600 font-semibold">📞 8293295257</p>

              <div className="flex gap-4 pt-4">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition">
                  Use This Address
                </button>
                <button className="text-indigo-600 font-bold hover:underline">
                  Edit Address
                </button>
              </div>
            </div>

            <button className="mt-6 text-indigo-600 font-bold hover:underline">
              ➕ Add New Address
            </button>
          </div>

          {/* PAYMENT SECTION */}
          <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Choose Payment Method
            </h2>

            <div className="space-y-5">
              <div className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition cursor-pointer">
                <p className="font-bold text-gray-900">UPI Payment</p>
                <p className="text-sm text-gray-500">
                  Pay securely using Google Pay, PhonePe, Paytm or any UPI app.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition cursor-pointer">
                <p className="font-bold text-gray-900">Debit / Credit Card</p>
                <p className="text-sm text-gray-500">
                  Visa, MasterCard, RuPay supported.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition cursor-pointer">
                <p className="font-bold text-gray-900">Net Banking</p>
                <p className="text-sm text-gray-500">
                  Choose your bank and complete payment securely.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-6 hover:border-indigo-400 transition cursor-pointer">
                <p className="font-bold text-gray-900">
                  Cash on Delivery (COD)
                </p>
                <p className="text-sm text-gray-500">
                  Availability depends on product and delivery location.
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="mt-8 bg-indigo-50 p-6 rounded-2xl flex gap-4 items-start">
              <ShieldCheck className="text-indigo-600" />
              <p className="text-sm text-indigo-900 font-semibold">
                Payments are fully encrypted and processed through trusted
                certified gateways. No card details are stored.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <div className="bg-white border border-gray-100 p-10 rounded-4xl shadow-xl shadow-gray-100 h-fit sticky top-10">
          <h2 className="text-2xl font-black text-gray-900 mb-8">
            Order Summary
          </h2>

          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-indigo-600">
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
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between font-black text-xl">
            <span>Total</span>
            <span className="text-indigo-600">₹{total.toLocaleString()}</span>
          </div>

          <button className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg transition shadow-xl shadow-indigo-200 active:scale-[0.98]">
            Place Order & Pay
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
