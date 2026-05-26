import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Edit3,
  RefreshCw,
  AlertTriangle,
  Check,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Eye,
  IndianRupee,
  Tag,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Customer, EditForm } from "../types";
import { CustomerRowSkeleton } from "./Skeleton";
import { jsPDF } from "jspdf";
import { FileDown } from "lucide-react";
type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const PER_PAGE = 15;

const CUSTOMER_STATUSES = [
  "New",
  "Contacted",
  "Follow Up",
  "Interested",
  "Not Interested",
  "Converted",
] as const;
type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

const STATUS_STYLES: Record<CustomerStatus, string> = {
  New: "bg-gray-100 text-gray-600 border-gray-200",
  Contacted: "bg-blue-50 text-blue-700 border-blue-200",
  "Follow Up": "bg-amber-50 text-amber-700 border-amber-200",
  Interested: "bg-violet-50 text-violet-700 border-violet-200",
  "Not Interested": "bg-red-50 text-red-600 border-red-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = AVATAR_COLORS[(name || "").charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div
      className={`rounded-full flex items-center justify-center font-black shrink-0 ${color} ${size === "lg" ? "w-14 h-14 text-lg" : "w-9 h-9 text-xs"
        }`}
    >
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "New") as CustomerStatus;
  const style = STATUS_STYLES[s] ?? STATUS_STYLES["New"];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style}`}>
      {s}
    </span>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [ordersFilter, setOrdersFilter] = useState<string>("all");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [ordersUserIds, setOrdersUserIds] = useState<Set<string>>(new Set());
  const [editForm, setEditForm] = useState<EditForm>({
    full_name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    status: "New",
  });
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((msg: string, type: ToastType = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message: msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const fetchCustomers = useCallback(
    async (pg = 1, retry = 0) => {
      setLoading(true);
      try {
        let q = supabase.from("customers").select("*", { count: "exact" });
        if (search.trim())
          q = q.or(
            `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`
          );
        if (statusFilter !== "All")
          q = q.eq("status", statusFilter);
        q = q.order(sortCol, { ascending: sortDir === "asc" });
        const from = (pg - 1) * PER_PAGE;
        q = q.range(from, from + PER_PAGE - 1);
        const { data, error, count } = await q;
        if (error) throw error;
        setCustomers((data as unknown as Customer[]) ?? []);
        setTotalCount(count ?? 0);
        const { data: orderUsers } = await supabase.from("orders").select("user_id");
        if (orderUsers) {
          setOrdersUserIds(new Set(orderUsers.map((o: any) => o.user_id).filter(Boolean)));
        }
      } catch (err: any) {
        if (retry < 2) {
          setTimeout(() => fetchCustomers(pg, retry + 1), 1500 * (retry + 1));
          toast(`Retrying… (${retry + 1}/2)`, "info");
        } else toast(`Failed: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [search, sortCol, sortDir, statusFilter, toast]
  );

  useEffect(() => { setPage(1); }, [search, sortCol, sortDir]);
  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchCustomers(page); }, [page, fetchCustomers]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) =>
    sortCol !== col ? (
      <ArrowUpDown className="w-3 h-3 opacity-30" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditForm({
      full_name: c.full_name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      address1: c.address1 ?? "",
      address2: c.address2 ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      pincode: c.pincode ?? "",
      notes: c.notes ?? "",
      status: (c.status as CustomerStatus) ?? "New",
    });
  };


  const handleSave = async () => {
    if (!editCustomer) return;
    if (!editForm.full_name.trim()) { toast("Name is required", "error"); return; }
    if (!editForm.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(editForm.email)) {
      toast("Valid email is required", "error"); return;
    }
    if (editForm.pincode && !/^\d{6}$/.test(editForm.pincode)) {
      toast("Pincode must be 6 digits", "error"); return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          full_name: editForm.full_name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || null,
          address1: editForm.address1.trim() || null,
          address2: editForm.address2.trim() || null,
          city: editForm.city.trim() || null,
          state: editForm.state.trim() || null,
          pincode: editForm.pincode.trim() || null,
          notes: editForm.notes.trim() || null,
          status: editForm.status || "New",
          updated_at: new Date().toISOString(),
        })
        .eq("id", editCustomer.id)
        .select();

      console.log("update result:", { error, editCustomer_id: editCustomer.id });
      if (error) throw error;

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editCustomer.id
            ? { ...c, ...editForm, updated_at: new Date().toISOString() }
            : c
        )
      );
      toast("Customer updated!");
      setEditCustomer(null);
    } catch (err: any) {
      toast(`Failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const fullAddress = (c: Customer) =>
    [c.address1, c.address2, c.city, c.state, c.pincode, c.country].filter(Boolean).join(", ");

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch ALL customers, not just current page
      let allCustomers: Customer[] = [];
      let q = supabase.from("customers").select("*");
      if (search.trim())
        q = q.or(
          `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`
        );
      q = q.order(sortCol, { ascending: sortDir === "asc" });
      const { data, error } = await q;
      if (error) throw error;
      allCustomers = (data as unknown as Customer[]) ?? [];
      const doc = new jsPDF("l", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginL = 10;
      const marginR = 10;
      const usableWidth = pageWidth - marginL - marginR;

      const hex2rgb = (hex: string): [number, number, number] => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
      ];

      // ── HEADER BAND ──
      doc.setFillColor(...hex2rgb("#4f46e5"));
      doc.rect(0, 0, pageWidth, 38, "F");
      doc.setFillColor(...hex2rgb("#6366f1"));
      doc.rect(0, 32, pageWidth, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("CUSTOMERS REPORT", marginL, 16);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(199, 210, 254);
      doc.text(
        `Exported on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}   •   Total Customers: ${totalCount}   •   Exported: ${allCustomers.length}`,
        marginL, 27
      );

      // ── KPI BOXES ──
      const kpiBoxes = [
        { label: "Total Customers", value: String(totalCount), color: "#6366f1" },
        { label: "Total Exported", value: String(allCustomers.length), color: "#10b981" },
        { label: "With Orders", value: String(allCustomers.filter(c => ordersUserIds.has(c.id)).length), color: "#f59e0b" },
      ];
      const kpiY = 44;
      const kpiW = usableWidth / kpiBoxes.length - 2;
      kpiBoxes.forEach((kpi, i) => {
        const x = marginL + i * (kpiW + 2);
        doc.setFillColor(...hex2rgb(kpi.color));
        doc.roundedRect(x, kpiY, kpiW, 16, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(kpi.value, x + kpiW / 2, kpiY + 7.5, { align: "center" });
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.text(kpi.label.toUpperCase(), x + kpiW / 2, kpiY + 13, { align: "center" });
      });

      // ── TABLE COLUMNS ──
      const cols: Array<{ header: string; key: keyof Customer | "location" | "orders"; w: number }> = [
        { header: "#", key: "id", w: 6 },
        { header: "Name", key: "full_name", w: 38 },
        { header: "Email", key: "email", w: 52 },
        { header: "Phone", key: "phone", w: 28 },
        { header: "Location", key: "location", w: 44 },
        { header: "Status", key: "status", w: 24 },
        { header: "Joined", key: "created_at", w: 22 },
        { header: "Orders", key: "orders", w: 16 },
      ];
      const totalColW = cols.reduce((s, c) => s + c.w, 0);
      const scale = usableWidth / totalColW;
      cols.forEach(c => { c.w = c.w * scale; });

      const STATUS_PDF_COLORS: Record<string, [number, number, number]> = {
        "New": [107, 114, 128],
        "Contacted": [59, 130, 246],
        "Follow Up": [217, 119, 6],
        "Interested": [124, 58, 237],
        "Not Interested": [239, 68, 68],
        "Converted": [16, 185, 129],
      };

      const headerH = 9;
      const baseRowH = 8;
      const lineH = 3.8;
      let curY = kpiY + 22;

      const drawHeader = () => {
        doc.setFillColor(...hex2rgb("#1e293b"));
        doc.rect(marginL, curY, usableWidth, headerH, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        let x = marginL;
        cols.forEach(col => { doc.text(col.header, x + 1.5, curY + 6); x += col.w; });
        curY += headerH;
      };

      drawHeader();

      allCustomers.forEach((c, idx) => {
        const location = [c.city, c.state, c.pincode].filter(Boolean).join(", ") || "—";
        const joined = new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

        // pre-calc wrapped lines
        doc.setFontSize(6.2);
        doc.setFont("helvetica", "normal");

        const cellData: Record<string, string> = {
          id: String(idx + 1),
          full_name: c.full_name || "—",
          email: c.email || "—",
          phone: c.phone || "—",
          location,
          status: c.status || "New",
          created_at: joined,
          orders: ordersUserIds.has(c.id) ? "Yes" : "No",
        };

        const cellLines: Record<string, string[]> = {};
        cols.forEach(col => {
          const key = col.key as string;
          const val = cellData[key] ?? "—";
          if (["full_name", "email", "location"].includes(key)) {
            const lines = doc.splitTextToSize(val, col.w - 3);
            cellLines[key] = lines.length > 2 ? [...lines.slice(0, 2).map((l: string, i: number) => i === 1 && lines.length > 2 ? l.slice(0, l.length - 1) + "…" : l)] : lines;
          } else {
            cellLines[key] = [val.length > 20 ? val.slice(0, 19) + "…" : val];
          }
        });

        const maxLines = Math.max(...Object.values(cellLines).map(l => l.length));
        const rowH = Math.max(baseRowH, maxLines * lineH + 3.5);

        // page break
        if (curY + rowH > pageHeight - 12) {
          doc.addPage("a4", "l");
          curY = 10;
          drawHeader();
        }

        // row bg
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
        doc.rect(marginL, curY, usableWidth, rowH, "F");
        doc.setDrawColor(226, 232, 240);
        doc.line(marginL, curY + rowH, marginL + usableWidth, curY + rowH);

        doc.setFontSize(6.2);
        let x = marginL;

        cols.forEach(col => {
          const key = col.key as string;
          const lines = cellLines[key] ?? ["—"];
          const textBlockH = lines.length * lineH;
          const textStartY = curY + (rowH - textBlockH) / 2 + lineH - 0.5;

          if (key === "status") {
            const color = STATUS_PDF_COLORS[cellData.status] ?? [100, 116, 139];
            doc.setFillColor(...color);
            doc.roundedRect(x + 0.5, curY + (rowH - 4.5) / 2, col.w - 1, 4.5, 1.2, 1.2, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text(cellData.status, x + col.w / 2, curY + rowH / 2 + 1.2, { align: "center" });
            doc.setFont("helvetica", "normal");
          } else if (key === "id") {
            doc.setTextColor(148, 163, 184);
            doc.text(lines[0], x + 1.5, curY + rowH / 2 + 1.2);
          } else if (key === "full_name") {
            doc.setTextColor(...hex2rgb("#4f46e5"));
            doc.setFont("helvetica", "bold");
            lines.forEach((line, li) => doc.text(line, x + 1.5, textStartY + li * lineH));
            doc.setFont("helvetica", "normal");
          } else if (key === "orders") {
            const isYes = cellData.orders === "Yes";
            doc.setTextColor(isYes ? 16 : 148, isYes ? 185 : 163, isYes ? 129 : 184);
            doc.setFont("helvetica", "bold");
            doc.text(cellData.orders, x + 1.5, curY + rowH / 2 + 1.2);
            doc.setFont("helvetica", "normal");
          } else {
            doc.setTextColor(30, 41, 59);
            lines.forEach((line, li) => doc.text(line, x + 1.5, textStartY + li * lineH));
          }
          x += col.w;
        });

        curY += rowH;
      });

      // ── FOOTER ──
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(241, 245, 249);
        doc.rect(0, pageHeight - 8, pageWidth, 8, "F");
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Customers Report  •  Confidential  •  Generated ${new Date().toLocaleString("en-IN")}`, marginL, pageHeight - 2.5);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginR, pageHeight - 2.5, { align: "right" });
      }

      doc.save(`Customers_Export_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err: any) {
      toast(`Export failed: ${err.message}`, "error");
    } finally {
      setExporting(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customers</h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            {totalCount} registered · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 disabled:opacity-60"
          >
            {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={() => fetchCustomers(page)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Customers",
            value: totalCount,
            icon: <Users className="w-5 h-5 text-indigo-600" />,
            bg: "bg-indigo-50",
          },
          {
            label: "Showing Now",
            value: customers.length,
            icon: <Eye className="w-5 h-5 text-emerald-600" />,
            bg: "bg-emerald-50",
          },
          {
            label: "With Orders",
            value: customers.filter((c) => ordersUserIds.has(c.id)).length,
            icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
            bg: "bg-amber-50",
          },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
            <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
            <div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
            <SlidersHorizontal className="w-4 h-4" /> Sort
          </button>
        </div>
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
            {/* Sort */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Newest First", col: "created_at", dir: "desc" as const },
                  { label: "Oldest First", col: "created_at", dir: "asc" as const },
                  { label: "Name A→Z", col: "full_name", dir: "asc" as const },
                  { label: "Name Z→A", col: "full_name", dir: "desc" as const },
                ].map(({ label, col, dir }) => (
                  <button
                    key={label}
                    onClick={() => { setSortCol(col); setSortDir(dir); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all
              ${sortCol === col && sortDir === dir
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Filter by Status</p>
              <div className="flex flex-wrap gap-2">
                {["All", ...CUSTOMER_STATUSES].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all
              ${statusFilter === s
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Filter */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Filter by Orders</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All Customers", value: "all" },
                  { label: "Has Orders", value: "with" },
                  { label: "No Orders", value: "without" },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setOrdersFilter(value)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all
              ${ordersFilter === value
                        ? "bg-amber-500 text-white border-amber-500"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active filters + clear */}
            {(statusFilter !== "All" || ordersFilter !== "all" || search.trim()) && (
              <div className="flex items-center gap-2 pt-1">
                <p className="text-xs text-gray-400 font-semibold">Active:</p>
                {statusFilter !== "All" && (
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1">
                    {statusFilter}
                    <button onClick={() => setStatusFilter("All")} className="hover:text-indigo-900">×</button>
                  </span>
                )}
                {ordersFilter !== "all" && (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                    {ordersFilter === "with" ? "Has Orders" : "No Orders"}
                    <button onClick={() => setOrdersFilter("all")} className="hover:text-amber-900">×</button>
                  </span>
                )}
                {search.trim() && (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center gap-1">
                    "{search}"
                    <button onClick={() => setSearch("")} className="hover:text-gray-900">×</button>
                  </span>
                )}
                <button
                  onClick={() => { setStatusFilter("All"); setOrdersFilter("all"); setSearch(""); }}
                  className="ml-auto text-xs font-black text-red-500 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
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
                <th className="px-5 py-3.5">
                  <button
                    onClick={() => toggleSort("full_name")}
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                  >
                    Customer <SortIcon col="full_name" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500">
                  Phone
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500">
                  Location
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500">
                  Status
                </th>
                <th className="px-5 py-3.5">
                  <button
                    onClick={() => toggleSort("created_at")}
                    className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                  >
                    Joined <SortIcon col="created_at" />
                  </button>
                </th>
                <th className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <CustomerRowSkeleton key={i} />)
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-bold text-gray-500">No customers found</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
                  </td>
                </tr>
              ) : (customers
                .filter(c =>
                  ordersFilter === "all" ? true :
                    ordersFilter === "with" ? ordersUserIds.has(c.id) :
                      !ordersUserIds.has(c.id)
                )
                .map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.full_name || "?"} />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate max-w-50">
                            {c.full_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-50">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 font-medium">{c.phone ?? "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      {c.city ? (
                        <div>
                          <p className="text-sm text-gray-700 font-medium">{c.city}</p>
                          <p className="text-xs text-gray-400">
                            {[c.state, c.pincode].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewCustomer(c)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)} of{" "}
              {totalCount}
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
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pg === page ? "bg-indigo-600 text-white" : "border border-gray-200 hover:bg-gray-50"
                      }`}
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
      {viewCustomer && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-gray-900">Customer Profile</h3>
              <button
                onClick={() => setViewCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar name={viewCustomer.full_name || "?"} size="lg" />
                <div>
                  <h4 className="text-xl font-black text-gray-900">{viewCustomer.full_name}</h4>
                  <p className="text-sm text-gray-500">{viewCustomer.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Member since{" "}
                    {new Date(viewCustomer.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Stats */}
              {(viewCustomer.order_count != null || viewCustomer.total_spent != null) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Orders
                      </p>
                    </div>
                    <p className="text-xl font-black text-gray-900">{viewCustomer.order_count ?? 0}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Total Spent
                      </p>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {viewCustomer.total_spent != null
                        ? `₹${viewCustomer.total_spent.toLocaleString("en-IN")}`
                        : "—"}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Customer Status
                </p>
                <StatusBadge status={viewCustomer.status} />
              </div>

              {/* Contact & address */}
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Contact & Address
                </p>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  {viewCustomer.email}
                </div>
                <div className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  {viewCustomer.phone || "No phone on file"}
                </div>
                <div className="flex items-start gap-2.5 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{fullAddress(viewCustomer) || "No address on file"}</span>
                </div>
              </div>

              {viewCustomer.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                    Staff Notes
                  </p>
                  <p className="text-sm text-amber-800 font-medium">{viewCustomer.notes}</p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setViewCustomer(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => { setViewCustomer(null); openEdit(viewCustomer); }}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCustomer && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Edit Customer</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editCustomer.email}</p>
              </div>
              <button
                onClick={() => setEditCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {/* Status — at top, saves immediately */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Customer Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}

                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60 cursor-pointer"
                >
                  {CUSTOMER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name *", key: "full_name" as const, placeholder: "Ravi Kumar" },
                  { label: "Email *", key: "email" as const, placeholder: "ravi@example.com" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={editForm[key]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={editForm.address1}
                  onChange={(e) => setEditForm((f) => ({ ...f, address1: e.target.value }))}
                  placeholder="House / Flat / Building"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={editForm.address2}
                  onChange={(e) => setEditForm((f) => ({ ...f, address2: e.target.value }))}
                  placeholder="Street / Area / Landmark"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "City", key: "city" as const, placeholder: "Asansol" },
                  { label: "State", key: "state" as const, placeholder: "West Bengal" },
                  { label: "Pincode", key: "pincode" as const, placeholder: "713302" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={editForm[key]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Staff Notes
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Internal notes visible only to staff..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                />
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setEditCustomer(null)}
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
