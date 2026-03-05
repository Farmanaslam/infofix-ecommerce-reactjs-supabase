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
    } catch {}
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

  return (
    <article
      className="group relative flex flex-col cursor-pointer"
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

        <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/14 transition-colors duration-400 pointer-events-none" />

        {/* Action buttons */}
        <div
          className="absolute top-5 right-5 flex flex-col gap-2 z-20
                        translate-x-14 group-hover:translate-x-0
                        transition-transform duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleLike}
            aria-label={liked ? "Liked" : "Like this product"}
            aria-pressed={liked}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-250
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            aria-label="Quick view"
            className="w-10 h-10 rounded-2xl flex items-center justify-center
                       bg-white/90 backdrop-blur-md border border-white/60 text-gray-500
                       hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200
                       shadow-lg transition-all duration-200 delay-60"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart (hover) */}
        {!isOut && (
          <div
            className="absolute inset-x-3 bottom-3 z-20
                  hidden md:block
                  translate-y-full group-hover:translate-y-0
                  transition-transform duration-400 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-gray-900 hover:bg-indigo-600 text-white
                 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]
                 flex items-center justify-center gap-2 shadow-2xl transition-colors duration-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>
        )}

        {/* Badges */}
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

        <h3 className="font-bold text-[18px] text-gray-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
          {product.name}
        </h3>

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

        {/* Price row */}
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

        {/* ── Mobile: Add to Cart + Buy Now both always visible ── */}
        {!isOut && (
          <div className="mt-3 flex flex-col gap-2">
            {/* Add to Cart — mobile only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="md:hidden w-full flex items-center justify-center gap-2
                 bg-gray-900 hover:bg-gray-800 active:scale-[0.98]
                 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]
                 shadow-md transition-all duration-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>

            {/* Buy Now — always visible */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuyNow(product);
              }}
              className="w-full flex items-center justify-center gap-2
                 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                 text-white py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.18em]
                 shadow-lg shadow-indigo-200/70 transition-all duration-200 group/btn"
            >
              Buy Now
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        )}
        {isOut && (
          <button
            disabled
            className="mt-3 w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.18em]
                       bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
