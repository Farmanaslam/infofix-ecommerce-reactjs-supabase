import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Edit3,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Check,
  SlidersHorizontal,
  MapPin,
  User,
  Calendar,
  Hash,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Order, OrderItem } from "../types";
import { OrderRowSkeleton } from "./Skeleton";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
interface EditForm {
  status: OrderStatus;
  tracking_id: string;
  courier_name: string;
  notes: string;
}
type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseItems = (items: OrderItem[] | string): OrderItem[] => {
  if (Array.isArray(items)) return items;
  try {
    return JSON.parse(items);
  } catch {
    return [];
  }
};
const fmt = (val: string | number) =>
  `₹${parseFloat(String(val ?? 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const PER_PAGE = 15;

const STATUS_CFG: Record<
  OrderStatus,
  {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    dot: string;
  }
> = {
  Pending: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock className="w-3 h-3" />,
    dot: "bg-amber-500",
  },
  Processing: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Zap className="w-3 h-3" />,
    dot: "bg-blue-500",
  },
  Shipped: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: <Truck className="w-3 h-3" />,
    dot: "bg-violet-500",
  },
  Delivered: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
    dot: "bg-emerald-500",
  },
  Cancelled: {
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <XCircle className="w-3 h-3" />,
    dot: "bg-red-500",
  },
};
const PAY_CFG: Record<string, { color: string; bg: string }> = {
  Paid: { color: "text-emerald-700", bg: "bg-emerald-50" },
  Pending: { color: "text-amber-700", bg: "bg-amber-50" },
  Failed: { color: "text-red-600", bg: "bg-red-50" },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const c = STATUS_CFG[status] ?? STATUS_CFG.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${c.color} ${c.bg} ${c.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const [filterPayment, setFilterPayment] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    status: "Pending",
    tracking_id: "",
    courier_name: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((msg: string, type: ToastType = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message: msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const fetchOrders = useCallback(
    async (pg = 1, retry = 0) => {
      setLoading(true);
      try {
        let q = supabase.from("orders").select("*", { count: "exact" });
        if (search.trim())
          q = q.or(
            `order_number.ilike.%${search.trim()}%,customer_name.ilike.%${search.trim()}%,customer_email.ilike.%${search.trim()}%`,
          );
        if (filterStatus) q = q.eq("status", filterStatus);
        if (filterPayment) q = q.eq("payment_status", filterPayment);
        q = q.order(sortCol, { ascending: sortDir === "asc" });
        const from = (pg - 1) * PER_PAGE;
        q = q.range(from, from + PER_PAGE - 1);
        const { data, error, count } = await q;
        if (error) throw error;
        setOrders((data as unknown as Order[]) ?? []);
        setTotalCount(count ?? 0);
      } catch (err: any) {
        if (retry < 2) {
          setTimeout(() => fetchOrders(pg, retry + 1), 1500 * (retry + 1));
          toast(`Retrying… (${retry + 1}/2)`, "info");
        } else toast(`Failed: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [search, filterStatus, filterPayment, sortCol, sortDir, toast],
  );

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterPayment, sortCol, sortDir]);
  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortCol !== col ? (
      <ArrowUpDown className="w-3 h-3 opacity-30" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );

  const openEdit = (o: Order) => {
    setEditOrder(o);
    setEditForm({
      status: o.status,
      tracking_id: o.tracking_id ?? "",
      courier_name: o.courier_name ?? "",
      notes: o.notes ?? "",
    });
  };

  const handleSave = async () => {
    if (!editOrder) return;
    if (!editForm.status) {
      toast("Status is required", "error");
      return;
    }
    if (
      editForm.tracking_id &&
      !/^[A-Za-z0-9\-]{3,40}$/.test(editForm.tracking_id)
    ) {
      toast("Tracking ID: 3–40 alphanumeric chars", "error");
      return;
    }
    if (
      editForm.status === "Cancelled" &&
      editOrder.status !== "Cancelled" &&
      !window.confirm(
        `Cancel order ${editOrder.order_number}? Cannot be undone.`,
      )
    )
      return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: editForm.status,
          tracking_id: editForm.tracking_id || null,
          courier_name: editForm.courier_name || null,
          notes: editForm.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editOrder.id);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editOrder.id
            ? { ...o, ...editForm, updated_at: new Date().toISOString() }
            : o,
        ),
      );
      toast("Order updated!");
      setEditOrder(null);
    } catch (err: any) {
      toast(`Failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-200 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: "fadeInRight 0.3s ease" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold text-white
              ${t.type === "success" ? "bg-emerald-600" : t.type === "error" ? "bg-red-600" : "bg-indigo-600"}`}
          >
            {t.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : t.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
            )}
            <span className="max-w-xs leading-tight">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Orders
          </h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            {totalCount} total · Page {page}/{totalPages || 1}
          </p>
        </div>
        <button
          onClick={() => fetchOrders(page)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("")}
          className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${filterStatus === "" ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"}`}
        >
          All ({totalCount})
        </button>
        {STATUSES.map((s) => {
          const c = STATUS_CFG[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`px-4 py-2 rounded-full text-xs font-black border transition-all flex items-center gap-1.5
                ${filterStatus === s ? `${c.bg} ${c.color} ${c.border}` : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              {s}
            </button>
          );
        })}
      </div>

      {/* Search + filters bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors
              ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters{" "}
            {filterPayment && (
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            )}
          </button>
        </div>
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                Payment Status
              </label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All</option>
                {["Paid", "Pending", "Failed"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                Sort By
              </label>
              <select
                value={`${sortCol}:${sortDir}`}
                onChange={(e) => {
                  const [c, d] = e.target.value.split(":");
                  setSortCol(c);
                  setSortDir(d as "asc" | "desc");
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="created_at:desc">Newest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="total_amount:desc">Total High→Low</option>
                <option value="total_amount:asc">Total Low→High</option>
                <option value="customer_name:asc">Customer A→Z</option>
              </select>
            </div>
            {filterPayment && (
              <button
                onClick={() => setFilterPayment("")}
                className="col-span-2 md:col-span-4 text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-700"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  { label: "Order", col: "order_number" },
                  { label: "Customer", col: "customer_name" },
                ].map(({ label, col }) => (
                  <th key={col} className="px-5 py-3.5">
                    <button
                      onClick={() => toggleSort(col)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                    >
                      {label} <SortIcon col={col} />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500">
                  Status
                </th>
                {[
                  { label: "Total", col: "total_amount" },
                  { label: "Payment", col: "payment_status" },
                  { label: "Date", col: "created_at" },
                ].map(({ label, col }) => (
                  <th key={label} className="px-5 py-3.5">
                    <button
                      onClick={() => toggleSort(col)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                    >
                      {label} <SortIcon col={col} />
                    </button>
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <OrderRowSkeleton key={i} />
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-bold text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your filters.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const items = parseItems(order.items);
                  const payCfg =
                    PAY_CFG[order.payment_status ?? "Pending"] ??
                    PAY_CFG.Pending;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-black text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900 text-sm">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.customer_email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-gray-900">
                          {fmt(order.total_amount)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black ${payCfg.color} ${payCfg.bg}`}
                        >
                          {order.payment_status ?? "Pending"}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {order.payment_method}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </p>
                        {order.updated_at !== order.created_at && (
                          <p className="text-[10px] text-indigo-400 mt-0.5">
                            Upd.{" "}
                            {new Date(order.updated_at).toLocaleDateString(
                              "en-IN",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewOrder(order)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(order)}
                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg =
                  totalPages <= 5
                    ? i + 1
                    : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pg === page ? "bg-indigo-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {viewOrder &&
        (() => {
          const items = parseItems(viewOrder.items);
          const payCfg =
            PAY_CFG[viewOrder.payment_status ?? "Pending"] ?? PAY_CFG.Pending;
          return (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-gray-900">
                        Order Details
                      </h3>
                      <StatusBadge status={viewOrder.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {viewOrder.order_number}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Customer */}
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-2.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      Customer & Delivery
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-800">
                        {viewOrder.customer_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {viewOrder.customer_email}
                    </div>
                    {viewOrder.customer_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-gray-400 text-xs">📞</span>
                        {viewOrder.customer_phone}
                      </div>
                    )}
                    {(viewOrder.address_line || viewOrder.city) && (
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span>
                          {[
                            viewOrder.address_line,
                            viewOrder.city,
                            viewOrder.state,
                            viewOrder.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      Items ({items.length})
                    </p>
                    <div className="space-y-2">
                      {items.length > 0 ? (
                        items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-gray-200 shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} × {fmt(item.price)}
                              </p>
                            </div>
                            <span className="font-black text-gray-900 text-sm shrink-0">
                              {fmt(item.price * item.quantity)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No item details available.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      Payment Summary
                    </p>
                    {[
                      { label: "Subtotal", val: viewOrder.subtotal },
                      { label: "Tax", val: viewOrder.tax },
                      { label: "Delivery", val: viewOrder.delivery_charge },
                    ].map(({ label, val }) => (
                      <div
                        key={label}
                        className="flex justify-between text-sm text-gray-600 mb-1.5"
                      >
                        <span>{label}</span>
                        <span>{fmt(val)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-black text-gray-900">
                      <span>Total</span>
                      <span className="text-lg">
                        {fmt(viewOrder.total_amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-black ${payCfg.color} ${payCfg.bg}`}
                      >
                        {viewOrder.payment_status ?? "Pending"}
                      </span>
                      <span className="text-xs text-gray-500">
                        via {viewOrder.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Shipping */}
                  {(viewOrder.tracking_id || viewOrder.courier_name) && (
                    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 mb-2">
                        Shipping Info
                      </p>
                      {viewOrder.courier_name && (
                        <p className="text-sm text-violet-800 font-bold">
                          {viewOrder.courier_name}
                        </p>
                      )}
                      {viewOrder.tracking_id && (
                        <p className="text-sm text-violet-700 font-mono mt-1">
                          Tracking: {viewOrder.tracking_id}
                        </p>
                      )}
                    </div>
                  )}

                  {viewOrder.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-amber-800 font-medium">
                        {viewOrder.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Created{" "}
                      {new Date(viewOrder.created_at).toLocaleString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Updated{" "}
                      {new Date(viewOrder.updated_at).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0">
                  <button
                    onClick={() => setViewOrder(null)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewOrder(null);
                      openEdit(viewOrder);
                    }}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Edit Order
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* EDIT MODAL */}
      {editOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Edit Order</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {editOrder.order_number} · {editOrder.customer_name}
                </p>
              </div>
              <button
                onClick={() => setEditOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Order Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((s) => {
                    const c = STATUS_CFG[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() =>
                          setEditForm((f) => ({ ...f, status: s }))
                        }
                        className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5
                          ${editForm.status === s ? `${c.bg} ${c.color} ${c.border} shadow-sm` : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}
                      >
                        {c.icon} {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                    Tracking ID
                  </label>
                  <input
                    type="text"
                    value={editForm.tracking_id}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        tracking_id: e.target.value,
                      }))
                    }
                    placeholder="e.g. BD123456789IN"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                    Courier
                  </label>
                  <select
                    value={editForm.courier_name}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        courier_name: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="">Select courier</option>
                    {[
                      "BlueDart",
                      "Delhivery",
                      "Ekart",
                      "DTDC",
                      "India Post",
                      "Xpressbees",
                      "Shadowfax",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Internal Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Notes visible only to staff..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              {editForm.status === "Cancelled" &&
                editOrder.status !== "Cancelled" && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium">
                      Cancelling this order is permanent and will be
                      timestamped.
                    </p>
                  </div>
                )}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setEditOrder(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
};
