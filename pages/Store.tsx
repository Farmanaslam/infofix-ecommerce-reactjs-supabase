import React, { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "../context/StoreContext";
import {
  Star,
  Heart,
  Search,
  SlidersHorizontal,
  Eye,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Database,
  AlertCircle,
  X,
} from "lucide-react";
import { CATEGORIES, INITIAL_PRODUCTS } from "../constants";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE CLIENT — gracefully no-ops if env vars are missing
// .env: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// ─────────────────────────────────────────────────────────────────────────────
const SB_URL = (import.meta as any).env?.VITE_SUPABASE_URL ?? "";
const SB_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? "";
const IS_SB = !!(
  SB_URL &&
  SB_KEY &&
  SB_URL.startsWith("https://") &&
  !SB_URL.includes("placeholder")
);
const supabase = IS_SB ? createClient(SB_URL, SB_KEY) : null;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  retailPrice?: number;
  discountPercent: number;
  stock: number;
  condition: "New" | "Refurbished";
  category: string;
  subcategory?: string;
  brand?: string;
  specs: string[];
  rating: number;
  reviews: number;
  likesCount: number;
  tags: string[];
}

const PER_PAGE = 12;

// ─────────────────────────────────────────────────────────────────────────────
// MAPPERS
// ─────────────────────────────────────────────────────────────────────────────
function fromSupabase(row: any): Product {
  const disc = row.discount_percent ?? 0;
  return {
    id: String(row.id),
    name: row.name ?? "",
    description: row.description ?? "",
    image:
      row.image_url ??
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
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
    reviews: row.rating_count ?? 0,
    likesCount: row.likes_count ?? 0,
    tags: (row.product_tags ?? [])
      .map((pt: any) => pt.tags?.name)
      .filter(Boolean),
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
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = React.memo(({ idx }: { idx: number }) => (
  <div
    className="flex flex-col"
    style={{
      animationDelay: `${idx * 60}ms`,
      animation: "skeletonFade 0.4s ease both",
    }}
  >
    {/* Image placeholder */}
    <div className="relative aspect-4/5 rounded-[28px] overflow-hidden mb-6 bg-gray-100">
      <div className="skeleton-shimmer absolute inset-0" />
    </div>
    {/* Text lines */}
    <div className="px-2 space-y-3">
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
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = React.memo(
  ({
    product,
    onAddToCart,
    cardIdx,
    revealed,
  }: {
    product: Product;
    onAddToCart: (p: Product) => void;
    cardIdx: number;
    revealed: boolean;
  }) => {
    const storageKey = `liked_product_${product.id}`;
    const countKey = `likes_count_${product.id}`;
    const [liked, setLiked] = useState(() => {
      try {
        return localStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    });
    const [likes, setLikes] = useState(() => {
      try {
        const stored = localStorage.getItem(countKey);
        return stored ? Number(stored) : product.likesCount;
      } catch {
        return product.likesCount;
      }
    });
    const [imgError, setImgError] = useState(false);

    const handleLike = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const nowLiked = !liked;
      const newCount = nowLiked ? likes + 1 : Math.max(0, likes - 1);
      setLiked(nowLiked);
      setLikes(newCount);
      try {
        if (nowLiked) {
          localStorage.setItem(storageKey, "1");
        } else {
          localStorage.removeItem(storageKey);
        }
        localStorage.setItem(countKey, String(newCount));
      } catch {}
      if (supabase) {
        await supabase.rpc(nowLiked ? "increment_likes" : "decrement_likes", {
          product_id: Number(product.id),
        });
      }
    };

    const savings = product.retailPrice
      ? product.retailPrice - product.price
      : 0;
    const isLow = product.stock > 0 && product.stock < 10;
    const isOut = product.stock === 0;
    const delay = (cardIdx % PER_PAGE) * 55;

    return (
      <article
        className="group relative flex flex-col"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed
            ? "translateY(0) scale(1)"
            : "translateY(22px) scale(0.98)",
          transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
        }}
      >
        {/* ── Image ── */}
        <div
          className="relative aspect-4/5 rounded-[28px] overflow-hidden bg-gray-50 mb-6
                       transition-all duration-500
                       group-hover:-translate-y-2 group-hover:shadow-[0_32px_64px_-12px_rgba(79,70,229,0.18)]"
        >
          <img
            loading="lazy"
            src={
              imgError
                ? "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80"
                : product.image
            }
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Colour overlay */}
          <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/14 transition-colors duration-400 pointer-events-none" />

          {/* ── Action buttons (slide in from right) ── */}
          <div
            className="absolute top-5 right-5 flex flex-col gap-2 z-20
                          translate-x-14 group-hover:translate-x-0
                          transition-transform duration-300 ease-out"
          >
            {/* LIKE */}
            <button
              onClick={handleLike}
              aria-label={liked ? "Liked" : "Like this product"}
              aria-pressed={liked}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center
                          backdrop-blur-md border shadow-lg
                          transition-all duration-250
                          ${
                            liked
                              ? "bg-red-500 border-red-400 text-white scale-110 shadow-red-200/60"
                              : "bg-white/90 border-white/60 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                          }`}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${liked ? "fill-current" : ""}`}
              />
            </button>

            {/* QUICK VIEW */}
            <button
              aria-label="Quick view"
              className="w-10 h-10 rounded-2xl flex items-center justify-center
                         bg-white/90 backdrop-blur-md border border-white/60 text-gray-500
                         hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200
                         shadow-lg transition-all duration-200 delay-60"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* ── Add to cart (slide up) ── */}
          {!isOut && (
            <div
              className="absolute inset-x-3 bottom-3 z-20
                            translate-y-full group-hover:translate-y-0
                            transition-transform duration-400 ease-out"
            >
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white
                           py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]
                           flex items-center justify-center gap-2 shadow-2xl
                           transition-colors duration-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add to Cart
              </button>
            </div>
          )}

          {/* ── Badges ── */}
          <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.condition === "Refurbished" && (
              <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                ✓ Infofix Certified
              </span>
            )}
            {product.condition === "New" && (
              <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                Brand New
              </span>
            )}
            {isOut && (
              <span className="bg-gray-700 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                Out of Stock
              </span>
            )}
            {isLow && !isOut && (
              <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" />
                Only {product.stock} left
              </span>
            )}
            {product.discountPercent >= 10 && (
              <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg">
                {product.discountPercent}% OFF
              </span>
            )}
            {cardIdx === 0 && (
              <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> New
              </span>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex flex-col gap-1.5 px-2 transition-transform duration-500 group-hover:translate-x-0.5">
          {/* Category + Rating */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.18em]">
              {product.category}
              {product.subcategory && (
                <span className="text-gray-400 font-medium normal-case ml-1 tracking-normal">
                  · {product.subcategory}
                </span>
              )}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-amber-700">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-bold text-[18px] text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
            {product.name}
          </h3>

          {/* Specs */}
          {product.specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {product.specs.slice(0, 2).map((s, i) => (
                <span
                  key={i}
                  className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="text-[8px] bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Price + reviews + likes */}
          <div className="flex items-end justify-between mt-1.5">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-[22px] text-gray-900 tracking-tight leading-none">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.retailPrice && product.retailPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through font-medium">
                    ₹{product.retailPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                {product.reviews} reviews
              </p>
              {likes > 0 && (
                <div
                  className={`text-[10px] flex items-center gap-1 justify-end mt-0.5 transition-colors duration-300 ${liked ? "text-red-400" : "text-gray-300"}`}
                >
                  <Heart
                    className={`w-3 h-3 transition-all duration-200 ${liked ? "fill-red-400 text-red-400" : ""}`}
                  />
                  {likes}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  },
);
ProductCard.displayName = "ProductCard";

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────
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
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500
                     hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
                     disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
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
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                p === page
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                  : "border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500
                     hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
                     disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SECTION (reused in drawer)
// ─────────────────────────────────────────────────────────────────────────────
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
      onChange(value);
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
            className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
              selected.includes(option)
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
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
  const { addToCart } = useStore();

  // ── data state ──
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false); // stagger reveal trigger
  const [fromFallback, setFromFallback] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── pagination ──
  const [page, setPage] = useState(1);

  // ── filters ──
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const gridRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const load = useCallback(
    async (currentPage: number) => {
      // Phase 1: show skeletons immediately
      setLoading(true);
      setRevealed(false);
      setFetchError(null);

      let loaded = false;

      // ── Try Supabase ──
      if (IS_SB && supabase) {
        try {
          let q = supabase
            .from("products")
            .select(
              `id, name, description, image_url,
               retail_price, discount_percent, discounted_price,
               stock_quantity, condition, brand, specs,
               rating_avg, rating_count, likes_count, created_at,
               categories ( name, slug ),
               subcategories ( name, slug ),
               product_tags ( tags ( name ) )`,
              { count: "exact" },
            )
            .eq("is_active", true);

          // Server-side filters
          if (selectedCategory !== "All") {
            const { data: cat } = await supabase
              .from("categories")
              .select("id")
              .eq("name", selectedCategory)
              .single();
            if (cat) q = q.eq("category_id", (cat as any).id);
          }
          if (selectedCondition !== "All")
            q = q.eq("condition", selectedCondition);
          if (selectedBrands.length) q = q.in("brand", selectedBrands);
          if (searchQuery.trim())
            q = q.or(
              `name.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`,
            );
          if (minPrice) q = q.gte("discounted_price", Number(minPrice));
          if (maxPrice) q = q.lte("discounted_price", Number(maxPrice));

          // Sort
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

          // Pagination
          const from = (currentPage - 1) * PER_PAGE;
          q = q.range(from, from + PER_PAGE - 1);

          const { data, error, count } = await q;
          if (error) throw error;

          setProducts((data ?? []).map(fromSupabase));
          setTotalCount(count ?? 0);
          setFromFallback(false);
          loaded = true;
        } catch (err: any) {
          console.warn("[InfoFix] Supabase error:", err?.message ?? err);
          setFetchError(
            "Couldn't reach the database — showing local catalog instead.",
          );
        }
      }

      // ── Fallback to INITIAL_PRODUCTS ──
      if (!loaded) {
        let result = INITIAL_PRODUCTS.map(fromConstant);

        if (selectedCategory !== "All")
          result = result.filter((p) => p.category === selectedCategory);
        if (selectedCondition !== "All")
          result = result.filter((p) => p.condition === selectedCondition);
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          result = result.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q),
          );
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

      // Phase 2: hide skeletons → stagger-reveal real cards
      // Intentional 420ms pause so skeleton is visible and transition feels smooth
      await new Promise((r) => setTimeout(r, 420));
      setLoading(false);
      // rAF ensures DOM has painted before triggering opacity/transform
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setRevealed(true)),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedCategory,
      selectedCondition,
      searchQuery,
      sortOption,
      minPrice,
      maxPrice,
      selectedBrands,
      selectedProcessors,
      selectedRam,
      selectedStorage,
    ],
  );

  // Reload when page or filters change
  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    setPage(1);
  }, [
    selectedCategory,
    selectedCondition,
    searchQuery,
    sortOption,
    minPrice,
    maxPrice,
    selectedBrands,
    selectedProcessors,
    selectedRam,
    selectedStorage,
  ]);

  // ── Animated page change ──
  const handlePageChange = (newPage: number) => {
    // Fade current cards out
    setRevealed(false);
    // After the fade-out (220ms) change page which triggers load()
    setTimeout(() => {
      setPage(newPage);
      // Scroll to top of grid smoothly
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 220);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      retailPrice: product.retailPrice,
      category: product.category,
      stock: product.stock,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      condition: product.condition,
      brand: product.brand,
      specs: product.specs,
    } as any);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-32 overflow-hidden bg-white">
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes skeletonWave {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg,
            #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
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
      <section className="relative flex items-center justify-center overflow-hidden h-auto py-2 px-2 md:h-80 md:py-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-100 rounded-full blur-[120px] opacity-60 pointer-events-none" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-50 pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/5 border border-indigo-600/10 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest anim-fade-in-up">
            <Sparkles className="w-3 h-3" /> Curated Technology
          </div>

          <h1
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter anim-fade-in-up"
            style={{ animationDelay: "0.08s" }}
          >
            Explore Our <span className="text-indigo-600">Products.</span>
          </h1>

          <p
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium anim-fade-in-up"
            style={{ animationDelay: "0.16s" }}
          >
            Discover new and certified refurbished laptops, desktops, PCs, and
            accessories curated for students, professionals, and businesses.
            Backed by Infofix warranty.
          </p>

          {/* Search */}
          <div
            className="max-w-2xl mx-auto relative group anim-fade-in-up"
            style={{ animationDelay: "0.24s" }}
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl flex items-center p-2 shadow-2xl shadow-gray-200/50 border border-gray-100">
              <Search className="w-5 h-5 text-gray-400  shrink-0" />
              <input
                type="text"
                placeholder="Find your next upgrade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 px-2 py-3 text-sm font-semibold text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mr-2 w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shrink-0">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 mt-4">
        {/* ── Filter Bar (sticky) ── */}
        <div
          ref={gridRef}
          className="sticky top-0 z-30 -mx-4 px-4 py-4 bg-white/96 backdrop-blur-sm border-b border-gray-100 mb-6"
        >
          <div className="flex flex-col gap-4 max-w-7xl mx-auto">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 w-full">
              {[
                "All",
                "Laptop",
                "Graphics Card",
                "Processor",
                "RAM",
                "Monitor",
                "Peripherals",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap shrink-0 touch-pan-x transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200"
                  }`}
                >
                  {cat === "All" ? "All Products" : cat}
                </button>
              ))}
            </div>

            {/* Result count + Filter button */}
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
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} idx={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {products.map((product, index) => (
                <ProductCard
                  key={`${product.id}-p${page}`}
                  product={product}
                  onAddToCart={handleAddToCart}
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
          /* Empty state */
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
                setSelectedCondition("All");
                setSortOption("latest");
                setMinPrice("");
                setMaxPrice("");
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
              {/* Sort */}
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
                onChange={(v) => setSelectedCategory(v)}
              />
              <FilterSection
                title="Condition"
                options={["New", "Refurbished"]}
                selected={
                  selectedCondition === "All" ? [] : [selectedCondition]
                }
                single
                onChange={(v) => setSelectedCondition(v)}
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
                title="Processor"
                options={[
                  "i3",
                  "i5",
                  "i7",
                  "i9",
                  "Ryzen 3",
                  "Ryzen 5",
                  "Ryzen 7",
                  "Ryzen 9",
                ]}
                selected={selectedProcessors}
                onChange={setSelectedProcessors}
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
        <section className="mt-24 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: "5000+", label: "Happy Customers" },
              { stat: "1 Year", label: "Warranty on Refurbished" },
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
