import React, { useState } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronLeft,
  Zap,
  Shield,
  Truck,
  RefreshCw,
  CheckCircle,
  Share2,
  Minus,
  Plus,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";
import { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  /** Called after "Buy Now" adds to cart; navigate to cart from parent */
  onNavigateToCart: () => void;
}

const StarRating: React.FC<{ rating: number; count: number }> = ({
  rating,
  count,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-colors ${
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : star - 0.5 <= rating
                  ? "text-amber-300 fill-amber-200"
                  : "text-gray-200 fill-gray-100"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-gray-800">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-gray-400 font-medium">
        ({count.toLocaleString()} reviews)
      </span>
    </div>
  );
};

const TrustBadge: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub: string;
}> = ({ icon, title, sub }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-xs font-black text-gray-900 uppercase tracking-wide">
        {title}
      </p>
      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{sub}</p>
    </div>
  </div>
);

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onNavigateToCart,
}) => {
  const { addToCart } = useStore();

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
      const s = localStorage.getItem(countKey);
      return s ? Number(s) : product.likesCount;
    } catch {
      return product.likesCount;
    }
  });
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Build a small gallery — if the product only has one image, repeat it with slight variation
  const galleryImages = [product.image, product.image, product.image];

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

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product as any);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product as any);
    onNavigateToCart();
  };

  const savings = product.retailPrice ? product.retailPrice - product.price : 0;
  const isLow = product.stock > 0 && product.stock < 10;
  const isOut = product.stock === 0;
  const maxQty = Math.min(product.stock, 10);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pd-fade { animation: fadeInUp 0.5s ease both; }
        @keyframes checkPop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-pop { animation: checkPop 0.35s ease both; }
      `}</style>

      <div className="min-h-screen bg-white pb-32">
        {/* ── Breadcrumb / Back ── */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors duration-200 group"
          >
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Store
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mt-4">
          {/* ── LEFT: Image Gallery ── */}
          <div className="pd-fade" style={{ animationDelay: "0ms" }}>
            {/* Main image */}
            <div className="relative aspect-square rounded-[36px] overflow-hidden bg-gray-50 shadow-[0_24px_80px_-16px_rgba(79,70,229,0.15)]">
              <img
                src={
                  imgError
                    ? "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"
                    : galleryImages[activeImg] || product.image
                }
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Condition badge */}
              <div className="absolute top-5 left-5 flex flex-col gap-1.5">
                {product.condition === "Refurbished" && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-sm">
                    ✓ Infofix Certified Refurbished
                  </span>
                )}
                {product.condition === "New" && (
                  <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                    Brand New
                  </span>
                )}
                {product.discountPercent >= 10 && (
                  <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Like button */}
              <button
                onClick={handleLike}
                aria-label={liked ? "Remove like" : "Like product"}
                className={`absolute top-5 right-5 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-200
                  ${
                    liked
                      ? "bg-red-500 border-red-400 text-white scale-110"
                      : "bg-white/90 border-white/60 text-gray-500 hover:bg-red-50 hover:text-red-500"
                  }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </button>

              {/* Share */}
              <button
                onClick={() =>
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
                className="absolute bottom-5 right-5 w-11 h-11 rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/60 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 shadow-lg transition-all duration-200"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-3 mt-4">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-200 shrink-0
                    ${
                      activeImg === i
                        ? "border-indigo-600 shadow-lg shadow-indigo-200/50 scale-105"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <div className="pd-fade" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">
                  {product.category}
                </span>
                {product.subcategory && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {product.subcategory}
                    </span>
                  </>
                )}
                {product.brand && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-lg">
                      {product.brand}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <h1
              className="font-black text-[2rem] md:text-[2.5rem] text-gray-900 leading-[1.1] tracking-tight pd-fade"
              style={{ animationDelay: "100ms" }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div
              className="pd-fade flex items-center gap-4 flex-wrap"
              style={{ animationDelay: "140ms" }}
            >
              <StarRating rating={product.rating} count={product.reviews} />
              {likes > 0 && (
                <div
                  className={`flex items-center gap-1.5 text-sm font-semibold ${liked ? "text-red-400" : "text-gray-400"}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} />
                  {likes}{" "}
                  {likes === 1 ? "person likes this" : "people like this"}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="pd-fade" style={{ animationDelay: "180ms" }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-black text-[2.2rem] text-gray-900 tracking-tighter leading-none">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.retailPrice && product.retailPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through font-medium">
                    ₹{product.retailPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    You save ₹{savings.toLocaleString("en-IN")} (
                    {product.discountPercent}% off)
                  </span>
                </div>
              )}
              {isLow && (
                <div className="flex items-center gap-1.5 mt-2 text-orange-500 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  Only {product.stock} left in stock — order soon!
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p
                className="text-gray-600 text-[15px] leading-relaxed font-medium pd-fade border-t border-gray-100 pt-6"
                style={{ animationDelay: "220ms" }}
              >
                {product.description}
              </p>
            )}

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="pd-fade" style={{ animationDelay: "260ms" }}>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">
                  Key Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-xs font-semibold text-gray-700">
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-1.5 pd-fade"
                style={{ animationDelay: "290ms" }}
              >
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full font-black uppercase tracking-wide"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity selector */}
            {!isOut && (
              <div
                className="pd-fade flex items-center gap-5"
                style={{ animationDelay: "310ms" }}
              >
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Qty
                </span>
                <div className="flex items-center gap-0 bg-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-black text-gray-900 text-sm">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {product.stock < 20 && (
                  <span className="text-[11px] text-gray-400 font-semibold">
                    {product.stock} in stock
                  </span>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div
              className="pd-fade flex flex-col sm:flex-row gap-3"
              style={{ animationDelay: "340ms" }}
            >
              {isOut ? (
                <button
                  disabled
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-400 font-black text-sm uppercase tracking-widest cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : (
                <>
                  {/* Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2
                               bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]
                               text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em]
                               shadow-xl shadow-indigo-200/80 transition-all duration-200 group/btn"
                  >
                    Buy Now
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </button>

                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2
                                 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.15em]
                                 border-2 transition-all duration-300 active:scale-[0.98]
                                 ${
                                   addedToCart
                                     ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                                     : "bg-white border-gray-200 text-gray-900 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                 }`}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle className="w-4 h-4 check-pop" />
                        Added!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div
              className="grid grid-cols-2 gap-3 pt-2 pd-fade border-t border-gray-100"
              style={{ animationDelay: "380ms" }}
            >
              <TrustBadge
                icon={<Shield className="w-4 h-4" />}
                title={
                  product.condition === "Refurbished"
                    ? "1-Year Warranty"
                    : "Manufacturer Warranty"
                }
                sub="Infofix backed guarantee"
              />
              <TrustBadge
                icon={<Truck className="w-4 h-4" />}
                title="Fast Shipping"
                sub="PAN India delivery"
              />
              <TrustBadge
                icon={<RefreshCw className="w-4 h-4" />}
                title="Easy Returns"
                sub="7-day return policy"
              />
              <TrustBadge
                icon={<Package className="w-4 h-4" />}
                title="Secure Payments"
                sub="All major methods accepted"
              />
            </div>
          </div>
        </div>

        {/* ── Reviews Section (placeholder) ── */}
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-12 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-700 text-lg">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-amber-600 text-sm font-semibold">/ 5</span>
            </div>
          </div>

          {/* Rating breakdown bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                // Approximate distribution based on avg rating
                const weight =
                  star === Math.round(product.rating)
                    ? 55
                    : star === Math.round(product.rating) - 1
                      ? 25
                      : star === Math.round(product.rating) + 1
                        ? 12
                        : 5;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-xs font-bold text-gray-600">
                        {star}
                      </span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${weight}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-semibold w-8 shrink-0">
                      {weight}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sample review cards */}
            <div className="space-y-4">
              {[
                {
                  name: "Rahul M.",
                  stars: 5,
                  text: "Excellent condition, exactly as described. Fast delivery too!",
                  date: "2 weeks ago",
                },
                {
                  name: "Priya S.",
                  stars: 4,
                  text: "Great value for money. Works perfectly for my daily use.",
                  date: "1 month ago",
                },
              ].map((review, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                        {review.name[0]}
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        {review.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {review.date}
                    </span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= review.stars ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
