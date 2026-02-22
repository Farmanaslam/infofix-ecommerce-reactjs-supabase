import React, { useState } from "react";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { useStore } from "../context/StoreContext";

export const MyOrders: React.FC = () => {
  const { setCurrentPage } = useStore();
  const [activeFilter, setActiveFilter] = useState("All");

  const orders = [
    {
      id: "IFX-10245",
      date: "12 January 2026",
      product: "Dell Latitude 7490 Business Laptop",
      specs: "Intel Core i5 | 16GB RAM | 512GB SSD",
      quantity: 1,
      amount: "₹42,999",
      payment: "Online Payment (UPI)",
      status: "Delivered",
    },
    {
      id: "IFX-10246",
      date: "20 January 2026",
      product: "HP EliteBook 840 G5",
      specs: "Intel i7 | 16GB RAM | 1TB SSD",
      quantity: 1,
      amount: "₹55,500",
      payment: "Card Payment",
      status: "Shipped",
    },
    {
      id: "IFX-10247",
      date: "25 January 2026",
      product: "Lenovo ThinkPad T480",
      specs: "Intel i5 | 8GB RAM | 256GB SSD",
      quantity: 1,
      amount: "₹29,999",
      payment: "Cash on Delivery",
      status: "Processing",
    },
  ];

  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  const statusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <CheckCircle className="w-4 h-4" /> Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="flex items-center gap-1 text-blue-600 font-semibold">
            <Truck className="w-4 h-4" /> Shipped
          </span>
        );
      case "Processing":
        return (
          <span className="flex items-center gap-1 text-yellow-600 font-semibold">
            <Clock className="w-4 h-4" /> Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 text-red-600 font-semibold">
            <XCircle className="w-4 h-4" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              My Orders
            </span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">
            View, track, and manage all your orders in one place.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-4 mb-10">
          {["All", "Processing", "Shipped", "Delivered", "Cancelled"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-2xl font-semibold transition cursor-pointer ${
                  activeFilter === filter
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ),
          )}
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-indigo-100">
            <h3 className="text-2xl font-black mb-4">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven’t placed any orders yet.
            </p>
            <button
              onClick={() => setCurrentPage("shop")}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-8 space-y-6"
              >
                {/* Top Row */}
                <div className="flex flex-col md:flex-row md:justify-between gap-6">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {order.date}
                    </p>
                  </div>

                  <div>{statusBadge(order.status)}</div>
                </div>

                {/* Product Info */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="font-bold text-gray-900">{order.product}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.specs}</p>
                  <p className="text-sm font-medium mt-2">
                    Quantity: {order.quantity} Item
                  </p>
                </div>

                {/* Price + Payment */}
                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Total Paid: {order.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      Payment Method: {order.payment}
                    </p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-3">
                    <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition cursor-pointer">
                      View Details
                    </button>

                    <button className="px-5 py-2 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer">
                      Download Invoice
                    </button>

                    {order.status !== "Delivered" && (
                      <button className="px-5 py-2 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition cursor-pointer">
                        Track Order
                      </button>
                    )}

                    {order.status === "Delivered" && (
                      <button className="px-5 py-2 bg-green-100 text-green-600 rounded-xl font-semibold hover:bg-green-200 transition cursor-pointer">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SUPPORT SECTION */}
        <div className="mt-20 bg-indigo-600 text-white rounded-3xl p-12 text-center space-y-6">
          <h3 className="text-3xl font-black">Need Help with an Order?</h3>
          <p className="opacity-90">
            If you have questions about delivery, invoice, or order issues, our
            support team is here to help.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button
              onClick={() => setCurrentPage("contact")}
              className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition cursor-pointer"
            >
              Contact Support
            </button>

            <a
              href="mailto:infofixcomputers1@gmail.com"
              className="bg-white/20 px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition cursor-pointer"
            >
              Email Us
            </a>

            <a
              href="tel:+918293295257"
              className="bg-white/20 px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition cursor-pointer"
            >
              Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
