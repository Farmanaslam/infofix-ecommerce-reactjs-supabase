import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight, Copy, Check, Search, X, Package, Pencil } from "lucide-react";
import { Coupon } from "../types";

interface ProductOption {
  id: number;
  name: string;
  image_url: string | null;
  brand: string | null;
}

interface CouponForm {
  code: string;
  description: string;
  discount_amount: string;
  min_order_amount: string;
  max_uses: string;
  expires_at: string;
}

const EMPTY_FORM: CouponForm = {
  code: "",
  description: "",
  discount_amount: "",
  min_order_amount: "",
  max_uses: "",
  expires_at: "",
};

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Product selector state (create form)
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState<CouponForm>(EMPTY_FORM);
  const [editProductIds, setEditProductIds] = useState<number[]>([]);
  const [editProductSearch, setEditProductSearch] = useState("");
  const [showEditProductDropdown, setShowEditProductDropdown] = useState(false);
  const editDropdownRef = useRef<HTMLDivElement>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowProductDropdown(false);
      if (editDropdownRef.current && !editDropdownRef.current.contains(e.target as Node))
        setShowEditProductDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, image_url, brand")
      .eq("is_active", true)
      .neq("store_section", "wholesale")
      .order("name", { ascending: true });
    if (data) setAllProducts(data);
  };

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  // ── Create helpers ─────────────────────────────────────────────────────────
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand ?? "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProduct = (id: number) =>
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const removeSelectedProduct = (id: number) =>
    setSelectedProductIds(prev => prev.filter(x => x !== id));

  const handleCreate = async () => {
    setError(null);
    setSuccess(null);
    if (!form.code.trim()) return setError("Coupon code is required.");
    if (!form.discount_amount || isNaN(Number(form.discount_amount)))
      return setError("Enter a valid discount amount.");

    setSaving(true);
    const { error: err } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      description: form.description || null,
      discount_amount: Number(form.discount_amount),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
      product_ids: selectedProductIds.length > 0 ? selectedProductIds : null,
    });

    if (err) {
      setError(
        err.message.includes("unique")
          ? "This coupon code already exists."
          : err.message
      );
    } else {
      setSuccess(`Coupon "${form.code.toUpperCase()}" created!`);
      setForm(EMPTY_FORM);
      setSelectedProductIds([]);
      setProductSearch("");
      fetchCoupons();
    }
    setSaving(false);
  };

  // ── Edit helpers ───────────────────────────────────────────────────────────
  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditForm({
      code: coupon.code,
      description: coupon.description ?? "",
      discount_amount: String(coupon.discount_amount),
      min_order_amount: String((coupon as any).min_order_amount ?? 0),
      max_uses: coupon.max_uses != null ? String(coupon.max_uses) : "",
      expires_at: coupon.expires_at
        ? coupon.expires_at.split("T")[0]
        : "",
    });
    setEditProductIds((coupon as any).product_ids ?? []);
    setEditProductSearch("");
    setEditError(null);
  };

  const closeEdit = () => {
    setEditingCoupon(null);
    setEditError(null);
  };

  const filteredEditProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(editProductSearch.toLowerCase()) ||
    (p.brand ?? "").toLowerCase().includes(editProductSearch.toLowerCase())
  );

  const toggleEditProduct = (id: number) =>
    setEditProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleSaveEdit = async () => {
    setEditError(null);
    if (!editForm.code.trim()) return setEditError("Coupon code is required.");
    if (!editForm.discount_amount || isNaN(Number(editForm.discount_amount)))
      return setEditError("Enter a valid discount amount.");
    if (!editingCoupon) return;

    setEditSaving(true);
    const { error: err } = await supabase
      .from("coupons")
      .update({
        code: editForm.code.trim().toUpperCase(),
        description: editForm.description || null,
        discount_amount: Number(editForm.discount_amount),
        min_order_amount: Number(editForm.min_order_amount) || 0,
        max_uses: editForm.max_uses ? Number(editForm.max_uses) : null,
        expires_at: editForm.expires_at || null,
        product_ids: editProductIds.length > 0 ? editProductIds : null,
      })
      .eq("id", editingCoupon.id);

    if (err) {
      setEditError(
        err.message.includes("unique")
          ? "A coupon with this code already exists."
          : err.message
      );
    } else {
      closeEdit();
      fetchCoupons();
    }
    setEditSaving(false);
  };

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const toggleActive = async (coupon: Coupon) => {
    await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Delete this coupon permanently?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProductNames = (productIds: number[] | null) => {
    if (!productIds || productIds.length === 0) return null;
    return productIds
      .map(id => allProducts.find(p => p.id === id)?.name ?? `#${id}`)
      .filter(Boolean);
  };

  // ── Product selector sub-component (reused in both forms) ─────────────────
  const ProductSelector = ({
    selectedIds,
    onToggle,
    onRemove,
    onClearAll,
    search,
    onSearchChange,
    showDropdown,
    onFocus,
    filteredList,
    ref: ref_,
  }: {
    selectedIds: number[];
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
    onClearAll: () => void;
    search: string;
    onSearchChange: (v: string) => void;
    showDropdown: boolean;
    onFocus: () => void;
    filteredList: ProductOption[];
    ref: React.RefObject<HTMLDivElement>;
  }) => (
    <div className="mt-4 space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Package className="w-3.5 h-3.5 text-indigo-400" />
        Restrict to Specific Products
        <span className="text-slate-300 font-normal normal-case tracking-normal">
          — leave empty to apply to all products
        </span>
      </label>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          {selectedIds.map(id => {
            const p = allProducts.find(x => x.id === id);
            return (
              <span key={id} className="flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                {p?.image_url && <img src={p.image_url} alt="" className="w-4 h-4 rounded object-cover" />}
                {p?.name ?? `#${id}`}
                <button onClick={() => onRemove(id)} className="text-indigo-300 hover:text-red-500 transition ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-red-500 font-semibold px-2 transition">
            Clear all
          </button>
        </div>
      )}

      <div className="relative" ref={ref_}>
        <div className="flex items-center gap-2 bg-slate-50 border border-transparent focus-within:ring-2 focus-within:ring-indigo-500 rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => { onSearchChange(e.target.value); onFocus(); }}
            onFocus={onFocus}
            placeholder="Search products…"
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
          />
          {search && (
            <button onClick={() => onSearchChange("")}>
              <X className="w-4 h-4 text-slate-300 hover:text-slate-500" />
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto">
            {filteredList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No products found</p>
            ) : filteredList.map(p => {
              const isSel = selectedIds.includes(p.id);
              return (
                <button key={p.id} onClick={() => onToggle(p.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition hover:bg-indigo-50 ${isSel ? "bg-indigo-50" : ""}`}>
                  {p.image_url
                    ? <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0" />
                    : <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-slate-400" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    {p.brand && <p className="text-xs text-slate-400">{p.brand}</p>}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${isSel ? "border-indigo-600 bg-indigo-600" : "border-slate-200"}`}>
                    {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 font-medium">
        {selectedIds.length === 0
          ? "🌐 This coupon will apply to all products."
          : `🎯 This coupon will only apply to ${selectedIds.length} selected product${selectedIds.length > 1 ? "s" : ""}.`}
      </p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupons</h1>
        <p className="text-slate-500 font-medium mt-1">
          Create and manage discount coupon codes. Optionally restrict coupons to specific products.
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" /> Create New Coupon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Coupon Code *</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. SAVE200"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Discount Amount (₹) *</label>
            <input type="number" value={form.discount_amount} onChange={e => setForm(f => ({ ...f, discount_amount: e.target.value }))}
              placeholder="e.g. 200"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min Order Amount (₹)</label>
            <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
              placeholder="e.g. 999 (0 = no minimum)"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Uses (blank = unlimited)</label>
            <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              placeholder="e.g. 100"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expires On (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description (shown to users)</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. ₹200 off on orders above ₹999"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
          </div>
        </div>

        <ProductSelector
          selectedIds={selectedProductIds}
          onToggle={toggleProduct}
          onRemove={removeSelectedProduct}
          onClearAll={() => setSelectedProductIds([])}
          search={productSearch}
          onSearchChange={v => { setProductSearch(v); setShowProductDropdown(true); }}
          showDropdown={showProductDropdown}
          onFocus={() => setShowProductDropdown(true)}
          filteredList={filteredProducts}
          ref={dropdownRef}
        />

        {error && <p className="mt-4 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-xl">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-600 font-semibold bg-emerald-50 px-4 py-2 rounded-xl">✓ {success}</p>}

        <button onClick={handleCreate} disabled={saving}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-60">
          <Plus className="w-4 h-4" /> {saving ? "Creating..." : "Create Coupon"}
        </button>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900">All Coupons ({coupons.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No coupons yet. Create one above.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {coupons.map(coupon => {
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
              const isMaxed = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;
              const productNames = getProductNames((coupon as any).product_ids);

              return (
                <div key={coupon.id} className="px-8 py-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="shrink-0">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2">
                        <span className="font-black text-indigo-700 tracking-widest text-sm">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code, coupon.id)} className="text-indigo-400 hover:text-indigo-600 transition">
                          {copiedId === coupon.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {!coupon.is_active && <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                        {isExpired && <span className="text-[10px] font-black bg-red-100 text-red-500 px-2 py-0.5 rounded-full uppercase">Expired</span>}
                        {isMaxed && <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Limit Reached</span>}
                        {coupon.is_active && !isExpired && !isMaxed && <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Active</span>}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                        <span className="text-indigo-600 font-black">₹{coupon.discount_amount} off</span>
                        {(coupon as any).min_order_amount > 0 && <span>Min ₹{(coupon as any).min_order_amount}</span>}
                        <span>{coupon.used_count} used{coupon.max_uses ? ` / ${coupon.max_uses} max` : ""}</span>
                        {coupon.expires_at && <span>Expires {new Date(coupon.expires_at).toLocaleDateString("en-IN")}</span>}
                        {coupon.description && <span className="text-slate-400 italic">{coupon.description}</span>}
                      </div>
                      {productNames && productNames.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide">🎯 Product Specific</span>
                          {productNames.slice(0, 3).map((name, i) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{name}</span>
                          ))}
                          {productNames.length > 3 && <span className="text-[10px] text-slate-400 font-semibold">+{productNames.length - 3} more</span>}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">🌐 Applies to all products</span>
                      )}
                    </div>
                  </div>

                  {/* Actions — added edit button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => openEdit(coupon)}
                      className="text-slate-400 hover:text-indigo-600 transition" title="Edit coupon">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleActive(coupon)}
                      className="text-slate-400 hover:text-indigo-600 transition"
                      title={coupon.is_active ? "Deactivate" : "Activate"}>
                      {coupon.is_active
                        ? <ToggleRight className="w-6 h-6 text-indigo-600" />
                        : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                Edit Coupon
                <span className="font-black text-indigo-600 tracking-widest">{editingCoupon.code}</span>
              </h2>
              <button onClick={closeEdit} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Coupon Code *</label>
                  <input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Discount Amount (₹) *</label>
                  <input type="number" value={editForm.discount_amount} onChange={e => setEditForm(f => ({ ...f, discount_amount: e.target.value }))}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Min Order Amount (₹)</label>
                  <input type="number" value={editForm.min_order_amount} onChange={e => setEditForm(f => ({ ...f, min_order_amount: e.target.value }))}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Uses</label>
                  <input type="number" value={editForm.max_uses} onChange={e => setEditForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="blank = unlimited"
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expires On</label>
                  <input type="date" value={editForm.expires_at} onChange={e => setEditForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                  <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent" />
                </div>
              </div>

              {/* Product selector for edit */}
              <ProductSelector
                selectedIds={editProductIds}
                onToggle={toggleEditProduct}
                onRemove={id => setEditProductIds(prev => prev.filter(x => x !== id))}
                onClearAll={() => setEditProductIds([])}
                search={editProductSearch}
                onSearchChange={v => { setEditProductSearch(v); setShowEditProductDropdown(true); }}
                showDropdown={showEditProductDropdown}
                onFocus={() => setShowEditProductDropdown(true)}
                filteredList={filteredEditProducts}
                ref={editDropdownRef}
              />

              {editError && <p className="text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-xl">{editError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100">
              <button onClick={closeEdit}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition disabled:opacity-60">
                <Check className="w-4 h-4" /> {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
