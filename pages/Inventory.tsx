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
  Palette,
  ChevronDown,
  ChevronUp,
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

interface ProductColor {
  name: string;
  hex: string;
  stock: number;
  images: string[];
}

const DEFAULT_COLOR_PRESETS = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F9FAFB" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Space Grey", hex: "#6B7280" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Rose Gold", hex: "#E8B4B8" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Red", hex: "#EF4444" },
  { name: "Green", hex: "#22C55E" },
  { name: "Navy", hex: "#1E3A5F" },
];

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
  store_section: 'Infofix' as 'Infofix' | 'Refurbished' | 'Wholesale',
};

const PLACEHOLDER_IMAGES: Record<string, string> = {
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  desktop: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
  keyboard: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
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
  qty === 0 ? "bg-red-500" : qty < 10 ? "bg-orange-500" : qty < 30 ? "bg-yellow-500" : "bg-emerald-500";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: number; message: string; type: ToastType; }

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
    {children}
  </div>
);

// ─── Color Images Sub-Panel ───────────────────────────────────────────────────
const ColorImagePanel: React.FC<{
  color: ProductColor;
  colorIdx: number;
  onImagesChange: (idx: number, images: string[]) => void;
  toast: (msg: string, type?: ToastType) => void;
}> = ({ color, colorIdx, onImagesChange, toast }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast("Select image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Max 5MB", "error"); return; }
    if (color?.images?.length >= 5) { toast("Max 5 images per color", "error"); return; }
    setUploading(true);
    try {
      if (supabase) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `products/colors/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        onImagesChange(colorIdx, [...color.images, publicUrl]);
        toast(`Image added to ${color.name}!`);
      } else {
        const url = URL.createObjectURL(file);
        onImagesChange(colorIdx, [...color.images, url]);
        toast("Preview only — no storage configured", "info");
      }
    } catch {
      const url = URL.createObjectURL(file);
      onImagesChange(colorIdx, [...color.images, url]);
      toast("Storage bucket missing — image previewed locally", "info");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = (url: string) => {
    if (!url.startsWith("http")) return;
    if (color?.images?.length >= 5) { toast("Max 5 images per color", "error"); return; }
    onImagesChange(colorIdx, [...color.images, url]);
  };

  const removeImg = (imgIdx: number) => {
    onImagesChange(colorIdx, color.images.filter((_, i) => i !== imgIdx));
  };

  return (
    <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Images for {color?.name} ({color?.images?.length}/5)
      </p>

      {/* Image grid */}
      <div className="flex flex-wrap gap-2">
        {color?.images?.map((url, imgIdx) => (
          <div key={imgIdx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImg(imgIdx)}
              className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
            {imgIdx === 0 && (
              <span className="absolute bottom-0.5 left-0.5 text-[7px] bg-indigo-600 text-white px-1 py-0.5 rounded font-black">MAIN</span>
            )}
          </div>
        ))}
        {color?.images?.length < 5 && (
          <div
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" /> : <Plus className="w-4 h-4 text-gray-400" />}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* URL paste */}
      <input
        type="url"
        placeholder="Paste image URL and press Enter"
        className="input text-xs py-2"
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            const val = (e.target as HTMLInputElement).value.trim();
            addUrl(val);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  );
};

// ─── Colors Tab ───────────────────────────────────────────────────────────────
const ColorsTab: React.FC<{
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
  toast: (msg: string, type?: ToastType) => void;
}> = ({ colors, onChange, toast }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [newColor, setNewColor] = useState<{ name: string; hex: string; stock: string }>({ name: "", hex: "#111827", stock: "" });

  const addColor = () => {
    if (!newColor.name.trim()) { toast("Enter color name", "error"); return; }
    if (colors.some(c => c.name.toLowerCase() === newColor.name.trim().toLowerCase())) {
      toast("Color already added", "error"); return;
    }
    const color: ProductColor = {
      name: newColor.name.trim(),
      hex: newColor.hex,
      stock: parseInt(newColor.stock) || 0,
      images: [],
    };
    onChange([...colors, color]);
    setNewColor({ name: "", hex: "#111827", stock: "" });
    setExpandedIdx(colors.length); // auto-expand new color
    toast(`${color.name} added!`);
  };

  const removeColor = (idx: number) => {
    onChange(colors.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateColorField = (idx: number, field: keyof ProductColor, val: any) => {
    onChange(colors.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const updateColorImages = (idx: number, images: string[]) => {
    onChange(colors.map((c, i) => i === idx ? { ...c, images } : c));
  };

  return (
    <div className="space-y-5">
      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 text-[11px] text-indigo-700 font-semibold leading-relaxed">
        <p className="font-black mb-1">How color variants work:</p>
        <ul className="list-disc list-inside space-y-0.5 text-indigo-600">
          <li>Add each available color with its own stock count</li>
          <li>Upload images specific to each color (the gallery switches when customer picks a color)</li>
          <li>Leave <span className="font-black">Colors</span> empty for products with no color variants (desktops, accessories, etc.)</li>
          <li>Out-of-stock colors show a strikethrough in the color picker</li>
        </ul>
      </div>

      {/* Existing colors */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{colors.length} Color{colors.length !== 1 ? "s" : ""} Added</p>
          {colors.map((color, idx) => (
            <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Color row header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50">
                {/* Swatch */}
                <div className="w-7 h-7 rounded-full border-2 border-white shadow-md shrink-0" style={{ background: color.hex }} />

                {/* Editable name */}
                <input
                  type="text"
                  value={color.name}
                  onChange={e => updateColorField(idx, "name", e.target.value)}
                  className="font-bold text-sm text-gray-900 bg-transparent border-none outline-none flex-1 min-w-0"
                  placeholder="Color name"
                />

                {/* Hex picker */}
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={e => updateColorField(idx, "hex", e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
                    title="Pick color"
                  />
                </div>

                {/* Stock */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Qty</span>
                  <input
                    type="number"
                    min="0"
                    value={color.stock}
                    onChange={e => updateColorField(idx, "stock", parseInt(e.target.value) || 0)}
                    className="w-16 text-center font-black text-sm bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* OOS badge */}
                {color.stock === 0 && (
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">OOS</span>
                )}

                {/* Image count */}
                <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                  {color?.images?.length} img{color?.images?.length !== 1 ? "s" : ""}
                </span>

                {/* Expand/collapse images */}
                <button
                  type="button"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
                  title="Manage images"
                >
                  {expandedIdx === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Delete color */}
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Expandable image panel */}
              {expandedIdx === idx && (
                <div className="px-4 pb-4">
                  <ColorImagePanel
                    color={color}
                    colorIdx={idx}
                    onImagesChange={updateColorImages}
                    toast={toast}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new color */}
      <div className="border border-dashed border-gray-300 rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Color Variant</p>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {DEFAULT_COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setNewColor(n => ({ ...n, name: preset.name, hex: preset.hex }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${newColor.name === preset.name ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"}`}
            >
              <div className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-sm" style={{ background: preset.hex }} />
              {preset.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <p className="text-[10px] text-gray-400 mb-1">Name</p>
            <input
              type="text"
              value={newColor.name}
              onChange={e => setNewColor(n => ({ ...n, name: e.target.value }))}
              placeholder="e.g. Midnight Black"
              className="input"
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Color</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor.hex}
                onChange={e => setNewColor(n => ({ ...n, hex: e.target.value }))}
                className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={newColor.hex}
                onChange={e => setNewColor(n => ({ ...n, hex: e.target.value }))}
                placeholder="#111827"
                className="input font-mono text-xs"
              />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Stock Qty</p>
            <input
              type="number"
              min="0"
              value={newColor.stock}
              onChange={e => setNewColor(n => ({ ...n, stock: e.target.value }))}
              placeholder="0"
              className="input font-bold"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addColor}
          disabled={!newColor.name.trim()}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add This Color
        </button>
      </div>

      {colors.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          No colors added — product will show without color picker.<br />
          <span className="text-[11px]">Leave empty for desktops, single-color products, or accessories.</span>
        </p>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export const Inventory: React.FC = () => {
  const { removeFromCart, cart } = useStore();

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DBSubcategory[]>([]);
  const [tags, setTags] = useState<DBTag[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive">("");
  const [filterStock, setFilterStock] = useState<"" | "out" | "low" | "ok">("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DBProductFormState>(EMPTY_FORM);
  const [formColors, setFormColors] = useState<ProductColor[]>([]);
  const [saving, setSaving] = useState(false);
  const [formTab, setFormTab] = useState<"basic" | "details" | "media" | "colors">("basic");

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceCatId, setPriceCatId] = useState("");
  const [priceSubcatId, setPriceSubcatId] = useState("");
  const [priceField, setPriceField] = useState<"retail_price" | "discounted_price" | "both">("both");
  const [priceType, setPriceType] = useState<"percent" | "fixed">("percent");
  const [priceValue, setPriceValue] = useState("");
  const [priceDir, setPriceDir] = useState<"increase" | "decrease">("increase");
  const [pricePreview, setPricePreview] = useState<{ id: number; name: string; before: number; after: number }[]>([]);
  const [pricePreviewLoading, setPricePreviewLoading] = useState(false);
  const [applyingPrice, setApplyingPrice] = useState(false);

  const [generating, setGenerating] = useState<number | null>(null);
  const [adviceMap, setAdviceMap] = useState<Record<number, string>>({});

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastIdRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const filteredSubcats = subcategories.filter(
    (s) => !form.category_id || String(s.category_id) === String(form.category_id),
  );
  const priceFilteredSubcats = subcategories.filter(
    (s) => !priceCatId || String(s.category_id) === String(priceCatId),
  );
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const fetchMeta = useCallback(async () => {
    if (!supabase) return;
    const [{ data: cats }, { data: subcats }, { data: tgs }] = await Promise.all([
      supabase.from("categories").select("id,name,slug").order("name"),
      supabase.from("subcategories").select("id,category_id,name,slug").order("name"),
      supabase.from("tags").select("id,name").order("name"),
    ]);
    if (cats) setCategories(cats as DBCategory[]);
    if (subcats) setSubcategories(subcats as DBSubcategory[]);
    if (tgs) setTags(tgs as DBTag[]);
  }, []);

  const fetchProducts = useCallback(async (pg = 1) => {
    if (!supabase) return;
    setLoading(true);
    try {
      let q = supabase.from("products").select(
        `id, name, description, image_url, images, brand, model, specs,
         store_section, retail_price, discounted_price, discount_percent,
         stock_quantity, condition, is_active, min_order_quantity,
         category_id, subcategory_id, created_at, colors,
         categories(name,slug), subcategories(name,slug),
         product_tags(tags(id,name))`,
        { count: "exact" },
      );
      if (searchTerm.trim()) q = q.or(`name.ilike.%${searchTerm.trim()}%,brand.ilike.%${searchTerm.trim()}%,model.ilike.%${searchTerm.trim()}%`);
      if (filterCategory) q = q.eq("category_id", filterCategory);
      if (filterCondition) q = q.eq("condition", filterCondition);
      if (filterStatus === "active") q = q.eq("is_active", true);
      if (filterStatus === "inactive") q = q.eq("is_active", false);
      if (filterStock === "out") q = q.eq("stock_quantity", 0);
      if (filterStock === "low") q = q.gt("stock_quantity", 0).lt("stock_quantity", 10);
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
  }, [searchTerm, filterCategory, filterCondition, filterStatus, filterStock, sortCol, sortDir, toast]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [searchTerm, filterCategory, filterCondition, filterStatus, filterStock, sortCol, sortDir]);
  useEffect(() => { fetchProducts(page); }, [page, fetchProducts]);

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };
  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-600" /> : <ArrowDown className="w-3 h-3 text-indigo-600" />;
  };

  const handleImageFile = async (file: File) => {
    if (!supabase) return;
    if (!file.type.startsWith("image/")) { toast("Please select an image file", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Image must be under 5MB", "error"); return; }
    if ((form.image_urls?.length ?? 0) >= 5) { toast("Max 5 images allowed", "error"); return; }
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
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: f.image_url || publicUrl, image_urls: [...(f.image_urls ?? []), publicUrl] }));
      toast("Image uploaded!");
    } catch {
      const localUrl = URL.createObjectURL(file);
      setForm((f) => ({ ...f, image_url: f.image_url || localUrl, image_urls: [...(f.image_urls ?? []), localUrl] }));
      toast("Storage bucket not found — image previewed locally.", "info");
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormColors([]);
    setImagePreview("");
    setImagePreviews([]);
    setFormTab("basic");
    setModalOpen(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditingId(p.id);
    const specs = p.specs
      ? Object.entries(p.specs).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: "", value: "" }];
    const existingImages: string[] =
      Array.isArray((p as any).images) && (p as any).images.length > 0
        ? (p as any).images
        : p.image_url ? [p.image_url] : [];
    const sectionMap: Record<string, 'Infofix' | 'Refurbished' | 'Wholesale'> = {
      infofix: 'Infofix', refurbished: 'Refurbished', wholesale: 'Wholesale',
      Infofix: 'Infofix', Refurbished: 'Refurbished', Wholesale: 'Wholesale',
    };
    const store_section = sectionMap[(p as any).store_section ?? ''] ?? 'Infofix';

    // Parse existing colors
    let existingColors: ProductColor[] = [];
    const rawColors = (p as any).colors;
    if (rawColors) {
      try {
        existingColors = typeof rawColors === "string" ? JSON.parse(rawColors) : rawColors;
      } catch { existingColors = []; }
    }

    setFormColors(existingColors);
    setForm({
      name: p.name ?? "",
      description: p.description ?? "",
      brand: p.brand ?? "",
      model: p.model ?? "",
      store_section,
      retail_price: String(p.retail_price ?? ""),
      discounted_price: String(p.discounted_price ?? ""),
      discount_percent: String(p.discount_percent ?? ""),
      stock_quantity: String(p.stock_quantity ?? ""),
      condition: p.condition ?? "New",
      category_id: String(p.category_id ?? ""),
      subcategory_id: p.subcategory_id ? String(p.subcategory_id) : "",
      image_url: existingImages[0] ?? p.image_url ?? "",
      image_urls: existingImages,
      is_active: p.is_active ?? true,
      specs: specs.length ? specs : [{ key: "", value: "" }],
      min_order_quantity: String(p.min_order_quantity ?? "1"),
      tag_ids: (p.product_tags ?? []).map((pt: any) => pt.tags?.id).filter(Boolean),
    });
    setImagePreview(existingImages[0] ?? p.image_url ?? "");
    setImagePreviews(existingImages);
    setFormTab("basic");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!form.name.trim()) { toast("Product name is required", "error"); return; }
    if (!form.retail_price) { toast("Retail price is required", "error"); return; }
    if (!form.stock_quantity) { toast("Stock quantity is required", "error"); return; }
    if (!form.category_id) { toast("Category is required", "error"); return; }
    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      form.specs.forEach(({ key, value }) => { if (key.trim()) specsObj[key.trim()] = value; });
      const retailPrice = parseFloat(form.retail_price) || 0;
      const discPercent = parseFloat(form.discount_percent) || 0;
      const discPrice = form.discounted_price !== "" ? Math.ceil(parseFloat(form.discounted_price)) : retailPrice;
      const allImages = form.image_urls?.length ? form.image_urls : form.image_url ? [form.image_url] : [];
      const primaryImage = allImages[0] ?? form.image_url ?? null;

      // Colors: null if empty (no color feature), else JSONB array
      const colorsPayload = formColors.length > 0 ? formColors : null;

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        store_section: ((form as any).store_section ?? 'infofix').toLowerCase(),
        sku: `SKU-${Date.now().toString(36).toUpperCase()}`,
        retail_price: retailPrice,
        discount_percent: discPercent,
        discounted_price: discPrice,
        min_order_quantity: parseInt(form.min_order_quantity ?? "1") || 1,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        condition: form.condition,
        category_id: parseInt(form.category_id),
        subcategory_id: form.subcategory_id ? parseInt(form.subcategory_id) : null,
        image_url: primaryImage,
        images: allImages,
        is_active: form.is_active,
        specs: specsObj,
        colors: colorsPayload,
      };
      let productId = editingId;
      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
        toast("Product updated!");
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = (data as any).id;
        toast("Product added!");
      }
      if (productId) {
        await supabase.from("product_tags").delete().eq("product_id", productId);
        if (form.tag_ids.length) {
          await supabase.from("product_tags").insert(form.tag_ids.map((tid) => ({ product_id: productId, tag_id: tid })));
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

  const handleDelete = async (id: number) => {
    if (!supabase || !confirm("Delete this product? This cannot be undone.")) return;
    try {
      await supabase.from("product_tags").delete().eq("product_id", id);
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      if (cart.some((item) => String(item.id) === String(id))) removeFromCart(String(id));
      toast("Product deleted.");
      fetchProducts(page);
    } catch (err: any) {
      toast(`Delete failed: ${err.message}`, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!supabase || selected.size === 0 || !confirm(`Delete ${selected.size} product(s)?`)) return;
    const ids = [...selected];
    try {
      await supabase.from("product_tags").delete().in("product_id", ids);
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
      ids.forEach((id) => { if (cart.some((item) => String(item.id) === String(id))) removeFromCart(String(id)); });
      setSelected(new Set());
      toast(`${ids.length} products deleted.`);
      fetchProducts(page);
    } catch (err: any) {
      toast(`Bulk delete failed: ${err.message}`, "error");
    }
  };

  const toggleActive = async (p: DBProduct) => {
    if (!supabase) return;
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) { toast("Update failed", "error"); return; }
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x)));
    toast(p.is_active ? "Product hidden from store." : "Product is now live!");
  };

  const handleAIDesc = async (p: DBProduct) => {
    setGenerating(p.id);
    try {
      const desc = await generateProductDescription(p.name, p.categories?.name ?? "", ["Infofix certified", "Quality tested"]);
      if (desc && supabase) {
        await supabase.from("products").update({ description: desc }).eq("id", p.id);
        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, description: desc } : x)));
        toast("AI description written!");
      }
    } finally { setGenerating(null); }
  };

  const handleGetAdvice = async (p: DBProduct) => {
    const advice = await getInventoryAdvice(p.stock_quantity, "Stable demand");
    if (advice) setAdviceMap((prev) => ({ ...prev, [p.id]: advice }));
  };

  const exportCSV = () => {
    if (products.length === 0) { toast("No products to export", "info"); return; }
    const headers = ["ID", "Name", "Brand", "Model", "Category", "Subcategory", "Condition", "Retail Price", "Discounted Price", "Discount %", "Stock", "Colors", "Active", "Created At"];
    const rows = products.map((p) => [
      p.id, `"${p.name}"`, `"${p.brand ?? ""}"`, `"${p.model ?? ""}"`,
      `"${p.categories?.name ?? ""}"`, `"${p.subcategories?.name ?? ""}"`, p.condition,
      p.retail_price, p.discounted_price, p.discount_percent, p.stock_quantity,
      `"${(p as any).colors ? JSON.stringify((p as any).colors) : ""}"`,
      p.is_active ? "Yes" : "No", new Date(p.created_at).toLocaleDateString("en-IN"),
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

  const previewPriceAdjust = useCallback(async () => {
    if (!supabase || !priceValue || !priceCatId) return;
    setPricePreviewLoading(true);
    try {
      let q = supabase.from("products").select("id, name, retail_price, discounted_price").eq("category_id", priceCatId);
      if (priceSubcatId) q = q.eq("subcategory_id", priceSubcatId);
      const { data, error } = await q;
      if (error) throw error;
      const adjVal = parseFloat(priceValue);
      const preview = (data ?? []).map((p: any) => {
        const src = priceField === "discounted_price" ? (p.discounted_price ?? p.retail_price) : p.retail_price;
        let after: number;
        if (priceType === "percent") {
          const factor = priceDir === "increase" ? 1 + adjVal / 100 : 1 - adjVal / 100;
          after = Math.ceil(src * factor);
        } else {
          after = priceDir === "increase" ? src + adjVal : src - adjVal;
        }
        return { id: p.id, name: p.name, before: src, after: Math.max(0, after) };
      });
      setPricePreview(preview);
    } catch (err: any) {
      toast(`Preview failed: ${err.message}`, "error");
    } finally {
      setPricePreviewLoading(false);
    }
  }, [supabase, priceCatId, priceSubcatId, priceField, priceType, priceValue, priceDir, toast]);

  const applyPriceAdjust = async () => {
    if (!supabase || pricePreview.length === 0) return;
    if (!confirm(`Update prices for ${pricePreview.length} product(s)?`)) return;
    setApplyingPrice(true);
    try {
      const updates = pricePreview.map((p) => {
        const update: Record<string, number> = {};
        if (priceField === "retail_price") {
          update.retail_price = p.after;
        } else if (priceField === "discounted_price") {
          const original = products.find((prod) => prod.id === p.id);
          const retail = original?.retail_price ?? p.before;
          update.discount_percent = retail > 0 && p.after < retail ? Math.round((1 - p.after / retail) * 100) : 0;
        } else {
          update.retail_price = p.after;
          update.discount_percent = 0;
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
    setPriceCatId(""); setPriceSubcatId(""); setPriceField("both");
    setPriceType("percent"); setPriceValue(""); setPriceDir("increase"); setPricePreview([]);
  };

  const toggleSelect = (id: number) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelected(selected.size === products.length ? new Set() : new Set(products.map((p) => p.id)));

  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (i: number) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  const updateSpec = (i: number, field: "key" | "value", val: string) => setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)) }));

  const handlePriceChange = (field: "retail_price" | "discounted_price" | "discount_percent", val: string) => {
    const updated = { ...form, [field]: val };
    const retail = parseFloat(updated.retail_price) || 0;
    const disc = parseFloat(updated.discounted_price) || 0;
    const pct = parseFloat(updated.discount_percent) || 0;
    if (field === "discount_percent" && retail > 0 && pct > 0) {
      updated.discounted_price = String(Math.ceil(retail * (1 - pct / 100)));
    } else if (field === "retail_price" && retail > 0 && disc > 0 && disc < retail) {
      updated.discount_percent = Math.round((1 - disc / retail) * 100).toString();
    } else if (field === "discounted_price") {
      const ceiled = val === "" ? "" : String(Math.ceil(parseFloat(val) || 0));
      updated.discounted_price = ceiled;
      const ceiledNum = parseFloat(ceiled) || 0;
      if (retail > 0 && ceiledNum > 0 && ceiledNum < retail) {
        updated.discount_percent = Math.round((1 - ceiledNum / retail) * 100).toString();
      }
    }
    setForm(updated);
  };

  // Count colors indicator for table
  const getColorDots = (p: DBProduct) => {
    const raw = (p as any).colors;
    if (!raw) return null;
    let colors: ProductColor[] = [];
    try { colors = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return null; }
    if (!colors.length) return null;
    return colors;
  };

  return (
    <div className="space-y-5">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-200 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: "fadeInRight 0.3s ease" }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold
              ${t.type === "success" ? "bg-emerald-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-indigo-600 text-white"}`}>
            {t.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : t.type === "error" ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Zap className="w-4 h-4 shrink-0" />}
            <span className="max-w-xs leading-tight">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventory</h2>
          <p className="text-gray-400 text-sm font-medium mt-0.5">{totalCount} products · Page {page}/{totalPages || 1}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete {selected.size}
            </button>
          )}
          <button onClick={() => { resetPriceModal(); setPriceModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-100 transition-colors">
            <Percent className="w-4 h-4" /> Bulk Price Update
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name, brand, model..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition" />
          </div>
          <button onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${showFilters ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {(filterCategory || filterCondition || filterStatus || filterStock) && <span className="w-2 h-2 rounded-full bg-orange-500" />}
          </button>
        </div>
        {showFilters && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Category", value: filterCategory, set: setFilterCategory, options: [["", "All Categories"], ...categories.map((c) => [String(c.id), c.name])] as [string, string][] },
              { label: "Condition", value: filterCondition, set: setFilterCondition, options: [["", "All Conditions"], ...CONDITIONS.map((c) => [c, c])] as [string, string][] },
              { label: "Status", value: filterStatus, set: (v: any) => setFilterStatus(v), options: [["", "All Statuses"], ["active", "Active"], ["inactive", "Hidden"]] as [string, string][] },
              { label: "Stock", value: filterStock, set: (v: any) => setFilterStock(v), options: [["", "All Stock"], ["out", "Out of Stock"], ["low", "Low (<10)"], ["ok", "In Stock"]] as [string, string][] },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
                <select value={value} onChange={(e) => set(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500">
                  {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                </select>
              </div>
            ))}
            {(filterCategory || filterCondition || filterStatus || filterStock) && (
              <button onClick={() => { setFilterCategory(""); setFilterCondition(""); setFilterStatus(""); setFilterStock(""); }}
                className="col-span-2 md:col-span-4 text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-700">
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
                  <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                    {selected.size === products.length && products.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                {[{ label: "Product", col: "name" }, { label: "Stock", col: "stock_quantity" }, { label: "Price", col: "retail_price" }].map(({ label, col }) => (
                  <th key={col} className="px-4 py-3.5">
                    <button onClick={() => toggleSort(col)} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-800">
                      {label} <SortIcon col={col} />
                    </button>
                  </th>
                ))}
                {["Category", "Colors", "Condition", "Status", "AI", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <InventoryRowSkeleton key={i} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="font-bold text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400 mt-1">Adjust filters or add a new product.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const colorDots = getColorDots(p);
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50/70 transition-colors ${selected.has(p.id) ? "bg-indigo-50/40" : ""}`}>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleSelect(p.id)} className="text-gray-400 hover:text-gray-600">
                          {selected.has(p.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=60"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-45">{p.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{p.brand ? `${p.brand} · ` : ""}SKU-{String(p.id).padStart(5, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${stockColor(p.stock_quantity)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stockDot(p.stock_quantity)}`} />
                            {p.stock_quantity} units
                          </span>
                          {adviceMap[p.id] ? (
                            <p className="text-[10px] text-indigo-600 italic max-w-35 leading-tight">{adviceMap[p.id]}</p>
                          ) : (
                            <button onClick={() => handleGetAdvice(p)} className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                              <RefreshCw className="w-2.5 h-2.5" /> AI Insight
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-black text-gray-900">₹{(p.discounted_price ?? p.retail_price).toLocaleString("en-IN")}</p>
                        {p.discount_percent > 0 && (
                          <>
                            <p className="text-[10px] text-gray-400 line-through">₹{p.retail_price.toLocaleString("en-IN")}</p>
                            <span className="text-[10px] text-red-600 font-bold">{p.discount_percent}% OFF</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider">{p.categories?.name ?? "—"}</span>
                        {p.subcategories?.name && <p className="text-[10px] text-gray-400 mt-0.5">{p.subcategories.name}</p>}
                      </td>
                      {/* Colors column */}
                      <td className="px-4 py-3.5">
                        {colorDots ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {colorDots.slice(0, 5).map((c, i) => (
                              <div key={i} title={`${c.name}${c.stock === 0 ? " (OOS)" : ` · ${c.stock} qty`}`}
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm relative"
                                style={{ background: c.hex }}>
                                {c.stock === 0 && (
                                  <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.8) 44%, rgba(255,255,255,0.8) 56%, transparent 60%)' }} />
                                )}
                              </div>
                            ))}
                            {colorDots.length > 5 && <span className="text-[9px] text-gray-400 font-bold">+{colorDots.length - 5}</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${p.condition === "New" ? "bg-blue-50 text-blue-600" : p.condition === "Refurbished" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                          {p.condition}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleActive(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${p.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200"}`}>
                          {p.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {p.is_active ? "Live" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleAIDesc(p)} disabled={generating === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50">
                          <Wand2 className={`w-3 h-3 ${generating === p.id ? "animate-spin" : ""}`} />
                          {generating === p.id ? "Writing..." : "AI Desc"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
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
            <p className="text-xs text-gray-400 font-semibold">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)} of {totalCount}</p>
            <div className="flex items-center gap-1.5">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pg === page ? "bg-indigo-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}>{pg}</button>
                );
              })}
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ── BULK PRICE MODAL (unchanged) ── */}
      {priceModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Bulk Price Update</h3>
                <p className="text-xs text-gray-400 mt-0.5">Increase or decrease prices for all products in a category or subcategory.</p>
              </div>
              <button onClick={() => { setPriceModalOpen(false); setPricePreview([]); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Step 1 — Select Scope</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category *">
                    <select value={priceCatId} onChange={(e) => { setPriceCatId(e.target.value); setPriceSubcatId(""); setPricePreview([]); }} className="input">
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Subcategory (optional)">
                    <select value={priceSubcatId} onChange={(e) => { setPriceSubcatId(e.target.value); setPricePreview([]); }} disabled={!priceCatId || priceFilteredSubcats.length === 0} className="input disabled:opacity-40">
                      <option value="">All subcategories</option>
                      {priceFilteredSubcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Step 2 — Adjustment</p>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Apply To">
                    <div className="flex flex-col gap-1.5">
                      {([["both", "Both (MRP & Selling price)"], ["retail_price", "MRP / Retail price only"], ["discounted_price", "Selling price only"]] as const).map(([val, lbl]) => (
                        <label key={val} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold transition-all ${priceField === val ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"}`}>
                          <input type="radio" name="priceField" value={val} checked={priceField === val} onChange={() => { setPriceField(val); setPricePreview([]); }} className="accent-amber-500" />
                          {lbl}
                        </label>
                      ))}
                    </div>
                  </Field>
                  <div className="space-y-4">
                    <Field label="Direction">
                      <div className="flex gap-2">
                        {(["increase", "decrease"] as const).map((dir) => (
                          <button key={dir} type="button" onClick={() => { setPriceDir(dir); setPricePreview([]); }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all capitalize ${priceDir === dir ? dir === "increase" ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-600 text-white border-red-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                            {dir === "increase" ? "▲" : "▼"} {dir}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Adjustment Type">
                      <div className="flex gap-2">
                        {(["percent", "fixed"] as const).map((t) => (
                          <button key={t} type="button" onClick={() => { setPriceType(t); setPricePreview([]); }}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${priceType === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {t === "percent" ? "% Percent" : "₹ Fixed"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label={`Value ${priceType === "percent" ? "(%)" : "(₹)"}`}>
                      <input type="number" min="0" step={priceType === "percent" ? "0.5" : "1"} value={priceValue} onChange={(e) => { setPriceValue(e.target.value); setPricePreview([]); }} placeholder={priceType === "percent" ? "e.g. 5" : "e.g. 500"} className="input font-bold" />
                    </Field>
                  </div>
                </div>
                <button type="button" disabled={!priceCatId || !priceValue || pricePreviewLoading} onClick={previewPriceAdjust}
                  className="mt-4 w-full py-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm font-black hover:bg-amber-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {pricePreviewLoading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading preview...</> : <><Eye className="w-4 h-4" /> Preview Changes</>}
                </button>
              </div>
              {pricePreview.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Preview — {pricePreview.length} product(s) will be updated</p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                        <tr>
                          {["Product", "Before", "After", "Change"].map(h => (
                            <th key={h} className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 ${h !== "Product" ? "text-right" : ""}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pricePreview.map((p) => {
                          const diff = p.after - p.before;
                          return (
                            <tr key={p.id}>
                              <td className="px-4 py-2.5 font-medium text-gray-800 truncate max-w-45">{p.name}</td>
                              <td className="px-4 py-2.5 text-right text-gray-500">₹{p.before.toLocaleString("en-IN")}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-gray-900">₹{p.after.toLocaleString("en-IN")}</td>
                              <td className={`px-4 py-2.5 text-right text-xs font-black ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}>{diff >= 0 ? "+" : ""}₹{diff.toLocaleString("en-IN")}</td>
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
              <button onClick={() => { setPriceModalOpen(false); setPricePreview([]); }} className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button disabled={pricePreview.length === 0 || applyingPrice} onClick={applyPriceAdjust}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-100">
                {applyingPrice ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Applying...</> : <><Check className="w-3.5 h-3.5" /> Apply to {pricePreview.length} Products</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT FORM MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">{editingId ? "Edit Product" : "Add New Product"}</h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Fill in product details for your Infofix store.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-8 shrink-0 overflow-x-auto">
              {(["basic", "details", "media", "colors"] as const).map((tab) => (
                <button key={tab} onClick={() => setFormTab(tab)}
                  className={`py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 -mb-px transition-colors whitespace-nowrap flex items-center gap-1.5
                    ${formTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                  {tab === "colors" && <Palette className="w-3 h-3" />}
                  {tab === "basic" ? "Basic Info" : tab === "details" ? "Specs & Tags" : tab === "media" ? "Images" : "Colors"}
                  {tab === "colors" && formColors.length > 0 && (
                    <span className="ml-1 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{formColors.length}</span>
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-5">

                {/* ── BASIC TAB ── */}
                {formTab === "basic" && (
                  <div className="space-y-5">
                    <Field label="Product Name *">
                      <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Dell Latitude 5490 Laptop" className="input" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Brand"><input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="Dell, HP, Lenovo..." className="input" /></Field>
                      <Field label="Model"><input type="text" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} placeholder="Latitude 5490" className="input" /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Category *">
                        <select required value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: "" }))} className="input">
                          <option value="">Select category</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Subcategory">
                        <select value={form.subcategory_id} onChange={(e) => setForm((f) => ({ ...f, subcategory_id: e.target.value }))} disabled={!form.category_id} className="input disabled:opacity-40">
                          <option value="">None</option>
                          {filteredSubcats.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Condition *">
                        <div className="flex gap-2">
                          {CONDITIONS.map((c) => (
                            <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, condition: c }))}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${form.condition === c ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Listing Status">
                        <button type="button" onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                          className={`w-full py-2.5 rounded-xl text-xs font-black border flex items-center justify-center gap-2 transition-all ${form.is_active ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {form.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {form.is_active ? "Live on Store" : "Hidden"}
                        </button>
                      </Field>
                    </div>
                    <Field label="Pricing (₹)">
                      <div className="grid grid-cols-3 gap-3">
                        {[{ lbl: "MRP / Retail *", key: "retail_price" as const, ph: "50000", req: true }, { lbl: "Discount %", key: "discount_percent" as const, ph: "10" }, { lbl: "Selling Price", key: "discounted_price" as const, ph: "45000" }].map(({ lbl, key, ph, req }) => (
                          <div key={key}>
                            <p className="text-[10px] text-gray-400 mb-1">{lbl}</p>
                            <input type="number" step="0.01" required={req} value={(form as any)[key]} onChange={(e) => handlePriceChange(key, e.target.value)} placeholder={ph} className="input font-bold" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">Enter any two — the third auto-calculates.</p>
                    </Field>
                    <Field label="Stock Quantity *">
                      <input type="number" required min="0" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))} placeholder="0" className="input font-bold" />
                    </Field>
                    <Field label="Minimum Order Quantity">
                      <input type="number" min="1" value={form.min_order_quantity} onChange={(e) => setForm((f) => ({ ...f, min_order_quantity: e.target.value }))} placeholder="1" className="input font-bold" />
                      <p className="text-[10px] text-gray-400 mt-1">Customer must order at least this many units.</p>
                    </Field>
                    <Field label="Description">
                      <textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Condition details, what's included, warranty info..." className="input resize-none" />
                    </Field>
                    <Field label="Store Section *">
                      <div className="flex gap-2">
                        {([{ id: 'Infofix', label: '🖥️ Infofix', color: '#6366f1' }, { id: 'Refurbished', label: '♻️ Refurbished', color: '#059669' }, { id: 'Wholesale', label: '📦 Wholesale', color: '#db2777' }] as const).map((sec) => (
                          <button key={sec.id} type="button" onClick={() => setForm(f => ({ ...f, store_section: sec.id }))}
                            className="flex-1 py-2.5 rounded-xl text-xs font-black border transition-all"
                            style={(form as any).store_section === sec.id ? { background: sec.color, color: 'white', border: `1px solid ${sec.color}`, boxShadow: `0 4px 12px ${sec.color}44` } : { background: '#f9fafb', color: '#64748b', border: '1px solid #e2e8f0' }}>
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── DETAILS TAB ── */}
                {formTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Technical Specifications</label>
                        <button type="button" onClick={addSpec} className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800"><Plus className="w-3 h-3" /> Add Row</button>
                      </div>
                      <div className="space-y-2">
                        {form.specs.map((spec, i) => (
                          <div key={i} className="flex gap-2">
                            <input type="text" value={spec.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="e.g. Processor" className="flex-1 input" />
                            <input type="text" value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="e.g. Intel Core i7-8650U" className="flex-1 input" />
                            <button type="button" onClick={() => removeSpec(i)} disabled={form.specs.length === 1} className="p-2.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"><X className="w-4 h-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Tags</label>
                      {tags.length === 0 ? (
                        <p className="text-sm text-gray-400">No tags found.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <button key={t.id} type="button"
                              onClick={() => setForm((f) => ({ ...f, tag_ids: f.tag_ids.includes(t.id) ? f.tag_ids.filter((id) => id !== t.id) : [...f.tag_ids, t.id] }))}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${form.tag_ids.includes(t.id) ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-100 text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                              {t.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── MEDIA TAB ── */}
                {formTab === "media" && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-[11px] text-blue-700 font-semibold">
                      These are the <span className="font-black">default/fallback images</span> shown when no color is selected or for products without color variants.
                      To upload color-specific images, go to the <span className="font-black">Colors</span> tab.
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {(form.image_urls ?? []).map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const updated = (form.image_urls ?? []).filter((_, i) => i !== idx); setForm((f) => ({ ...f, image_urls: updated, image_url: updated[0] ?? "" })); setImagePreviews(updated); setImagePreview(updated[0] ?? ""); }}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                          {idx === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black">MAIN</span>}
                        </div>
                      ))}
                      {(form.image_urls?.length ?? 0) < 5 && (
                        <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors" onClick={() => fileInputRef.current?.click()}>
                          <Plus className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">{form.image_urls?.length ?? 0}/5 images · First image is the main display image</p>
                    {uploading && <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...</div>}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"><Upload className="w-4 h-4" /> Upload File</button>
                      <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 rounded-2xl text-sm font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"><Camera className="w-4 h-4" /> Take Photo</button>
                    </div>
                    <div className="relative flex items-center gap-3"><div className="h-px flex-1 bg-gray-200" /><span className="text-xs text-gray-400 font-bold">OR PASTE URL</span><div className="h-px flex-1 bg-gray-200" /></div>
                    <input type="url" placeholder="https://... paste URL then press Enter to add" className="input"
                      onBlur={(e) => { const val = e.target.value.trim(); if (!val || !val.startsWith("http")) return; if ((form.image_urls?.length ?? 0) >= 5) { toast("Max 5 images allowed", "error"); return; } setForm((f) => ({ ...f, image_url: f.image_url || val, image_urls: [...(f.image_urls ?? []), val] })); setImagePreviews((prev) => [...prev, val]); e.target.value = ""; toast("Image URL added!"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (!val || !val.startsWith("http")) return; if ((form.image_urls?.length ?? 0) >= 5) { toast("Max 5 images allowed", "error"); return; } setForm((f) => ({ ...f, image_url: f.image_url || val, image_urls: [...(f.image_urls ?? []), val] })); setImagePreviews((prev) => [...prev, val]); (e.target as HTMLInputElement).value = ""; toast("Image URL added!"); } }} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Quick Placeholder</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PLACEHOLDER_IMAGES).map(([kw, url]) => (
                          <button key={kw} type="button" onClick={() => { if ((form.image_urls?.length ?? 0) >= 5) { toast("Max 5 images allowed", "error"); return; } setForm((f) => ({ ...f, image_url: f.image_url || url, image_urls: [...(f.image_urls ?? []), url] })); setImagePreviews((prev) => [...prev, url]); }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors capitalize">{kw}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COLORS TAB ── */}
                {formTab === "colors" && (
                  <ColorsTab
                    colors={formColors}
                    onChange={setFormColors}
                    toast={toast}
                  />
                )}
              </div>

              <div className="px-8 py-5 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50/50">
                <div className="flex gap-2 mr-auto">
                  {formTab !== "basic" && (
                    <button type="button" onClick={() => { const order = ["basic", "details", "media", "colors"]; const idx = order.indexOf(formTab); setFormTab(order[idx - 1] as any); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-100 transition-colors">← Back</button>
                  )}
                  {formTab !== "colors" && (
                    <button type="button" onClick={() => { const order = ["basic", "details", "media", "colors"]; const idx = order.indexOf(formTab); setFormTab(order[idx + 1] as any); }} className="px-4 py-2.5 bg-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-200 transition-colors">Next →</button>
                  )}
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center gap-2">
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? "Saving..." : editingId ? "Update Product" : "Add to Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input { width:100%; background:#f9fafb; border-radius:0.75rem; padding:0.75rem 1rem; font-size:0.875rem; outline:none; border:1px solid #e5e7eb; transition:box-shadow 0.15s; }
        .input:focus { box-shadow: 0 0 0 2px #6366f1; border-color: #6366f1; }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
};