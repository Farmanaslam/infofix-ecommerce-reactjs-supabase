import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { Order, OrderItem } from "../types";

const STATUS_FILTERS = [
  "All",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// ─── Status Badge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    Delivered: {
      icon: <CheckCircle className="w-4 h-4" />,
      className: "text-green-600 bg-green-50 border-green-200",
    },
    Shipped: {
      icon: <Truck className="w-4 h-4" />,
      className: "text-blue-600 bg-blue-50 border-blue-200",
    },
    "Out for Delivery": {
      icon: <Truck className="w-4 h-4" />,
      className: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    Processing: {
      icon: <Clock className="w-4 h-4" />,
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    Cancelled: {
      icon: <XCircle className="w-4 h-4" />,
      className: "text-red-600 bg-red-50 border-red-200",
    },
  };
  const cfg = map[status] ?? {
    icon: <Package className="w-4 h-4" />,
    className: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border ${cfg.className}`}
    >
      {cfg.icon} {status}
    </span>
  );
};

// ─── Order Card ─────────────────────────────────────────────────────────────────

const OrderCard: React.FC<{ order: Order; onRefresh: () => void }> = ({
  order,
  onRefresh,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;
    setCancelling(true);

    const { error } = await supabase
      .from("orders")
      .update({ status: "Cancelled" })
      .eq("id", order.id)
      .eq("user_id", order.user_id); // extra safety filter

    if (error) {
      console.error("Cancel error:", error.message, error.details, error.hint);
      alert("Failed to cancel: " + error.message);
    } else {
      onRefresh();
    }
    setCancelling(false);
  };
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <p className="font-bold text-gray-900 text-lg">
              Order #{order.order_number}
            </p>
            <div className="text-sm text-gray-500 mt-0.5">
              Placed on {formatDate(order.created_at)}
              {(order.status === "Processing" ||
                order.status === "Shipped" ||
                order.status === "Out for Delivery") && (
                <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                  🚚 Estimated Delivery:{" "}
                  {(() => {
                    const d = new Date(order.created_at);
                    d.setDate(d.getDate() + 7);
                    const d2 = new Date(order.created_at);
                    d2.setDate(d2.getDate() + 5);
                    return `${d2.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
                  })()}
                </p>
              )}
              {order.status === "Delivered" && (
                <p className="text-xs text-green-600 font-semibold mt-1">
                  ✓ Delivered
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items Preview */}
        <div className="mt-6 bg-gray-50 rounded-2xl p-5 space-y-3">
          {order.items.slice(0, expanded ? undefined : 2).map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                </p>
              </div>
              <p className="font-bold text-indigo-600 text-sm">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
          {order.items.length > 2 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> +{order.items.length - 2}{" "}
                  more items
                </>
              )}
            </button>
          )}
        </div>

        {/* Payment + Amount */}
        <div className="mt-5 flex flex-col md:flex-row md:justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-gray-800 text-lg">
              Total: ₹{order.total_amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              {order.payment_method} ·{" "}
              <span
                className={
                  order.payment_status === "Paid"
                    ? "text-green-600 font-semibold"
                    : "text-yellow-600 font-semibold"
                }
              >
                {order.payment_status}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-start">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition text-sm"
            >
              {expanded ? "Hide Details" : "View Details"}
            </button>

            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <button
                onClick={() => setShowTracking(true)}
                className="px-5 py-2 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition text-sm flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" /> Track Order
              </button>
            )}

            {order.status === "Delivered" && (
              <button className="px-5 py-2 bg-green-100 text-green-600 rounded-xl font-semibold hover:bg-green-200 transition text-sm flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Reorder
              </button>
            )}

            {order.status === "Processing" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-5 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl font-semibold hover:bg-red-100 transition text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
          </div>

          {/* Tracking Modal */}
          {showTracking && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTracking(false)}
            >
              <div
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-gray-900">
                    Track Order
                  </h3>
                  <button
                    onClick={() => setShowTracking(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 font-black"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Order{" "}
                  <span className="font-bold text-gray-800">
                    #{order.order_number}
                  </span>
                </p>

                {/* Timeline */}
                <div className="space-y-0">
                  {[
                    {
                      label: "Order Placed",
                      desc: "Your order has been received",
                      done: true,
                    },
                    {
                      label: "Processing",
                      desc: "We're preparing your items",
                      done:
                        order.status !== "Processing"
                          ? true
                          : order.status === "Processing",
                    },
                    {
                      label: "Shipped",
                      desc: "Order dispatched to courier",
                      done: [
                        "Shipped",
                        "Out for Delivery",
                        "Delivered",
                      ].includes(order.status),
                    },
                    {
                      label: "Out for Delivery",
                      desc: "Your package is on its way",
                      done: ["Out for Delivery", "Delivered"].includes(
                        order.status,
                      ),
                    },
                    {
                      label: "Delivered",
                      desc: "Package delivered successfully",
                      done: order.status === "Delivered",
                    },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${step.done ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-200"}`}
                        >
                          {step.done ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        {i < arr.length - 1 && (
                          <div
                            className={`w-0.5 h-8 ${step.done ? "bg-indigo-300" : "bg-gray-200"}`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`font-bold text-sm ${step.done ? "text-gray-900" : "text-gray-400"}`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${step.done ? "text-gray-500" : "text-gray-300"}`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.tracking_id && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                      Tracking ID
                    </p>
                    <p className="font-mono font-bold text-gray-800">
                      {order.courier_name && `${order.courier_name} · `}
                      {order.tracking_id}
                    </p>
                  </div>
                )}

                {!order.tracking_id && order.status !== "Delivered" && (
                  <p className="mt-4 text-xs text-gray-400 text-center">
                    Tracking ID will be available once your order is shipped.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 px-8 py-6 space-y-5 bg-gray-50/50">
          {/* Address */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
              Delivery Address
            </p>
            <p className="text-gray-700 font-medium flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              {order.address_line}, {order.city}, {order.state} —{" "}
              {order.pincode}
            </p>
          </div>

          {/* Tracking */}
          {order.tracking_id && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                Tracking
              </p>
              <p className="text-sm text-gray-700 font-medium">
                {order.courier_name && (
                  <span className="mr-2">{order.courier_name} ·</span>
                )}
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-lg">
                  {order.tracking_id}
                </span>
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              Price Breakdown
            </p>
            <div className="space-y-1.5 text-sm text-gray-700 max-w-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {order.delivery_charge === 0
                    ? "Free"
                    : `₹${order.delivery_charge.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5 mt-1.5">
                <span>Total</span>
                <span className="text-indigo-600">
                  ₹{order.total_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export const MyOrders: React.FC = () => {
  const { setCurrentPage, currentUser } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id) return;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data as Order[]);
  }, [currentUser?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time updates: if staff changes status, customer sees it live
  useEffect(() => {
    if (!currentUser?.id) return;
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setOrders((prev) =>
            prev.map((o) =>
              o.id === payload.new.id ? (payload.new as Order) : o,
            ),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const handler = () => fetchOrders();
    window.addEventListener("order-cancelled", handler);
    return () => window.removeEventListener("order-cancelled", handler);
  }, [fetchOrders]);
  const filteredOrders =
    activeFilter === "All"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-16 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            Please log in to view your orders
          </h2>
          <button
            onClick={() => setCurrentPage("login")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-2xl font-semibold transition cursor-pointer text-sm ${
                activeFilter === filter
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {filter}
              {filter !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({orders.filter((o) => o.status === filter).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xl shadow-indigo-100">
            <Package className="w-16 h-16 text-indigo-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-4">
              {activeFilter === "All"
                ? "No Orders Yet"
                : `No ${activeFilter} Orders`}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeFilter === "All"
                ? "You haven't placed any orders yet."
                : `You have no orders with status "${activeFilter}".`}
            </p>
            {activeFilter === "All" && (
              <button
                onClick={() => setCurrentPage("shop")}
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition cursor-pointer"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onRefresh={fetchOrders} />
            ))}
          </div>
        )}

        {/* Support Section */}
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
