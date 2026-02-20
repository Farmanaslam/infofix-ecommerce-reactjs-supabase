import React from "react";
import { useStore } from "../context/StoreContext";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const data = [
  { name: "Mon", sales: 4000, orders: 24 },
  { name: "Tue", sales: 3000, orders: 18 },
  { name: "Wed", sales: 5000, orders: 32 },
  { name: "Thu", sales: 2780, orders: 14 },
  { name: "Fri", sales: 1890, orders: 11 },
  { name: "Sat", sales: 6390, orders: 45 },
  { name: "Sun", sales: 3490, orders: 22 },
];

export const Dashboard: React.FC = () => {
  const { products, orders, currentUser } = useStore();

  const stats = [
    {
      label: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      icon: DollarSign,
      trend: "up",
    },
    {
      label: "Total Orders",
      value: `+${orders.length}`,
      change: "+12.5%",
      icon: ShoppingBag,
      trend: "up",
    },
    {
      label: "Active Customers",
      value: "2,350",
      change: "+180.1%",
      icon: Users,
      trend: "up",
    },
    {
      label: "Inventory Alert",
      value: `${products.filter((p) => p.stock < 20).length}`,
      change: "-4.4%",
      icon: TrendingUp,
      trend: "down",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {currentUser.name.split(" ")[0]} 👋
        </h2>
        <p className="text-gray-500">
          Here's what's happening with your store today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-2xl border  border-gray-200 shadow-sm flex flex-col gap-4"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <AreaChart data={data}>
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

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            <button className="text-sm text-indigo-600 font-medium hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {order.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[120px]">
                      {order.customerName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {order.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === "delivered"
                        ? "bg-green-50 text-green-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-indigo-600 rounded-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Insight
                </span>
              </div>
              <p className="text-sm leading-relaxed opacity-90">
                Nexus AI suggests restocking <strong>Nebula Headphones</strong>{" "}
                as demand has spiked by 12% this morning.
              </p>
            </div>
            <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
