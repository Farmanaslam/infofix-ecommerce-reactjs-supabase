import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Wand2,
  RefreshCw,
  X,
  Upload,
  Camera,
  Download,
  Check,
  AlertTriangle,
  Package,
  Zap,
  Image as ImageIcon,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Percent,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  DBProduct,
  DBCategory,
  DBSubcategory,
  DBTag,
  DBProductFormState,
} from "../types";
import {
  generateProductDescription,
  getInventoryAdvice,
} from "../services/geminiService";
import { InventoryRowSkeleton } from "./Skeleton";
import { useStore } from "../context/StoreContext";
// ─── Constants ────────────────────────────────────────────────────────────────
const CONDITIONS = ["New", "Refurbished", "Used"] as const;
const PER_PAGE = 15;

const EMPTY_FORM: DBProductFormState = {
  name: "",
  description: "",
  brand: "",
  model: "",
  retail_price: "",
  discounted_price: "",
  discount_percent: "",
  stock_quantity: "",
  condition: "New",
  category_id: "",
  subcategory_id: "",
  image_url: "",
  image_urls: [] as string[],
  is_active: true,
  specs: [{ key: "", value: "" }],
  tag_ids: [],
  min_order_quantity: "1",
};

const PLACEHOLDER_IMAGES: Record<string, string> = {
  laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  desktop:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
  monitor:
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
  keyboard:
    "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
  ram: "https://images.unsplash.com/photo-1562976540-1502c2145851?w=600&q=80",
  gpu: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stockColor = (qty: number) =>
  qty === 0
    ? "text-red-600 bg-red-50 border-red-200"
    : qty < 10
      ? "text-orange-600 bg-orange-50 border-orange-200"
      : qty < 30
        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
        : "text-emerald-600 bg-emerald-50 border-emerald-200";

const stockDot = (qty: number) =>
  qty === 0
    ? "bg-red-500"
    : qty < 10
      ? "bg-orange-500"
      : qty < 30
        ? "bg-yellow-500"
        : "bg-emerald-500";

type ToastType = "success" | "error" | "info";
interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// ─── Tiny layout helpers ──────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
      {label}
    </label>
    {children}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export const Inventory: React.FC = () => {
  const { removeFromCart, cart } = useStore();
  // ── Data ──
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DBSubcategory[]>([]);
  const [tags, setTags] = useState<DBTag[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Filters / sort / page ──
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">(
    "",
  );
  const [filterStock, setFilterStock] = useState<"" | "out" | "low" | "ok">("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // ── Row selection ──
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // ── Product modal ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DBProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formTab, setFormTab] = useState<"basic" | "details" | "media">(
    "basic",
  );

  // ── Bulk price modal ──
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceCatId, setPriceCatId] = useState("");
  const [priceSubcatId, setPriceSubcatId] = useState("");
  const [priceField, setPriceField] = useState<
    "retail_price" | "discounted_price" | "both"
  >("both");
  const [priceType, setPriceType] = useState<"percent" | "fixed">("percent");
  const [priceValue, setPriceValue] = useState("");
  const [priceDir, setPriceDir] = useState<"increase" | "decrease">("increase");
  const [pricePreview, setPricePreview] = useState<
    { id: number; name: string; before: number; after: number }[]
  >([]);
  const [pricePreviewLoading, setPricePreviewLoading] = useState(false);
  const [applyingPrice, setApplyingPrice] = useState(false);

  // ── AI ──
  const [generating, setGenerating] = useState<number | null>(null);
  const [adviceMap, setAdviceMap] = useState<Record<number, string>>({});

  // ── Image upload ──
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ── Toasts ──
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Derived ──
  const filteredSubcats = subcategories.filter(
    (s) =>
      !form.category_id || String(s.category_id) === String(form.category_id),
  );
  const priceFilteredSubcats = subcategories.filter(
    (s) => !priceCatId || String(s.category_id) === String(priceCatId),
  );
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH META
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchMeta = useCallback(async () => {
    if (!supabase) return;
    const [{ data: cats }, { data: subcats }, { data: tgs }] =
      await Promise.all([
        supabase.from("categories").select("id,name,slug").order("name"),
        supabase
          .from("subcategories")
          .select("id,category_id,name,slug")
          .order("name"),
        supabase.from("tags").select("id,name").order("name"),
      ]);
    if (cats) setCategories(cats as DBCategory[]);
    if (subcats) setSubcategories(subcats as DBSubcategory[]);
    if (tgs) setTags(tgs as DBTag[]);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchProducts = useCallback(
    async (pg = 1) => {
      if (!supabase) return;
      setLoading(true);
      try {
        let q = supabase.from("products").select(
          `
        id, name, description, image_url,images, brand, model, specs,
        retail_price, discounted_price, discount_percent,
        stock_quantity, condition, is_active, min_order_quantity,
        category_id, subcategory_id, created_at,
        categories(name,slug), subcategories(name,slug),
        product_tags(tags(id,name))
      `,
          { count: "exact" },
        );
        if (searchTerm.trim())
          q = q.or(
            `name.ilike.%${searchTerm.trim()}%,brand.ilike.%${searchTerm.trim()}%,model.ilike.%${searchTerm.trim()}%`,
          );
        if (filterCategory) q = q.eq("category_id", filterCategory);
        if (filterCondition) q = q.eq("condition", filterCondition);
        if (filterStatus === "active") q = q.eq("is_active", true);
        if (filterStatus === "inactive") q = q.eq("is_active", false);
        if (filterStock === "out") q = q.eq("stock_quantity", 0);
        if (filterStock === "low")
          q = q.gt("stock_quantity", 0).lt("stock_quantity", 10);
        if (filterStock === "ok") q = q.gte("stock_quantity", 10);

        q = q.order(sortCol, { ascending: sortDir === "asc" });
        const from = (pg - 1) * PER_PAGE;
        q = q.range(from, from + PER_PAGE - 1);

        const { data, error, count } = await q;
        if (error) throw error;
        setProducts((data as unknown as DBProduct[]) ?? []);
        setTotalCount(count ?? 0);
      } catch (err: any) {
        toast(`Fetch failed: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      filterCategory,
      filterCondition,
      filterStatus,
      filterStock,
      sortCol,
      sortDir,
      toast,
    ],
  );

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [
    searchTerm,
    filterCategory,
    filterCondition,
    filterStatus,
    filterStock,
    sortCol,
    sortDir,
  ]);
  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SORT ICONS
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════
  const handleImageFile = async (file: File) => {
    if (!supabase) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5MB", "error");
      return;
    }
    if ((form.image_urls?.length ?? 0) >= 5) {
      toast("Max 5 images allowed", "error");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImagePreviews((prev) => [...prev, src]);
      if (!imagePreview) setImagePreview(src);
    };
    reader.readAsDataURL(file);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({
        ...f,
        image_url: f.image_url || publicUrl,
        image_urls: [...(f.image_urls ?? []), publicUrl],
      }));
      toast("Image uploaded!");
    } catch {
      const localUrl = URL.createObjectURL(file);
      setForm((f) => ({
        ...f,
        image_url: f.image_url || localUrl,
        image_urls: [...(f.image_urls ?? []), localUrl],
      }));
      toast("Storage bucket not found — image previewed locally.", "info");
    } finally {
      setUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL OPEN/EDIT
  // ═══════════════════════════════════════════════════════════════════════════
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImagePreview("");
    setImagePreviews([]);
    setFormTab("basic");
    setModalOpen(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditingId(p.id);
    const specs = p.specs
      ? Object.entries(p.specs).map(([key, value]) => ({
        key,
        value: String(value),
      }))
      : [{ key: "", value: "" }];
    const existingImages: string[] =
      Array.isArray((p as any).images) && (p as any).images.length > 0
        ? (p as any).images
        : p.image_url
          ? [p.image_url]
          : [];
    setForm({
      name: p.name ?? "",
      description: p.description ?? "",
      brand: p.brand ?? "",
      model: p.model ?? "",
      retail_price: String(p.retail_price ?? ""),
      discounted_price: String(p.discounted_price ?? ""),
      discount_percent: String(p.discount_percent ?? ""),
      stock_quantity: String(p.stock_quantity ?? ""),
      condition: p.condition ?? "New",
      category_id: String(p.category_id ?? ""),
      subcategory_id: p.subcategory_id ? String(p.subcategory_id) : "",
      image_url: p.image_url ?? "",
      image_urls: existingImages,
      is_active: p.is_active ?? true,
      specs: specs.length ? specs : [{ key: "", value: "" }],
      min_order_quantity: String(p.min_order_quantity ?? "1"),
      tag_ids: (p.product_tags ?? [])
        .map((pt: any) => pt.tags?.id)
        .filter(Boolean),
    });
    setImagePreview(p.image_url ?? "");
    setImagePreviews(existingImages);
    setImagePreview(p.image_url ?? "");
    setForm((f) => ({
      ...f,
      image_urls: Array.isArray((p as any).images)
        ? (p as any).images
        : p.image_url
          ? [p.image_url]
          : [],
    }));
    setFormTab("basic");
    setModalOpen(true);

  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE PRODUCT
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!form.name.trim()) {
      toast("Product name is required", "error");
      return;
    }
    if (!form.retail_price) {
      toast("Retail price is required", "error");
      return;
    }
    if (!form.stock_quantity) {
      toast("Stock quantity is required", "error");
      return;
    }
    if (!form.category_id) {
      toast("Category is required", "error");
      return;
    }
    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      form.specs.forEach(({ key, value }) => {
        if (key.trim()) specsObj[key.trim()] = value;
      });
      const retailPrice = parseFloat(form.retail_price) || 0;
      const discPercent = parseFloat(form.discount_percent) || 0;
      const discPrice =
        form.discounted_price !== ""
          ? parseFloat(form.discounted_price)
          : retailPrice;
      const allImages = form.image_urls?.length
        ? form.image_urls
        : form.image_url
          ? [form.image_url]
          : [];

      const primaryImage = allImages[0] ?? form.image_url ?? null;
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
        retail_price: retailPrice,
        discount_percent: discPercent,
        discounted_price: discPrice,
        min_order_quantity: parseInt(form.min_order_quantity ?? "1") || 1,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        condition: form.condition,
        category_id: parseInt(form.category_id),
        subcategory_id: form.subcategory_id
          ? parseInt(form.subcategory_id)
          : null,
        image_url: primaryImage,
        images: allImages,
        is_active: form.is_active,
        specs: specsObj,
      };
      let productId = editingId;
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast("Product updated!");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = (data as any).id;
        toast("Product added!");
      }

      if (productId) {
        await supabase
          .from("product_tags")
          .delete()
          .eq("product_id", productId);
        if (form.tag_ids.length) {
          await supabase.from("product_tags").insert(
            form.tag_ids.map((tid) => ({
              product_id: productId,
              tag_id: tid,
            })),
          );
        }
      }
      setModalOpen(false);
      fetchProducts(page);
    } catch (err: any) {
      toast(`Save failed: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════════════════════
  const handleDelete = async (id: number) => {
    if (!supabase || !confirm("Delete this product? This cannot be undone."))
      return;
    try {
      await supabase.from("product_tags").delete().eq("product_id", id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      // ── Remove from in-memory cart if present ──
      if (cart.some((item) => String(item.id) === String(id))) {
        removeFromCart(String(id));
      }

      toast("Product deleted.");
      fetchProducts(page);
    } catch (err: any) {
      toast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !supabase ||
      selected.size === 0 ||
      !confirm(`Delete ${selected.size} product(s)?`)
    )
      return;
    const ids = [...selected];
    try {
      await supabase.from("product_tags").delete().in("product_id", ids);
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;

      // ── Remove all deleted products from in-memory cart ──
      ids.forEach((id) => {
        if (cart.some((item) => String(item.id) === String(id))) {
          removeFromCart(String(id));
        }
      });

      setSelected(new Set());
      toast(`${ids.length} products deleted.`);
      fetchProducts(page);
    } catch (err: any) {
      toast(`Bulk delete failed: ${err.message}`, "error");
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TOGGLE ACTIVE
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleActive = async (p: DBProduct) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("products")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    if (error) {
      toast("Update failed", "error");
      return;
    }
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)),
    );
    toast(p.is_active ? "Product hidden from store." : "Product is now live!");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // AI
  // ═══════════════════════════════════════════════════════════════════════════
  const handleAIDesc = async (p: DBProduct) => {
    setGenerating(p.id);
    try {
      const desc = await generateProductDescription(
        p.name,
        p.categories?.name ?? "",
        ["Infofix certified", "Quality tested"],
      );
      if (desc && supabase) {
        await supabase
          .from("products")
          .update({ description: desc })
          .eq("id", p.id);
        setProducts((prev) =>
          prev.map((x) => (x.id === p.id ? { ...x, description: desc } : x)),
        );
        toast("AI description written!");
      }
    } finally {
      setGenerating(null);
    }
  };

  const handleGetAdvice = async (p: DBProduct) => {
    const advice = await getInventoryAdvice(p.stock_quantity, "Stable demand");
    if (advice) setAdviceMap((prev) => ({ ...prev, [p.id]: advice }));
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT CSV
  // ═══════════════════════════════════════════════════════════════════════════
  const exportCSV = () => {
    if (products.length === 0) {
      toast("No products to export", "info");
      return;
    }
    const headers = [
      "ID",
      "Name",
      "Brand",
      "Model",
      "Category",
      "Subcategory",
      "Condition",
      "Retail Price",
      "Discounted Price",
      "Discount %",
      "Stock",
      "Rating",
      "Reviews",
      "Active",
      "Created At",
    ];
    const rows = products.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.brand ?? ""}"`,
      `"${p.model ?? ""}"`,
      `"${p.categories?.name ?? ""}"`,
      `"${p.subcategories?.name ?? ""}"`,
      p.condition,
      p.retail_price,
      p.discounted_price,
      p.discount_percent,
      p.stock_quantity,
      p.rating_avg,
      p.rating_count,
      p.is_active ? "Yes" : "No",
      new Date(p.created_at).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `infofix-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported!");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK PRICE — PREVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const previewPriceAdjust = useCallback(async () => {
    if (!supabase || !priceValue || !priceCatId) return;
    setPricePreviewLoading(true);
    try {
      let q = supabase
        .from("products")
        .select("id, name, retail_price, discounted_price")
        .eq("category_id", priceCatId);
      if (priceSubcatId) q = q.eq("subcategory_id", priceSubcatId);
      const { data, error } = await q;
      if (error) throw error;

      const adjVal = parseFloat(priceValue);
      const preview = (data ?? []).map((p: any) => {
        const src =
          priceField === "discounted_price"
            ? (p.discounted_price ?? p.retail_price)
            : p.retail_price;
        let after: number;
        if (priceType === "percent") {
          const factor =
            priceDir === "increase" ? 1 + adjVal / 100 : 1 - adjVal / 100;
          after = Math.round(src * factor);
        } else {
          after = priceDir === "increase" ? src + adjVal : src - adjVal;
        }
        return {
          id: p.id,
          name: p.name,
          before: src,
          after: Math.max(0, after),
        };
      });
      setPricePreview(preview);
    } catch (err: any) {
      toast(`Preview failed: ${err.message}`, "error");
    } finally {
      setPricePreviewLoading(false);
    }
  }, [
    supabase,
    priceCatId,
    priceSubcatId,
    priceField,
    priceType,
    priceValue,
    priceDir,
    toast,
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK PRICE — APPLY
  // ═══════════════════════════════════════════════════════════════════════════
  const applyPriceAdjust = async () => {
    if (!supabase || pricePreview.length === 0) return;
    if (!confirm(`Update prices for ${pricePreview.length} product(s)?`))
      return;
    setApplyingPrice(true);
    try {
      const updates = pricePreview.map((p) => {
        const update: Record<string, number> = {};
        if (priceField === "retail_price") {
          update.retail_price = p.after;
        } else if (priceField === "discounted_price") {
          // Can't update generated column — update discount_percent instead
          // Find the original product to get its retail_price
          const original = products.find((prod) => prod.id === p.id);
          const retail = original?.retail_price ?? p.before;
          if (retail > 0 && p.after < retail) {
            update.discount_percent = Math.round((1 - p.after / retail) * 100);
          } else {
            update.discount_percent = 0;
          }
        } else if (priceField === "both") {
          update.retail_price = p.after;
          update.discount_percent = 0; // no discount — selling at full price
        }
        return supabase!.from("products").update(update).eq("id", p.id);
      });
      const results = await Promise.all(updates);
      const failed = results.filter((r: any) => r.error).length;
      if (failed) throw new Error(`${failed} updates failed`);
      toast(`Prices updated for ${pricePreview.length} product(s)!`);
      setPriceModalOpen(false);
      setPricePreview([]);
      fetchProducts(page);
    } catch (err: any) {
      toast(`Apply failed: ${err.message}`, "error");
    } finally {
      setApplyingPrice(false);
    }
  };

  const resetPriceModal = () => {
    setPriceCatId("");
    setPriceSubcatId("");
    setPriceField("both");
    setPriceType("percent");
    setPriceValue("");
    setPriceDir("increase");
    setPricePreview([]);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleSelectAll = () =>
    setSelected(
      selected.size === products.length
        ? new Set()
        : new Set(products.map((p) => p.id)),
    );

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
  const addSpec = () =>
    setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (i: number) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: "key" | "value", val: string) =>
    setForm((f) => ({
      ...f,
      specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    }));

  const handlePriceChange = (
    field: "retail_price" | "discounted_price" | "discount_percent",
    val: string,
  ) => {
    const updated = { ...form, [field]: val };

    const retail = parseFloat(updated.retail_price) || 0;
    const disc = parseFloat(updated.discounted_price) || 0;

    // ✅ ONLY calculate percentage
    if (retail > 0 && disc > 0 && disc < retail) {
      updated.discount_percent = ((1 - disc / retail) * 100).toFixed(0);
    }

    setForm(updated);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-200 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: "fadeInRight 0.3s ease" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold
              ${t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"}`}
          >
            {t.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : t.type === "error" ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <Zap className="w-4 h-4 shrink-0" />
            )}
            <span className="max-w-xs leading-tight">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Inventory
          </h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            {totalCount} products · Page {page}/{totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete {selected.size}
            </button>
          )}
          <button
            onClick={() => {
              resetPriceModal();
              setPriceModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-100 transition-colors"
          >
            <Percent className="w-4 h-4" /> Bulk Price Update
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors
              ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(filterCategory ||
              filterCondition ||
              filterStatus ||
              filterStock) && (
                <span className="w-2 h-2 rounded-full bg-orange-500" />
              )}
          </button>
        </div>
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Category",
                value: filterCategory,
                set: setFilterCategory,
                options: [
                  ["", "All Categories"],
                  ...categories.map((c) => [String(c.id), c.name]),
                ] as [string, string][],
              },
              {
                label: "Condition",
                value: filterCondition,
                set: setFilterCondition,
                options: [
                  ["", "All Conditions"],
                  ...CONDITIONS.map((c) => [c, c]),
                ] as [string, string][],
              },
              {
                label: "Status",
                value: filterStatus,
                set: (v: any) => setFilterStatus(v),
                options: [
                  ["", "All Statuses"],
                  ["active", "Active"],
                  ["inactive", "Hidden"],
                ] as [string, string][],
              },
              {
                label: "Stock",
                value: filterStock,
                set: (v: any) => setFilterStock(v),
                options: [
                  ["", "All Stock"],
                  ["out", "Out of Stock"],
                  ["low", "Low (<10)"],
                  ["ok", "In Stock"],
                ] as [string, string][],
              },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  {label}
                </label>
                <select
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {options.map(([val, lbl]) => (
                    <option key={val} value={val}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {(filterCategory ||
              filterCondition ||
              filterStatus ||
              filterStock) && (
                <button
                  onClick={() => {
                    setFilterCategory("");
                    setFilterCondition("");
                    setFilterStatus("");
                    setFilterStock("");
                  }}
                  className="col-span-2 md:col-span-4 text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-700"
                >
                  <X className="w-3 h-3" /> Clear all filters
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
                <th className="px-4 py-3.5 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selected.size === products.length &&
                      products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                {[
                  { label: "Product", col: "name" },
                  { label: "Stock", col: "stock_quantity" },
                  { label: "Price", col: "retail_price" },
                ].map(({ label, col }) => (
                  <th key={col} className="px-4 py-3.5">
                    <button
                      onClick={() => toggleSort(col)}
                      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800"
                    >
                      {label} <SortIcon col={col} />
                    </button>
                  </th>
                ))}
                {["Category", "Condition", "Status", "AI", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 ${h === "Actions" ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <InventoryRowSkeleton key={i} />
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-bold text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Adjust filters or add a new product.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/70 transition-colors ${selected.has(p.id) ? "bg-indigo-50/40" : ""}`}
                  >
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleSelect(p.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selected.has(p.id) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=60";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-45">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {p.brand ? `${p.brand} · ` : ""}SKU-
                            {String(p.id).padStart(5, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${stockColor(p.stock_quantity)}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stockDot(p.stock_quantity)}`}
                          />
                          {p.stock_quantity} units
                        </span>
                        {adviceMap[p.id] ? (
                          <p className="text-[10px] text-indigo-600 italic max-w-35 leading-tight">
                            {adviceMap[p.id]}
                          </p>
                        ) : (
                          <button
                            onClick={() => handleGetAdvice(p)}
                            className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> AI Insight
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-black text-gray-900">
                        ₹
                        {(p.discounted_price ?? p.retail_price).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                      {p.discount_percent > 0 && (
                        <>
                          <p className="text-[10px] text-gray-400 line-through">
                            ₹{p.retail_price.toLocaleString("en-IN")}
                          </p>
                          <span className="text-[10px] text-red-600 font-bold">
                            {p.discount_percent}% OFF
                          </span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                        {p.categories?.name ?? "—"}
                      </span>
                      {p.subcategories?.name && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {p.subcategories.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                      ${p.condition === "New" ? "bg-blue-50 text-blue-600" : p.condition === "Refurbished" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {p.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActive(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all
                        ${p.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}
                      >
                        {p.is_active ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {p.is_active ? "Live" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleAIDesc(p)}
                        disabled={generating === p.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        <Wand2
                          className={`w-3 h-3 ${generating === p.id ? "animate-spin" : ""}`}
                        />
                        {generating === p.id ? "Writing..." : "AI Desc"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg =
                  totalPages <= 7
                    ? i + 1
                    : page <= 4
                      ? i + 1
                      : page >= totalPages - 3
                        ? totalPages - 6 + i
                        : page - 3 + i;
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

      {/* ═══════════════════════════════════════════════════════
          BULK PRICE UPDATE MODAL
      ══════════════════════════════════════════════════════ */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  Bulk Price Update
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Increase or decrease prices for all products in a category or
                  subcategory.
                </p>
              </div>
              <button
                onClick={() => {
                  setPriceModalOpen(false);
                  setPricePreview([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Scope */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Step 1 — Select Scope
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category *">
                    <select
                      value={priceCatId}
                      onChange={(e) => {
                        setPriceCatId(e.target.value);
                        setPriceSubcatId("");
                        setPricePreview([]);
                      }}
                      className="input"
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Subcategory (optional — leave blank for all)">
                    <select
                      value={priceSubcatId}
                      onChange={(e) => {
                        setPriceSubcatId(e.target.value);
                        setPricePreview([]);
                      }}
                      disabled={
                        !priceCatId || priceFilteredSubcats.length === 0
                      }
                      className="input disabled:opacity-40"
                    >
                      <option value="">All subcategories</option>
                      {priceFilteredSubcats.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Adjustment */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Step 2 — Adjustment
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {/* Apply to */}
                  <Field label="Apply To">
                    <div className="flex flex-col gap-1.5">
                      {(
                        [
                          ["both", "Both (MRP & Selling price)"],
                          ["retail_price", "MRP / Retail price only"],
                          ["discounted_price", "Selling price only"],
                        ] as const
                      ).map(([val, lbl]) => (
                        <label
                          key={val}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold transition-all
                          ${priceField === val ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"}`}
                        >
                          <input
                            type="radio"
                            name="priceField"
                            value={val}
                            checked={priceField === val}
                            onChange={() => {
                              setPriceField(val);
                              setPricePreview([]);
                            }}
                            className="accent-amber-500"
                          />
                          {lbl}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className="space-y-4">
                    <Field label="Direction">
                      <div className="flex gap-2">
                        {(["increase", "decrease"] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => {
                              setPriceDir(dir);
                              setPricePreview([]);
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all capitalize
                              ${priceDir === dir
                                ? dir === "increase"
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-red-600 text-white border-red-600"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
                              }`}
                          >
                            {dir === "increase" ? "▲" : "▼"} {dir}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Adjustment Type">
                      <div className="flex gap-2">
                        {(["percent", "fixed"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setPriceType(t);
                              setPricePreview([]);
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all
                              ${priceType === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                          >
                            {t === "percent" ? "% Percent" : "₹ Fixed"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field
                      label={`Value ${priceType === "percent" ? "(%)" : "(₹)"}`}
                    >
                      <input
                        type="number"
                        min="0"
                        step={priceType === "percent" ? "0.5" : "1"}
                        value={priceValue}
                        onChange={(e) => {
                          setPriceValue(e.target.value);
                          setPricePreview([]);
                        }}
                        placeholder={
                          priceType === "percent" ? "e.g. 5" : "e.g. 500"
                        }
                        className="input font-bold"
                      />
                    </Field>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!priceCatId || !priceValue || pricePreviewLoading}
                  onClick={previewPriceAdjust}
                  className="mt-4 w-full py-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm font-black hover:bg-amber-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {pricePreviewLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading
                      preview...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Preview Changes
                    </>
                  )}
                </button>
              </div>

              {/* Preview table */}
              {pricePreview.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    Preview — {pricePreview.length} product(s) will be updated
                  </p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-black uppercase tracking-widest text-gray-500">
                            Product
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-black uppercase tracking-widest text-gray-500">
                            Before
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-black uppercase tracking-widest text-gray-500">
                            After
                          </th>
                          <th className="px-4 py-2.5 text-right text-xs font-black uppercase tracking-widest text-gray-500">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pricePreview.map((p) => {
                          const diff = p.after - p.before;
                          return (
                            <tr key={p.id}>
                              <td className="px-4 py-2.5 font-medium text-gray-800 truncate max-w-45">
                                {p.name}
                              </td>
                              <td className="px-4 py-2.5 text-right text-gray-500">
                                ₹{p.before.toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-gray-900">
                                ₹{p.after.toLocaleString("en-IN")}
                              </td>
                              <td
                                className={`px-4 py-2.5 text-right text-xs font-black ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}
                              >
                                {diff >= 0 ? "+" : ""}₹
                                {diff.toLocaleString("en-IN")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
              <button
                onClick={() => {
                  setPriceModalOpen(false);
                  setPricePreview([]);
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={pricePreview.length === 0 || applyingPrice}
                onClick={applyPriceAdjust}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-100"
              >
                {applyingPrice ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                    Applying...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Apply to{" "}
                    {pricePreview.length} Products
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          PRODUCT FORM MODAL
      ══════════════════════════════════════════════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Fill in product details for your Infofix store.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex border-b border-gray-100 px-8 shrink-0">
              {(["basic", "details", "media"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFormTab(tab)}
                  className={`py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors
                    ${formTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab === "basic"
                    ? "Basic Info"
                    : tab === "details"
                      ? "Specs & Tags"
                      : "Image"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-5">
                {formTab === "basic" && (
                  <div className="space-y-5">
                    <Field label="Product Name *">
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="e.g. Dell Latitude 5490 Laptop"
                        className="input"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Brand">
                        <input
                          type="text"
                          value={form.brand}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, brand: e.target.value }))
                          }
                          placeholder="Dell, HP, Lenovo..."
                          className="input"
                        />
                      </Field>
                      <Field label="Model">
                        <input
                          type="text"
                          value={form.model}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, model: e.target.value }))
                          }
                          placeholder="Latitude 5490"
                          className="input"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Category *">
                        <select
                          required
                          value={form.category_id}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              category_id: e.target.value,
                              subcategory_id: "",
                            }))
                          }
                          className="input"
                        >
                          <option value="">Select category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Subcategory">
                        <select
                          value={form.subcategory_id}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              subcategory_id: e.target.value,
                            }))
                          }
                          disabled={!form.category_id}
                          className="input disabled:opacity-40"
                        >
                          <option value="">None</option>
                          {filteredSubcats.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Condition *">
                        <div className="flex gap-2">
                          {CONDITIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({ ...f, condition: c }))
                              }
                              className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all
                                ${form.condition === c ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300"}`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Listing Status">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, is_active: !f.is_active }))
                          }
                          className={`w-full py-2.5 rounded-xl text-xs font-black border flex items-center justify-center gap-2 transition-all
                            ${form.is_active ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                        >
                          {form.is_active ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                          {form.is_active ? "Live on Store" : "Hidden"}
                        </button>
                      </Field>
                    </div>
                    <Field label="Pricing (₹)">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            lbl: "MRP / Retail *",
                            key: "retail_price" as const,
                            ph: "50000",
                            req: true,
                          },
                          {
                            lbl: "Discount %",
                            key: "discount_percent" as const,
                            ph: "10",
                          },
                          {
                            lbl: "Selling Price",
                            key: "discounted_price" as const,
                            ph: "45000",
                          },
                        ].map(({ lbl, key, ph, req }) => (
                          <div key={key}>
                            <p className="text-[10px] text-gray-400 mb-1">
                              {lbl}
                            </p>
                            <input
                              type="number"
                              step="0.01"
                              required={req}
                              value={(form as any)[key]}
                              onChange={(e) =>
                                handlePriceChange(key, e.target.value)
                              }
                              placeholder={ph}
                              className="input font-bold"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Enter any two — the third auto-calculates.
                      </p>
                    </Field>
                    <Field label="Stock Quantity *">
                      <input
                        type="number"
                        required
                        min="0"
                        value={form.stock_quantity}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            stock_quantity: e.target.value,
                          }))
                        }
                        placeholder="0"
                        className="input font-bold"
                      />
                    </Field>
                    <Field label="Minimum Order Quantity">
                      <input
                        type="number"
                        min="1"
                        value={form.min_order_quantity}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, min_order_quantity: e.target.value }))
                        }
                        placeholder="1"
                        className="input font-bold"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Customer must order at least this many units.
                      </p>
                    </Field>
                    <Field label="Description">
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Condition details, what's included, warranty info..."
                        className="input resize-none"
                      />
                    </Field>
                  </div>
                )}

                {formTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Technical Specifications
                        </label>
                        <button
                          type="button"
                          onClick={addSpec}
                          className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800"
                        >
                          <Plus className="w-3 h-3" /> Add Row
                        </button>
                      </div>
                      <div className="space-y-2">
                        {form.specs.map((spec, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={spec.key}
                              onChange={(e) =>
                                updateSpec(i, "key", e.target.value)
                              }
                              placeholder="e.g. Processor"
                              className="flex-1 input"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) =>
                                updateSpec(i, "value", e.target.value)
                              }
                              placeholder="e.g. Intel Core i7-8650U"
                              className="flex-1 input"
                            />
                            <button
                              type="button"
                              onClick={() => removeSpec(i)}
                              disabled={form.specs.length === 1}
                              className="p-2.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">
                        These appear as spec chips on product cards.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">
                        Tags
                      </label>
                      {tags.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          No tags found. Add rows to your Supabase{" "}
                          <code className="bg-gray-100 px-1 rounded">tags</code>{" "}
                          table.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  tag_ids: f.tag_ids.includes(t.id)
                                    ? f.tag_ids.filter((id) => id !== t.id)
                                    : [...f.tag_ids, t.id],
                                }))
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                                  ${form.tag_ids.includes(t.id) ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-100 text-gray-500 border-gray-200 hover:border-indigo-300"}`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formTab === "media" && (
                  <div className="space-y-5">
                    {/* Multi-image preview grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {(form.image_urls ?? []).map((url, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (form.image_urls ?? []).filter(
                                (_, i) => i !== idx,
                              );
                              setForm((f) => ({
                                ...f,
                                image_urls: updated,
                                image_url: updated[0] ?? "",
                              }));
                              setImagePreviews(updated);
                              setImagePreview(updated[0] ?? "");
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black">
                              MAIN
                            </span>
                          )}
                        </div>
                      ))}
                      {(form.image_urls?.length ?? 0) < 5 && (
                        <div
                          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Plus className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {form.image_urls?.length ?? 0}/5 images · First image is
                      the main display image
                    </p>
                    {uploading && (
                      <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                        Uploading...
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageFile(e.target.files[0])
                      }
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleImageFile(e.target.files[0])
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        <Camera className="w-4 h-4" /> Take Photo
                      </button>
                    </div>
                    <div className="relative flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-xs text-gray-400 font-bold">
                        OR PASTE URL
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://... paste URL then press Enter to add"
                      className="input"
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (
                          !val ||
                          !(
                            val.startsWith("http://") ||
                            val.startsWith("https://")
                          )
                        )
                          return;
                        if ((form.image_urls?.length ?? 0) >= 5) {
                          toast("Max 5 images allowed", "error");
                          return;
                        }
                        setForm((f) => ({
                          ...f,
                          image_url: f.image_url || val,
                          image_urls: [...(f.image_urls ?? []), val],
                        }));
                        setImagePreviews((prev) => [...prev, val]);
                        e.target.value = "";
                        toast("Image URL added!");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (
                            e.target as HTMLInputElement
                          ).value.trim();
                          if (
                            !val ||
                            !(
                              val.startsWith("http://") ||
                              val.startsWith("https://")
                            )
                          )
                            return;
                          if ((form.image_urls?.length ?? 0) >= 5) {
                            toast("Max 5 images allowed", "error");
                            return;
                          }
                          setForm((f) => ({
                            ...f,
                            image_url: f.image_url || val,
                            image_urls: [...(f.image_urls ?? []), val],
                          }));
                          setImagePreviews((prev) => [...prev, val]);
                          (e.target as HTMLInputElement).value = "";
                          toast("Image URL added!");
                        }
                      }}
                    />
                    {(form.image_urls ?? []).filter((url) =>
                      url.startsWith("http"),
                    ).length > 0 && (
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 -mt-2">
                          <Check className="w-3 h-3" />
                          {
                            (form.image_urls ?? []).filter((url) =>
                              url.startsWith("http"),
                            ).length
                          }{" "}
                          URL(s) added — press Enter or click away to confirm
                        </p>
                      )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                        Quick Placeholder
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PLACEHOLDER_IMAGES).map(([kw, url]) => (
                          <button
                            key={kw}
                            type="button"
                            onClick={() => {
                              if ((form.image_urls?.length ?? 0) >= 5) {
                                toast("Max 5 images allowed", "error");
                                return;
                              }
                              setForm((f) => ({
                                ...f,
                                image_url: f.image_url || url,
                                image_urls: [...(f.image_urls ?? []), url],
                              }));
                              setImagePreviews((prev) => [...prev, url]);
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors capitalize"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2">
                        💡 Use the camera button to photograph your actual
                        stock. Create a Supabase Storage bucket named{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          product-images
                        </code>{" "}
                        (public) for permanent image hosting.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
                <div className="flex gap-2 mr-auto">
                  {formTab !== "basic" && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormTab(formTab === "media" ? "details" : "basic")
                      }
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      ← Back
                    </button>
                  )}
                  {formTab !== "media" && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormTab(formTab === "basic" ? "details" : "media")
                      }
                      className="px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      Next →
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input { width:100%; background:#f9fafb; border-radius:0.75rem; padding:0.75rem 1rem; font-size:0.875rem; outline:none; transition:box-shadow 0.15s; }
        .input:focus { box-shadow: 0 0 0 2px #6366f1; }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
};
