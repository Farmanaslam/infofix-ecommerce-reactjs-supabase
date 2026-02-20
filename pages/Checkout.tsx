import React from "react";
import { useStore } from "../context/StoreContext";

export const Checkout: React.FC = () => {
  const { cart } = useStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-indigo-700 mb-10">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Billing Form */}
        <div className="space-y-5 bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Billing Details
          </h2>

          <input
            placeholder="Full Name"
            className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            placeholder="Email Address"
            className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            placeholder="Phone Number"
            className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            placeholder="Address"
            className="w-full border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="City"
              className="border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              placeholder="ZIP Code"
              className="border border-indigo-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Payment Placeholder */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Method
            </h2>

            <div className="border border-indigo-200 rounded-lg p-4 text-gray-600 bg-indigo-50">
              Stripe payment integration will appear here.
            </div>
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition mt-6">
            Place Order
          </button>
        </div>

        {/* Order Summary */}
        <div className="border border-indigo-100 rounded-xl p-6 h-fit bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Order Summary
          </h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-indigo-600 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-indigo-100 mt-6 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
