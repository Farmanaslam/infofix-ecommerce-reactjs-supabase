import React, { useState } from "react";
import {
  Star,
  Heart,
  Eye,
  ShoppingBag,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Product as ProductType } from "../types";
import { supabase } from "@/lib/supabaseClient";

interface ProductProps {
  product: ProductType;
  onAddToCart: (p: ProductType) => void;
  onBuyNow: (p: ProductType) => void;
  onViewDetails: (p: ProductType) => void;
  cardIdx?: number;
  revealed?: boolean;
}

const PER_PAGE = 12;

export const ProductCard: React.FC<ProductProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onViewDetails,
  cardIdx = 0,
  revealed = true,
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
      nowLiked
        ? localStorage.setItem(storageKey, "1")
        : localStorage.removeItem(storageKey);
      localStorage.setItem(countKey, String(newCount));
    } catch { }
    if (supabase) {
      await supabase.rpc(nowLiked ? "increment_likes" : "decrement_likes", {
        product_id: Number(product.id),
      });
    }
  };

  const savings = product.retailPrice ? product.retailPrice - product.price : 0;
  const isLow = product.stock > 0 && product.stock < 10;
  const isOut = product.stock === 0;
  const delay = (cardIdx % PER_PAGE) * 55;

  const specEntries: { key: string; value: string }[] = (() => {
    if (!product.specs) return [];
    if (Array.isArray(product.specs)) {
      return (product.specs as string[]).map((s) => {
        const idx = s.indexOf(":");
        return idx > -1
          ? { key: s.slice(0, idx).trim(), value: s.slice(idx + 1).trim() }
          : { key: s, value: "" };
      });
    }
    return Object.entries(product.specs as Record<string, string>).map(
      ([key, value]) => ({ key, value: String(value) }),
    );
  })();

  return (
    <article
      className="group relative flex flex-col cursor-pointer h-full"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed
          ? "translateY(0) scale(1)"
          : "translateY(22px) scale(0.98)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
      onClick={() => onViewDetails(product)}
    >
      {/* ── Image ── */}
      <div
        className="relative aspect-square md:aspect-4/5 rounded-2xl md:rounded-[28px] overflow-hidden bg-gray-50 mb-3 md:mb-6
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

        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/14 transition-colors duration-400 pointer-events-none" />

        {/* ── Action buttons ── */}
        <div
          className="absolute top-3 right-3 md:top-5 md:right-5 flex flex-col gap-1.5 md:gap-2 z-20
                        translate-x-14 group-hover:translate-x-0
                        transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleLike}
            aria-label={liked ? "Liked" : "Like this product"}
            aria-pressed={liked}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-250
              ${liked
                ? "bg-red-500 border-red-400 text-white scale-110 shadow-red-200/60"
                : "bg-white/90 border-white/60 text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
              }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all duration-200 ${liked ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            aria-label="Quick view"
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center
                       bg-white/90 backdrop-blur-md border border-white/60 text-gray-500
                       hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200
                       shadow-lg transition-all duration-200 delay-60"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Hover Add to Cart (desktop only) ── */}
        {!isOut && (
          <div
            className="absolute inset-x-3 bottom-3 z-20 hidden md:block
                        translate-y-full group-hover:translate-y-0
                        transition-transform duration-400 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-gray-900 hover:bg-indigo-600 text-white
                         py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.18em]
                         flex items-center justify-center gap-2 shadow-2xl transition-colors duration-200"
            >
              <ShoppingBag className="w-3 h-3" />
              Add to Cart
            </button>
          </div>
        )}

        {/* ── ALL Badges — shown on BOTH mobile and desktop, top-left ── */}

        <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 flex flex-col gap-0.75 md:gap-1 z-10 pointer-events-none">
          {product.tags &&
            product.tags.length > 0 &&
            product.tags.slice(0, 3).map((tag, i) => {
              const tagColors: Record<string, string> = {
                Gaming: "bg-purple-600/95",
                Budget: "bg-green-600/95",
                Professional: "bg-blue-700/95",
                "Best Seller": "bg-amber-500/95",
                "New Arrival": "bg-indigo-600/95",
                Sale: "bg-red-600/95",
                Certified: "bg-emerald-600/95",
                Refurbished: "bg-teal-600/95",
              };
              const color = tagColors[tag] ?? "bg-gray-700/95";
              return (
                <span
                  key={i}
                  className={`${color} backdrop-blur-sm text-white 
                      text-[3px] md:text-[5px] 
                      font-black uppercase tracking-[0.12em] 
                     px-1 md:px-1.5 py-0.5 md:py-0.75 
                       rounded-sm md:rounded 
                     shadow-sm leading-none`}
                >
                  {tag}
                </span>
              );
            })}

          {isOut && (
            <span className="bg-gray-700/95 backdrop-blur-sm text-white text-[3px] md:text-[5px] font-black uppercase tracking-wide px-1.5 md:px-2 py-0.5 md:py-0.75 rounded-sm md:rounded-md leading-none">
              Out of Stock
            </span>
          )}
          {isLow && !isOut && (
            <span className="bg-orange-500/95 backdrop-blur-sm text-white text-[3px] md:text-[5px] font-black uppercase tracking-wide px-1.5 md:px-2 py-0.5 md:py-0.75 rounded-sm md:rounded-md shadow-sm flex items-center gap-0.5 leading-none">
              <Zap className="w-2 h-2" />
              {product.stock} left
            </span>
          )}
          {product.discountPercent >= 10 && (
            <span className="bg-red-500/95 backdrop-blur-sm text-white text-[3px] md:text-[5px] font-black uppercase tracking-wide px-1.5 md:px-2 py-0.5 md:py-0.75 rounded-sm md:rounded-md shadow-sm leading-none">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 gap-1 md:gap-1.5 px-1 md:px-2 transition-transform duration-500 group-hover:translate-x-0.5">
        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] md:text-[10px] text-indigo-600 font-black uppercase tracking-[0.15em] truncate max-w-[60%]">
            {product.category}
            {product.subcategory && (
              <span className="text-gray-400 font-medium normal-case ml-1 tracking-normal hidden md:inline">
                · {product.subcategory}
              </span>
            )}
          </span>
          <div className="flex items-center gap-0.5 md:gap-1 bg-amber-50 border border-amber-100 px-1.5 md:px-2 py-0.5 rounded-lg shrink-0">
            <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500 fill-amber-500" />
            <span className="text-[9px] md:text-[10px] font-bold text-amber-700">
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-[13px] md:text-[18px] text-gray-900 leading-snug line-clamp-2 md:min-h-12 group-hover:text-indigo-600 transition-colors duration-200">
          {product.name}
        </h3>

        {/* Model + Brand — desktop only */}
        {(product.model || product.brand) && (
          <div className="hidden md:flex items-center gap-1.5 flex-wrap">
            {product.model && (
              <span className="text-[11px] font-semibold text-gray-500 leading-none">
                {product.model}
              </span>
            )}
            {product.model && product.brand && (
              <span className="text-gray-300 text-[10px]">·</span>
            )}
            {product.brand && (
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                {product.brand}
              </span>
            )}
          </div>
        )}

        {/* Brand — mobile only, compact */}
        {product.brand && (
          <span className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">
            {product.brand}
          </span>
        )}

        <div className="flex-1" />

        {/* Price */}
        <div className="flex items-end justify-between mt-1">
          <div>
            <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
              <span className="font-black text-[16px] md:text-[22px] text-gray-900 tracking-tight leading-none">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.retailPrice && product.retailPrice > product.price && (
                <span className="text-[11px] md:text-sm text-gray-400 line-through font-medium">
                  ₹{product.retailPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[9px] md:text-[10px] text-emerald-600 font-bold mt-0.5 block">
                Save ₹{savings.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="hidden md:block text-right">
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

        {/* ── CTA Buttons ── */}
        {!isOut && (
          <div className="mt-2 md:mt-3 flex flex-col gap-1.5 md:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="md:hidden w-full flex items-center justify-center gap-1.5
                         bg-gray-900 hover:bg-gray-800 active:scale-[0.98]
                         text-white py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.18em]
                         shadow-sm transition-all duration-200"
            >
              <ShoppingBag className="w-3 h-3" />
              Add to Cart
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="w-full flex items-center justify-center gap-1.5 md:gap-2
                         bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                         text-white py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black
                         text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.18em]
                         shadow-lg shadow-indigo-200/70 transition-all duration-200 group/btn"
            >
              Buy Now
              <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        )}
        {isOut && (
          <button
            disabled
            className="mt-2 md:mt-3 w-full py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black
                       text-[9px] md:text-[11px] uppercase tracking-[0.15em] bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
