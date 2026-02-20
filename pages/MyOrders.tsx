import React from "react";
import { Package } from "lucide-react";

export const MyOrders: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-500 font-medium">
            Track and manage your recent purchases.
          </p>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((order) => (
            <div
              key={order}
              className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Package className="w-6 h-6" />
                </div>

                <div>
                  <p className="font-bold text-gray-900">Order #INF00{order}</p>
                  <p className="text-sm text-gray-500 font-medium">
                    Placed on 12 Feb 2026
                  </p>
                </div>
              </div>

              <div className="text-left md:text-right">
                <p className="font-bold text-gray-900">$299.00</p>
                <p className="text-sm font-semibold text-green-500">
                  Delivered
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
