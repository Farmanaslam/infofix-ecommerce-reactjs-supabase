import React, { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "../context/StoreContext";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  X,
} from "lucide-react";
import { CATEGORIES, INITIAL_PRODUCTS } from "../constants";
import { Product } from "../types";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "./Product";
import { ProductDetails } from "./ProductDetails";

const PER_PAGE = 12;
const IS_SB = !!supabase;

// ─── Search aliases ────────────────────────────────────────────────────────────

const SEARCH_ALIASES: Record<string, string[]> = {
  // Processors
  processor: [
    "processor",
    "processors",
    "cpu",
    "intel",
    "amd",
    "ryzen",
    "core i",
  ],
  processors: [
    "processor",
    "processors",
    "cpu",
    "intel",
    "amd",
    "ryzen",
    "core i",
  ],
  cpu: ["processor", "processors", "cpu", "core"],
  cpus: ["processor", "processors", "cpu", "core"],

  // Peripherals
  peripherals: [
    "peripherals",
    "peripheral",
    "keyboard",
    "mouse",
    "headset",
    "webcam",
    "speaker",
  ],
  peripheral: ["peripherals", "peripheral"],

  // CCTV / Camera
  cctv: ["cctv", "camera", "surveillance", "security camera", "dvr", "nvr"],
  camera: ["cctv", "camera", "surveillance"],
  cameras: ["cctv", "camera", "cameras", "surveillance"],
  surveillance: ["cctv", "camera", "surveillance"],

  // RAM / Memory
  ram: ["ram", "memory", "ddr", "dimm", "sodimm"],
  memory: ["ram", "memory", "ddr"],

  // GPU / Graphics
  gpu: ["gpu", "graphics card", "graphics", "nvidia", "radeon", "rtx", "gtx"],
  gpus: ["gpu", "graphics card", "graphics", "nvidia", "radeon", "rtx", "gtx"],
  graphics: ["graphics card", "gpu", "nvidia", "radeon"],

  // Laptop / Notebooks — FIX: added "laptops" plural
  laptop: ["laptop", "laptops", "notebook", "notebooks", "ultrabook"],
  laptops: ["laptop", "laptops", "notebook", "notebooks", "ultrabook"],
  notebook: ["laptop", "laptops", "notebook", "notebooks"],
  notebooks: ["laptop", "laptops", "notebook", "notebooks"],

  // Desktop — FIX: added "desktops" plural
  desktop: ["desktop", "desktops", "pc", "tower", "workstation"],
  desktops: ["desktop", "desktops", "pc", "tower", "workstation"],
  pc: ["desktop", "desktops", "pc", "tower", "workstation"],
  pcs: ["desktop", "desktops", "pc", "tower", "workstation"],

  // Monitor / Display
  monitor: ["monitor", "monitors", "display", "screen", "led"],
  monitors: ["monitor", "monitors", "display", "screen"],
  display: ["monitor", "monitors", "display", "screen"],
  screen: ["monitor", "monitors", "screen", "display"],

  // SSD / Storage
  ssd: ["ssd", "solid state", "nvme", "storage"],
  storage: ["ssd", "hdd", "hard disk", "storage", "nvme"],

  // Custom PC
  "custom pc": ["custom pc", "custom", "build", "gaming pc"],
  custom: ["custom pc", "custom", "build"],
  // Accessories
  accessories: [
    "accessories",
    "accessory",
    "ram",
    "motherboard",
    "monitor",
    "keyboard",
    "mouse",
    "cpu",
  ],
  motherboard: ["motherboard", "motherboards", "mobo", "mainboard"],
  motherboards: ["motherboard", "motherboards", "mobo", "mainboard"],
  keyboard: ["keyboard", "keyboards", "mechanical keyboard"],
  keyboards: ["keyboard", "keyboards"],
  mouse: ["mouse", "mice", "gaming mouse"],
  mice: ["mouse", "mice"],
};
function normalizeTerm(term: string): string {
  if (SEARCH_ALIASES[term]) return term;
  if (term.endsWith("es") && SEARCH_ALIASES[term.slice(0, -2)])
    return term.slice(0, -2);
  if (term.endsWith("s") && SEARCH_ALIASES[term.slice(0, -1)])
    return term.slice(0, -1);
  return term;
}

function expandTerms(terms: string[]): string[] {
  const expanded = new Set<string>();
  for (const term of terms) {
    expanded.add(term);
    // FIX 2: normalize before looking up aliases
    const normalized = normalizeTerm(term);
    expanded.add(normalized);
    const aliases = SEARCH_ALIASES[normalized] ?? SEARCH_ALIASES[term];
    if (aliases) aliases.forEach((a) => expanded.add(a));
  }
  return [...expanded];
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  laptop: "Laptop",
  laptops: "Laptop",
  notebook: "Laptop",
  notebooks: "Laptop",
  desktop: "Desktop",
  desktops: "Desktop",
  "desktop pc": "Desktop",
  "custom pc": "Custom PC",
  "custom pcs": "Custom PC",
  "gaming pc": "Custom PC",
  accessories: "Accessories",
  ram: "Accessories",
  motherboard: "Accessories",
  keyboard: "Accessories",
  mouse: "Accessories",
  monitor: "Accessories",
  cpu: "Accessories",
};

// AFTER
// Maps specific subcategory keywords → { category, subcategory }
const SUBCATEGORY_KEYWORDS: Record<
  string,
  { category: string; subcategory: string }
> = {
  ram: { category: "Accessories", subcategory: "RAM" },
  motherboard: { category: "Accessories", subcategory: "Motherboard" },
  motherboards: { category: "Accessories", subcategory: "Motherboard" },
  keyboard: { category: "Accessories", subcategory: "Keyboard" },
  keyboards: { category: "Accessories", subcategory: "Keyboard" },
  mouse: { category: "Accessories", subcategory: "Mouse" },
  mice: { category: "Accessories", subcategory: "Mouse" },
  monitor: { category: "Accessories", subcategory: "Monitor" },
  monitors: { category: "Accessories", subcategory: "Monitor" },
  cpu: { category: "Accessories", subcategory: "CPU" },
  gaming: { category: "Laptop", subcategory: "Gaming" },
  "gaming laptop": { category: "Laptop", subcategory: "Gaming" },
  "gaming laptops": { category: "Laptop", subcategory: "Gaming" },
  "business laptop": { category: "Laptop", subcategory: "Business" },
  "student laptop": { category: "Laptop", subcategory: "Student" },
  refurbished: { category: "Laptop", subcategory: "Refurbished" },
  "refurbished laptop": { category: "Laptop", subcategory: "Refurbished" },
  "refurbished laptops": { category: "Laptop", subcategory: "Refurbished" },
};

function inferCategoryFromQuery(
  query: string,
): { category: string; subcategory: string } | null {
  const q = query.trim().toLowerCase();

  if (SUBCATEGORY_KEYWORDS[q]) return SUBCATEGORY_KEYWORDS[q];
  for (const [keyword, result] of Object.entries(SUBCATEGORY_KEYWORDS)) {
    if (q === keyword || q.startsWith(keyword + " ")) return result;
  }
  if (CATEGORY_KEYWORDS[q])
    return { category: CATEGORY_KEYWORDS[q], subcategory: "" };
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (q === keyword || q.startsWith(keyword + " "))
      return { category: cat, subcategory: "" };
  }

  return null;
}

// ─── Mappers ───────────────────────────────────────────────────────────────────
function fromSupabase(row: any): Product {
  const disc = row.discount_percent ?? 0;
  const imageUrl =
    row.image_url ??
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80";
  return {
    id: String(row.id),
    name: row.name ?? "",
    description: row.description ?? "",
    image: imageUrl,
    images:
      Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : [imageUrl],
    price: Number(row.discounted_price ?? row.retail_price ?? 0),
    retailPrice: disc > 0 ? Number(row.retail_price) : undefined,
    discountPercent: disc,
    stock: row.stock_quantity ?? 0,
    condition: row.condition ?? "New",
    category: row.categories?.name ?? "",
    subcategory: row.subcategories?.name,
    brand: row.brand ?? "",
    specs: row.specs
      ? Object.values(row.specs as Record<string, unknown>).map(String)
      : [],
    rating: Number(row.rating_avg ?? 0),
    reviews: row.reviews_count ?? row.rating_count ?? 0,
    likesCount: row.likes_count ?? 0,
    tags: [],
    model: row.model ?? "",
    min_order_quantity: row.min_order_quantity ?? 1,
  };
}

function fromConstant(p: any): Product {
  const hasSaving = p.retailPrice && p.retailPrice > p.price;
  return {
    id: String(p.id),
    name: p.name ?? "",
    description: p.description ?? "",
    image: p.image ?? "",
    price: p.price ?? 0,
    retailPrice: hasSaving ? p.retailPrice : undefined,
    discountPercent: hasSaving
      ? Math.round(((p.retailPrice - p.price) / p.retailPrice) * 100)
      : 0,
    stock: p.stock ?? 0,
    condition: p.condition ?? "New",
    category: p.category ?? "",
    brand: p.brand ?? "",
    specs: Array.isArray(p.specs) ? p.specs : [],
    rating: p.rating ?? 0,
    reviews: p.reviews ?? 0,
    likesCount: p.likesCount ?? 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
    images:
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : p.image
          ? [p.image]
          : [],
    model: p.model ?? "",
  };
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = React.memo(({ idx }: { idx: number }) => (
  <div
    className="flex flex-col"
    style={{
      animationDelay: `${idx * 60}ms`,
      animation: "skeletonFade 0.4s ease both",
    }}
  >
    <div className="relative aspect-square md:aspect-4/5 rounded-2xl md:rounded-[28px] overflow-hidden mb-3 md:mb-6 bg-gray-100">
      <div className="skeleton-shimmer absolute inset-0" />
    </div>
    <div className="px-1 md:px-2 space-y-1.5 md:space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-2.5 w-20 rounded-full bg-gray-100 skeleton-shimmer" />
        <div
          className="h-5 w-12 rounded-lg bg-gray-100 skeleton-shimmer"
          style={{ animationDelay: "0.1s" }}
        />
      </div>
      <div
        className="h-5 w-4/5 rounded-lg bg-gray-100 skeleton-shimmer"
        style={{ animationDelay: "0.12s" }}
      />
      <div
        className="h-4 w-3/5 rounded-lg bg-gray-100 skeleton-shimmer"
        style={{ animationDelay: "0.15s" }}
      />
      <div className="flex gap-2">
        <div
          className="h-6 w-20 rounded-lg bg-gray-100 skeleton-shimmer"
          style={{ animationDelay: "0.18s" }}
        />
        <div
          className="h-6 w-16 rounded-lg bg-gray-100 skeleton-shimmer"
          style={{ animationDelay: "0.21s" }}
        />
      </div>
      <div className="flex items-end justify-between pt-1">
        <div
          className="h-7 w-28 rounded-lg bg-gray-100 skeleton-shimmer"
          style={{ animationDelay: "0.24s" }}
        />
        <div
          className="h-3 w-14 rounded-full bg-gray-100 skeleton-shimmer"
          style={{ animationDelay: "0.27s" }}
        />
      </div>
      <div
        className="h-12 w-full rounded-2xl bg-gray-100 skeleton-shimmer mt-1"
        style={{ animationDelay: "0.30s" }}
      />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="mt-16 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-5"
    >
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Showing{" "}
        <span className="text-gray-800 font-black">
          {from}–{to}
        </span>{" "}
        of <span className="text-gray-800 font-black">{total}</span> products
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`el-${i}`}
              className="w-10 text-center text-gray-300 text-sm select-none"
            >
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === page ? "page" : undefined}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${p === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" : "border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

// ─── Filter section ────────────────────────────────────────────────────────────
const FilterSection = ({
  title,
  options,
  selected,
  onChange,
  single = false,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (v: any) => void;
  single?: boolean;
}) => {
  const toggle = (value: string) => {
    if (single) {
      onChange(selected.includes(value) ? "" : value);
      return;
    }
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => toggle(option)}
            className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${selected.includes(option) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STORE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const Store: React.FC = () => {
  const {
    addToCart,
    setCurrentPage,
    headerSearchQuery,
    setHeaderSearchQuery,
    selectedCategory: ctxCategory,
    setSelectedCategory: ctxSetCategory,
    selectedSubcategory: ctxSubcategory,
    setSelectedSubcategory: ctxSetSubcategory,
    currentUser,
    pendingRedirectAfterLogin,
    setPendingRedirectAfterLogin,
    selectedStoreSection
  } = useStore();

  // Theme config per section
  const SECTION_THEMES = {
    Infofix: {
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentLight: '#eff6ff',
      accentText: '#4338ca',
      pill: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
      pillInactive: 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600',
      subPill: 'bg-indigo-100 text-indigo-700 border-indigo-300',
      subPillInactive: 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 border-gray-200',
      heroHeadline: 'text-gray-900',
      heroAccent: 'text-indigo-600',
      heroSubtext: 'text-gray-500',
      heroBg: 'bg-white',
      heroLabel: 'bg-indigo-600/5 border-indigo-600/10 text-indigo-600',
      searchBtn: 'bg-indigo-600 hover:bg-indigo-700',
      label: 'Infofix Store',
      eyebrow: 'Curated Technology',
      headline1: 'Explore Our',
      headline2: 'Products.',
      subtext: 'Discover new and certified refurbished laptops, desktops, PCs, and accessories curated for students, professionals, and businesses. Backed by Infofix warranty.',
    },
    Refurbished: {
      accent: '#059669',
      accentHover: '#047857',
      accentLight: '#f0fdf4',
      accentText: '#065f46',
      pill: 'text-white shadow-md',
      pillStyle: { background: '#059669' },
      pillInactive: 'bg-gray-100 text-gray-500',
      pillInactiveHover: { hover: '#f0fdf4', hoverText: '#059669' },
      subPill: 'border',
      subPillStyle: { background: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' },
      subPillInactive: 'bg-gray-50 text-gray-400 border-gray-200',
      heroHeadline: 'text-gray-900',
      heroAccent: 'text-emerald-600',
      heroSubtext: 'text-gray-500',
      heroBg: 'bg-white',
      heroLabel: 'border text-emerald-700',
      heroLabelStyle: { background: '#ecfdf5', borderColor: '#6ee7b7' },
      searchBtn: '',
      searchBtnStyle: { background: '#059669' },
      label: 'Refurbished',
      eyebrow: '♻️ Certified Refurbished',
      headline1: 'Quality Tech,',
      headline2: 'Smart Price.',
      subtext: 'Grade-A certified refurbished laptops, desktops, and accessories. Each device professionally tested, cleaned, and backed by our warranty. Reliable performance at half the price.',
    },
    Wholesale: {
      accent: '#db2777',
      accentHover: '#be185d',
      accentLight: '#fdf2f8',
      accentText: '#9d174d',
      pill: 'text-white shadow-md',
      pillStyle: { background: '#db2777' },
      pillInactive: 'bg-gray-100 text-gray-500',
      subPill: 'border',
      subPillStyle: { background: '#fce7f3', color: '#9d174d', borderColor: '#f9a8d4' },
      subPillInactive: 'bg-gray-50 text-gray-400 border-gray-200',
      heroHeadline: 'text-gray-900',
      heroAccent: 'text-pink-600',
      heroSubtext: 'text-gray-500',
      heroBg: 'bg-white',
      heroLabel: 'border text-pink-700',
      heroLabelStyle: { background: '#fdf2f8', borderColor: '#f9a8d4' },
      searchBtn: '',
      searchBtnStyle: { background: '#db2777' },
      label: 'Wholesale',
      eyebrow: '📦 Bulk & Wholesale Deals',
      headline1: 'Buy More,',
      headline2: 'Save More.',
      subtext: 'Wholesale pricing for businesses, resellers, and bulk buyers. Get the best rates on laptops, desktops, components, and accessories when you order in volume.',
    },
  } as const;

  const theme = SECTION_THEMES[selectedStoreSection];

  // ── Navigation state ──────────────────────────────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    try {
      const saved = sessionStorage.getItem("selectedProduct");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── data state ──
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [fromFallback, setFromFallback] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── pagination ──
  const [page, setPage] = useState(1);

  // ── filters ──
  const [selectedCategory, setSelectedCategory] = useState(() =>
    ctxCategory ? ctxCategory : "All",
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(() =>
    ctxSubcategory ? ctxSubcategory : "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("latest");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [heroSearch, setHeroSearch] = useState("");

  const gridRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // FIX 4: Use a ref to hold the "pending search" from home page so `load()`
  // can read it synchronously without waiting for state to settle.
  // This fixes the race condition where headerSearchQuery bridge fires
  // setSearchQuery but load() still sees the old empty string.
  const pendingSearchRef = useRef<string>("");

  // ── Bridge: context category → local state ──────────────────────────────
  useEffect(() => {
    if (ctxCategory) {
      setSelectedProduct(null);
      sessionStorage.removeItem("selectedProduct");
      setSelectedCategory(ctxCategory);
      setSelectedSubcategory(ctxSubcategory || "");
      setPage(1);
      ctxSetCategory(null);
      ctxSetSubcategory(null);
    }
  }, [ctxCategory]);

  useEffect(() => {
    const pending = headerSearchQuery?.trim();
    if (pending) {
      pendingSearchRef.current = pending;

      const inferred = inferCategoryFromQuery(pending);
      if (inferred) {
        setSelectedCategory(inferred.category);
        setSelectedSubcategory(inferred.subcategory);
        setSearchQuery(pending);
        setHeroSearch(pending);
        pendingSearchRef.current = pending;
      } else {
        setSearchQuery(pending);
        setHeroSearch(pending);
        setSelectedCategory("All");
        setSelectedSubcategory("");
      }
      setPage(1);
      setHeaderSearchQuery("")
      setSelectedProduct(null);
      sessionStorage.removeItem("selectedProduct");
    }
  }, [headerSearchQuery]);
  // When category/subcategory selected from nav while in ProductDetails, go back to grid
  useEffect(() => {
    if (ctxCategory && selectedProduct) {
      setSelectedProduct(null);
      sessionStorage.removeItem("selectedProduct");
    }
  }, [ctxCategory]);
  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleViewDetails = (product: Product) => {
    const enriched = products.find((p) => p.id === product.id) ?? product;
    setSelectedProduct(enriched);
    sessionStorage.setItem("selectedProduct", JSON.stringify(enriched));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuyNow = (product: Product) => {
    if (!currentUser) {
      // Save product for post-login add-to-cart
      sessionStorage.setItem("pendingBuyNowProduct", JSON.stringify(product));
      setPendingRedirectAfterLogin("checkout");
      setCurrentPage("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    addToCart(product as any);
    setCurrentPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleNavigateToCart = () => {
    setSelectedProduct(null);
    sessionStorage.removeItem("selectedProduct");
    setCurrentPage("cart");
  };

  // FIX 5: Hero search bar — also infer category from store-page search
  const handleHeroSearch = () => {
    const q = heroSearch.trim();
    if (!q) return;

    const inferredCat = inferCategoryFromQuery(q);
    const inferred = inferCategoryFromQuery(q);
    if (inferred) {
      setSelectedCategory(inferred.category);
      setSelectedSubcategory(inferred.subcategory);
      setSearchQuery(q);
    } else {
      setSearchQuery(q);
    }
    setPage(1);
  };

  // ── FETCH ────────────────────────────────────────────────────────────────
  const load = useCallback(
    async (currentPage: number) => {
      setLoading(true);
      setRevealed(false);
      setFetchError(null);
      const effectiveSearchQuery = (
        searchQuery.trim() || pendingSearchRef.current.trim()
      ).trim();

      let loaded = false;
      if (IS_SB && supabase) {
        try {
          let q = supabase
            .from("products")
            .select(
              `id, name, description, image_url, images,
               retail_price,min_order_quantity,  discount_percent, discounted_price,
               stock_quantity, condition, brand, specs,
               rating_avg, rating_count, reviews_count, likes_count, created_at,
               categories ( name, slug ),
               subcategories ( name, slug ),model`,
              { count: "exact" },
            )
            .eq("is_active", true)
            .eq("store_section", selectedStoreSection.toLowerCase());
          if (selectedCategory !== "All") {
            const { data: cats } = await supabase
              .from("categories")
              .select("id")
              .ilike("name", `%${selectedCategory}%`);
            const catIds = (cats ?? []).map((c: any) => c.id);
            if (catIds.length) q = q.in("category_id", catIds);
          }

          if (selectedSubcategory) {
            const { data: subs } = await supabase
              .from("subcategories")
              .select("id")
              .ilike("name", `%${selectedSubcategory}%`);
            const subIds = (subs ?? []).map((s: any) => s.id);

            let subHasProducts = false;
            if (subIds.length) {
              const { count } = await supabase
                .from("products")
                .select("id", { count: "exact", head: true })
                .in("subcategory_id", subIds)
                .eq("is_active", true);
              subHasProducts = (count ?? 0) > 0;
            }

            if (subHasProducts) {
              q = q.in("subcategory_id", subIds);
            } else {
              q = q.or(
                `brand.ilike.%${selectedSubcategory}%,name.ilike.%${selectedSubcategory}%`,
              );
            }
          }

          if (selectedBrands.length) {
            q = q.or(selectedBrands.map((b) => `brand.ilike.%${b}%`).join(","));
          }

          // ── RAM filter ──
          if (selectedRam.length) {
            const ramConditions = selectedRam
              .flatMap((ram) => [
                `specs->>0.ilike.%${ram}%`,
                `name.ilike.%${ram}%`,
                `description.ilike.%${ram}%`,
              ])
              .join(",");
            q = q.or(ramConditions);
          }

          // ── Storage filter ──
          if (selectedStorage.length) {
            const storageConditions = selectedStorage
              .flatMap((s) => [
                `specs->>0.ilike.%${s}%`,
                `name.ilike.%${s}%`,
                `description.ilike.%${s}%`,
              ])
              .join(",");
            q = q.or(storageConditions);
          }

          if (effectiveSearchQuery) {
            const terms = effectiveSearchQuery
              .trim()
              .toLowerCase()
              .split(/\s+/)
              .filter(Boolean);
            for (const term of terms) {
              const aliases = expandTerms([term]);
              const conditions = aliases
                .flatMap((alias) => [
                  `name.ilike.%${alias}%`,
                  `description.ilike.%${alias}%`,
                  `brand.ilike.%${alias}%`,
                  `model.ilike.%${alias}%`,
                  `specs->>0.ilike.%${alias}%`,
                ])
                .join(",");
              q = q.or(conditions);
            }
          }

          if (minPrice) q = q.gte("discounted_price", Number(minPrice));
          if (maxPrice) q = q.lte("discounted_price", Number(maxPrice));

          switch (sortOption) {
            case "low-high":
              q = q.order("discounted_price", { ascending: true });
              break;
            case "high-low":
              q = q.order("discounted_price", { ascending: false });
              break;
            case "rating":
              q = q.order("rating_avg", { ascending: false });
              break;
            default:
              q = q.order("created_at", { ascending: false });
              break;
          }

          const from = (currentPage - 1) * PER_PAGE;
          q = q.range(from, from + PER_PAGE - 1);

          const { data, error, count } = await q;
          if (error) throw error;

          const mappedProducts = (data ?? []).map(fromSupabase);
          if (effectiveSearchQuery) {
            const sq = effectiveSearchQuery.toLowerCase();
            const score = (p: Product): number => {
              const name = p.name.toLowerCase();
              const brand = (p.brand ?? "").toLowerCase();
              const model = (p.model ?? "").toLowerCase();
              if (name.startsWith(sq) || name === sq) return 0;
              if (name.includes(sq)) return 1;
              if (brand.includes(sq)) return 2;
              if (model.includes(sq)) return 3;
              return 4;
            };
            mappedProducts.sort((a, b) => score(a) - score(b));
          }
          // ── Fetch tags separately and attach ──
          const productIdsForTags = mappedProducts.map((p) => Number(p.id));
          if (productIdsForTags.length > 0) {
            const { data: tagRows } = await supabase
              .from("product_tags")
              .select("product_id, tags ( name )")
              .in("product_id", productIdsForTags);

            if (tagRows) {
              const tagsMap: Record<number, string[]> = {};
              for (const row of tagRows) {
                const pid = row.product_id;
                const name = (row.tags as any)?.name;
                if (name) {
                  if (!tagsMap[pid]) tagsMap[pid] = [];
                  tagsMap[pid].push(name);
                }
              }
              for (const p of mappedProducts) {
                p.tags = tagsMap[Number(p.id)] ?? [];
              }
            }
          }

          // ── Fetch real review counts ──
          const productIds = mappedProducts.map((p) => Number(p.id));
          if (productIds.length > 0) {
            const { data: reviewRows } = await supabase
              .from("reviews")
              .select("product_id")
              .in("product_id", productIds);

            if (reviewRows) {
              const countMap: Record<number, number> = {};
              for (const row of reviewRows) {
                countMap[row.product_id] = (countMap[row.product_id] ?? 0) + 1;
              }
              for (const p of mappedProducts) {
                const realCount = countMap[Number(p.id)];
                if (realCount !== undefined) p.reviews = realCount;
              }
            }
          }

          setProducts(mappedProducts);
          setTotalCount(count ?? 0);
          setFromFallback(false);
          loaded = true;
        } catch (err: any) {
          console.warn("[Store] Supabase error:", err?.message ?? err);
          setFetchError(
            "Couldn't reach the database — showing local catalog instead.",
          );
        }
      }

      if (!loaded) {
        let result = INITIAL_PRODUCTS.map(fromConstant);
        if (selectedCategory !== "All")
          result = result.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
          );
        if (selectedSubcategory)
          result = result.filter(
            (p) =>
              p.subcategory?.toLowerCase() ===
              selectedSubcategory.toLowerCase(),
          );
        if (selectedCondition !== "All")
          result = result.filter((p) => p.condition === selectedCondition);

        // FIX 6: also use expandTerms in fallback search
        if (effectiveSearchQuery) {
          const terms = effectiveSearchQuery
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
          result = result.filter((p) => {
            const haystack = [
              p.name,
              p.description ?? "",
              p.brand ?? "",
              p.category ?? "",
              p.subcategory ?? "",
              p.model ?? "",
              ...(p.specs ?? []),
              ...(p.tags ?? []),
            ]
              .join(" ")
              .toLowerCase();
            return terms.every((term) => {
              const aliases = expandTerms([term]);
              return aliases.some((alias) => haystack.includes(alias));
            });
          });
        }
        if (selectedBrands.length)
          result = result.filter(
            (p) => p.brand && selectedBrands.includes(p.brand),
          );
        if (minPrice)
          result = result.filter((p) => p.price >= Number(minPrice));
        if (maxPrice)
          result = result.filter((p) => p.price <= Number(maxPrice));

        switch (sortOption) {
          case "low-high":
            result.sort((a, b) => a.price - b.price);
            break;
          case "high-low":
            result.sort((a, b) => b.price - a.price);
            break;
          case "rating":
            result.sort((a, b) => b.rating - a.rating);
            break;
        }

        const total = result.length;
        const from = (currentPage - 1) * PER_PAGE;
        setProducts(result.slice(from, from + PER_PAGE));
        setTotalCount(total);
        setFromFallback(true);
      }

      await new Promise((r) => setTimeout(r, 420));
      setLoading(false);
      if (
        pendingSearchRef.current &&
        pendingSearchRef.current === searchQuery.trim()
      ) {
        pendingSearchRef.current = "";
      }
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setRevealed(true)),
      );
    },
    [
      selectedCategory,
      selectedSubcategory,
      selectedCondition,
      searchQuery,
      sortOption,
      minPrice,
      maxPrice,
      selectedBrands,
      selectedProcessors,
      selectedRam,
      selectedStorage,
      selectedStoreSection,
    ],
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    setPage(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedCondition,
    searchQuery,
    sortOption,
    minPrice,
    maxPrice,
    selectedBrands,
    selectedProcessors,
    selectedRam,
    selectedStorage,
    selectedStoreSection,
  ]);

  const handlePageChange = (newPage: number) => {
    setRevealed(false);
    setPage(newPage);
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ── If a product is selected, render ProductDetails ───────────────────────
  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => {
          setSelectedProduct(null);
          sessionStorage.removeItem("selectedProduct");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateToCart={handleNavigateToCart}
      />
    );
  }

  // ── Otherwise render the store grid ──────────────────────────────────────
  return (
    <div className="pb-32 overflow-hidden bg-white">
      <style>{`
        @keyframes skeletonWave {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: skeletonWave 1.4s ease infinite;
        }
        @keyframes skeletonFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-in-up { animation: fadeInUp 0.5s ease both; }
      `}</style>

      {/* ── Hero ── */}
      <section className="relative flex items-center justify-center overflow-hidden h-auto py-2 px-2 md:h-80 md:py-0" style={{ background: 'white' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full blur-[120px] opacity-40 pointer-events-none"
          style={{ background: theme.accent + '22' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full blur-[100px] opacity-30 pointer-events-none"
          style={{ background: theme.accent + '18' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-5">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest anim-fade-in-up"
            style={
              selectedStoreSection === 'Infofix'
                ? { background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', color: '#6366f1' }
                : { background: (theme as any).heroLabelStyle?.background, border: `1px solid ${(theme as any).heroLabelStyle?.borderColor}`, color: theme.accentText }
            }
          >
            <Sparkles className="w-3 h-3" /> {theme.eyebrow}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter anim-fade-in-up" style={{ animationDelay: "0.08s" }}>
            {theme.headline1}{' '}
            <span style={{ color: theme.accent }}>{theme.headline2}</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium anim-fade-in-up" style={{ animationDelay: "0.16s" }}>
            {theme.subtext}
          </p>

          <div className="w-[90%] sm:w-full max-w-2xl mx-auto relative group anim-fade-in-up" style={{ animationDelay: "0.24s" }}>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl flex items-center p-2 shadow-2xl shadow-gray-200/50 border border-gray-100">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={
                  selectedStoreSection === 'Refurbished' ? 'Search refurbished laptops, desktops...'
                    : selectedStoreSection === 'Wholesale' ? 'Search bulk products...'
                      : 'Find your next upgrade...'
                }
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHeroSearch()}
                className="bg-transparent border-none outline-none flex-1 px-2 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400"
              />
              {heroSearch && (
                <button onClick={() => { setHeroSearch(""); setSearchQuery(""); }}
                  className="mr-2 w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleHeroSearch}
                className="text-white px-3 py-3 sm:px-6 rounded-xl font-bold text-sm transition-colors shrink-0"
                style={{ background: theme.accent }}
                onMouseEnter={e => (e.currentTarget.style.background = theme.accentHover)}
                onMouseLeave={e => (e.currentTarget.style.background = theme.accent)}
              >
                <span className="hidden sm:inline">Search</span>
                <Search className="w-4 h-4 sm:hidden" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="app-container mt-4">
        {/* ── Filter Bar ── */}
        <div
          ref={gridRef}
          className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-white/96 backdrop-blur-sm border-b border-gray-100 mb-6"
        >
          <div className="flex flex-col gap-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-2 w-full">
              {["All", "Laptop", "Desktop", "Custom PC", "Accessories"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if (cat === "All") {
                        setSelectedSubcategory("");
                        setSearchQuery("");
                        setHeroSearch("");
                      }
                      if (cat !== selectedCategory) setSelectedSubcategory("");
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${selectedCategory === cat
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-500'
                      }`}
                    style={selectedCategory === cat ? { background: theme.accent, boxShadow: `0 4px 12px ${theme.accent}44` } : {}}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>

            {/* Subcategory pills — shown when Laptop is selected */}
            {selectedCategory === "Laptop" && (
              <div className="flex flex-wrap items-center gap-2 w-full mt-1">
                {["Gaming", "Business", "Student"].map((sub) => (
                  <button
                    key={sub}
                    onClick={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === sub ? "" : sub,
                      )
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${selectedSubcategory === sub ? "" : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    style={selectedSubcategory === sub
                      ? { background: theme.accentLight, color: theme.accentText, borderColor: theme.accent + '88' }
                      : {}
                    }
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
            {/* Subcategory pills — shown when Accessories is selected */}
            {selectedCategory === "Accessories" && (
              <div className="flex flex-wrap items-center gap-2 w-full mt-1">
                {[
                  "RAM",
                  "Motherboard",
                  "Monitor",
                  "Keyboard",
                  "Mouse",
                  "CPU",
                ].map((sub) => (
                  <button
                    key={sub}
                    onClick={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === sub ? "" : sub,
                      )
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${selectedSubcategory === sub ? "" : "bg-gray-50 text-gray-400 border-gray-200"
                      }`}
                    style={selectedSubcategory === sub
                      ? { background: theme.accentLight, color: theme.accentText, borderColor: theme.accent + '88' }
                      : {}
                    }
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-gray-400">
                    <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                    Loading products…
                  </span>
                ) : (
                  <>
                    <span className="text-gray-800 font-black">
                      {totalCount}
                    </span>{" "}
                    Products
                    {selectedCategory !== "All" && (
                      <span className="text-indigo-500 ml-1.5">
                        · {selectedCategory}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="text-indigo-500 ml-1.5">
                        · "{searchQuery}"
                      </span>
                    )}
                    {page > 1 && (
                      <span className="text-gray-400 ml-1.5">
                        · Page {page} of {totalPages}
                      </span>
                    )}
                  </>
                )}
              </p>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
              </button>
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-16">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} idx={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-16 items-stretch">
              {products.map((product, index) => (
                <ProductCard
                  key={`${product.id}-p${page}`}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onViewDetails={handleViewDetails}
                  cardIdx={index}
                  revealed={revealed}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center anim-fade-in-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              No matches found.
            </h2>
            <p className="text-gray-500 font-medium max-w-sm mb-8 text-sm leading-relaxed">
              Try adjusting your filters or search keywords to discover what
              you're looking for.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setHeroSearch("");
                setSelectedCondition("All");
                setSortOption("latest");
                setMinPrice("");
                setMaxPrice("");
                setSelectedSubcategory("");
                setSelectedBrands([]);
              }}
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Filter Drawer ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-8 py-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Filter & Sort
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 font-black text-lg transition-all"
              >
                ✕
              </button>
            </div>
            <div className="px-8 py-8 space-y-10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  Sort By
                </h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 font-semibold text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="latest">Featured</option>
                  <option value="low-high">Price: Low → High</option>
                  <option value="high-low">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
              <FilterSection
                title="Category"
                options={CATEGORIES}
                selected={selectedCategory === "All" ? [] : [selectedCategory]}
                single
                onChange={(v) => setSelectedCategory(v || "All")}
              />
              <FilterSection
                title="Brand"
                options={[
                  "Dell",
                  "HP",
                  "Lenovo",
                  "Acer",
                  "Apple",
                  "Asus",
                  "MSI",
                  "AMD",
                  "Intel",
                  "Samsung",
                  "Corsair",
                ]}
                selected={selectedBrands}
                onChange={setSelectedBrands}
              />
              <FilterSection
                title="RAM"
                options={["4GB", "8GB", "16GB", "32GB", "64GB"]}
                selected={selectedRam}
                onChange={setSelectedRam}
              />
              <FilterSection
                title="Storage"
                options={[
                  "256GB SSD",
                  "512GB SSD",
                  "1TB HDD",
                  "1TB SSD",
                  "2TB HDD",
                ]}
                selected={selectedStorage}
                onChange={setSelectedStorage}
              />
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  Price Range (₹)
                </h3>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-100"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setHeroSearch("");
                  setSelectedCondition("All");
                  setSortOption("latest");
                  setMinPrice("");
                  setMaxPrice("");
                  setSelectedBrands([]);
                  setSelectedProcessors([]);
                  setSelectedRam([]);
                  setSelectedStorage([]);
                  setIsFilterOpen(false);
                }}
                className="w-full bg-white hover:bg-red-50 text-red-500 border border-red-200 hover:border-red-300 py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trust Section ── */}
      {!loading && products.length > 0 && (
        <section className="mt-24 app-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: "50000+", label: "Happy Customers" },
              { stat: "1 Year", label: "Warranty on All Products" },
              { stat: "Secure", label: "Verified Payments" },
              { stat: "Fast", label: "PAN India Shipping" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-indigo-100 hover:shadow-md transition-all"
              >
                <h3 className="font-black text-3xl text-indigo-600">
                  {item.stat}
                </h3>
                <p className="text-gray-500 font-semibold text-sm mt-2">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
