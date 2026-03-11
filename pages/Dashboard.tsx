import React, { useMemo } from "react";
import { useStore } from "../context/StoreContext";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const Dashboard: React.FC = () => {
  const {
    products,
    orders,
    currentUser,
    totalRevenue,
    activeCustomersCount,
    setAdminPage,
  } = useStore();

  // Inventory alert: products with stock_quantity < 20
  const lowStockCount = useMemo(
    () =>
      products.filter((p) => (p.stock_quantity ?? p.stock ?? 0) < 20).length,
    [products],
  );

  // Weekly chart: bucket real orders by day using total_amount (your actual column)
  const weeklyChartData = useMemo(() => {
    const buckets: Record<string, { sales: number; orders: number }> = {};
    DAY_LABELS.forEach((d) => (buckets[d] = { sales: 0, orders: 0 }));

    orders.forEach((order) => {
      const day = DAY_LABELS[new Date(order.created_at ?? Date.now()).getDay()];
      if (buckets[day]) {
        // total_amount is a string in your DB ("139620") — parse it
        buckets[day].sales += parseFloat(String(order.total_amount ?? 0)) || 0;
        buckets[day].orders += 1;
      }
    });

    return DAY_LABELS.map((name) => ({ name, ...buckets[name] }));
  }, [orders]);

  // Revenue display
  const revenueDisplay = useMemo(
    () =>
      totalRevenue > 0
        ? `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "₹0.00",
    [totalRevenue],
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: revenueDisplay,
        change: `${orders.length} orders`,
        icon: DollarSign,
        trend: "up" as const,
      },
      {
        label: "Total Orders",
        value: String(orders.length),
        change:
          orders.length > 0 ? `${orders.length} this week` : "No orders yet",
        icon: ShoppingBag,
        trend: "up" as const,
      },
      {
        label: "Active Customers",
        value: activeCustomersCount.toLocaleString("en-IN"),
        change: `${activeCustomersCount} total`,
        icon: Users,
        trend: "up" as const,
      },
      {
        label: "Inventory Alert",
        value: String(lowStockCount),
        change:
          lowStockCount > 0 ? `${lowStockCount} low stock` : "All stocked",
        icon: TrendingUp,
        trend: lowStockCount > 0 ? ("down" as const) : ("up" as const),
      },
    ],
    [revenueDisplay, orders.length, activeCustomersCount, lowStockCount],
  );

  // Recent 5 orderrss
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const firstName = useMemo(
    () => currentUser?.name?.split(" ")[0] ?? "there",
    [currentUser?.name],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName} 👋
        </h2>
        <p className="text-gray-500">
          Here's what's happening with your store today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">Sales Revenue</h3>
              <p className="text-sm text-gray-500">
                Weekly performance overview
              </p>
            </div>
            <select className="text-sm border-none bg-gray-100 rounded-lg px-3 py-2 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: number) => [
                    `₹${val.toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders + AI Insight */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            {/* "View All" navigates to Orders admin page */}
            <button
              onClick={() => setAdminPage("Orders")}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4 flex-1">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No orders yet.
              </p>
            ) : (
              recentOrders.map((order) => {
                // customer_name is your actual DB column (e.g. "Rahul")
                const name = (order as any).customer_name ?? "Unknown";
                // total_amount is a string in DB ("139620")
                const total = parseFloat(
                  String((order as any).total_amount ?? 0),
                );
                // order_number is your display ID (e.g. "IFX-870462")
                const orderNum = (order as any).order_number ?? order.id;
                // initials from customer name
                const initials = name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                        {initials || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-28">
                          {name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {orderNum}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{total.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-50 text-green-600"
                            : order.status === "Cancelled"
                              ? "bg-red-50 text-red-500"
                              : order.status === "Shipped"
                                ? "bg-violet-50 text-violet-600"
                                : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI Insight */}
          <div className="mt-6 p-4 bg-indigo-600 rounded-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Insight
                </span>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                {lowStockCount > 0
                  ? `${lowStockCount} product${lowStockCount > 1 ? "s are" : " is"} running low on stock. Consider restocking soon.`
                  : "All products are well stocked. Keep monitoring order trends daily."}
              </p>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
