import React, { useState, useRef } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Truck,
  RefreshCw,
  CheckCircle,
  Share2,
  Minus,
  Plus,
  ArrowRight,
  Package,
  Check,
  X,
  Send,
  ThumbsUp,
  BadgeCheck,
  Cpu,
} from "lucide-react";
import { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onNavigateToCart: () => void;
}

interface Review {
  id: string;
  name: string;
  stars: number;
  title: string;
  text: string;
  date: string;
  verified: boolean;
  helpful: number;
}

// ─── Spec normaliser ──────────────────────────────────────────────────────────
// product.specs can arrive as:
//   • string[]            → ["Processor: Intel i7", "RAM: 16GB"]
//   • Record<string,string> → { Processor: "Intel i7", RAM: "16GB" }
//   • undefined / null
function normaliseSpecs(
  specs: string[] | Record<string, string> | undefined | null,
): { key: string; value: string }[] {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs.map((s) => {
      const idx = s.indexOf(":");
      return idx > -1
        ? { key: s.slice(0, idx).trim(), value: s.slice(idx + 1).trim() }
        : { key: s, value: "" };
    });
  }
  return Object.entries(specs).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

// Cart Toast
const CartToast: React.FC<{
  product: Product;
  qty: number;
  visible: boolean;
  onGoToCart: () => void;
  onDismiss: () => void;
}> = ({ product, qty, visible, onGoToCart, onDismiss }) => (
  <>
    <style>{`
      @keyframes toastUp   { from{transform:translate(-50%,100px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
      @keyframes toastDown { from{transform:translate(-50%,0);opacity:1} to{transform:translate(-50%,100px);opacity:0} }
      @keyframes progressBar { from{width:100%} to{width:0%} }
      @keyframes checkBounce { 0%{transform:scale(0) rotate(-10deg)} 60%{transform:scale(1.25) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
    `}</style>
    <div
      style={{
        animation: visible
          ? "toastUp 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "toastDown 0.35s ease forwards",
        position: "fixed",
        bottom: "24px",
        left: "50%",
        zIndex: 9999,
        width: "calc(100vw - 2rem)",
        maxWidth: "440px",
      }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gray-950 shadow-2xl border border-white/10">
        <div
          className="absolute bottom-0 left-0 h-0.75 rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500"
          style={{
            animation: visible ? "progressBar 2.8s linear forwards" : "none",
          }}
        />
        <div className="flex items-center gap-4 p-4">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
              style={{
                animation: visible
                  ? "checkBounce 0.5s 0.15s ease both"
                  : "none",
              }}
            >
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400 mb-0.5">
              {qty > 1 ? `${qty} items` : "1 item"} added to cart
            </p>
            <p className="text-sm font-bold text-white truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-400 font-semibold">
              {"\u20B9"}
              {(product.price * qty).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onGoToCart}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors"
            >
              View Cart <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onDismiss}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 text-gray-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);

// Star Picker
const StarPicker: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-8 h-8 transition-colors ${s <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100"}`}
          />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className="ml-2 text-sm font-bold text-gray-600">
          {["", "Poor", "Fair", "Good", "Great", "Excellent"][hover || value]}
        </span>
      )}
    </div>
  );
};

// Review Card
const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const [helpful, setHelpful] = useState(review.helpful);
  const [marked, setMarked] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200/60">
            {review.name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-900">
                {review.name}
              </span>
              {review.verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">
              {review.date}
            </span>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= review.stars ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100"}`}
            />
          ))}
        </div>
      </div>
      {review.title && (
        <p className="font-black text-gray-900 text-sm mb-1.5">
          "{review.title}"
        </p>
      )}
      <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
        <button
          onClick={() => {
            if (!marked) {
              setHelpful((h) => h + 1);
              setMarked(true);
            }
          }}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${marked ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "text-gray-400 hover:text-indigo-500 hover:bg-gray-50"}`}
        >
          <ThumbsUp className={`w-3 h-3 ${marked ? "fill-indigo-500" : ""}`} />
          Helpful {helpful > 0 && `(${helpful})`}
        </button>
      </div>
    </div>
  );
};

// Add Review Form
const AddReviewForm: React.FC<{
  productId: string;
  onSubmit: (r: Review) => void;
}> = ({ productId, onSubmit }) => {
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (stars === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (text.trim().length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    setError("");
    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      stars,
      title: title.trim(),
      text: text.trim(),
      date: "Just now",
      verified: false,
      helpful: 0,
    };
    try {
      const key = `reviews_${productId}`;
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]");
      localStorage.setItem(key, JSON.stringify([newReview, ...existing]));
    } catch {}
    onSubmit(newReview);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 bg-emerald-50 rounded-3xl border border-emerald-100">
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
          <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <p className="font-black text-gray-900 text-lg">
          Thanks for your review!
        </p>
        <p className="text-sm text-gray-500">
          Your feedback helps other customers make better choices.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
      <h4 className="font-black text-gray-900 text-base mb-5">
        Write a Review
      </h4>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul M."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
            Your Rating
          </label>
          <StarPicker value={stars} onChange={setStars} />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
            Review Title <span className="text-gray-300">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum it up in a few words"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">
            Your Review
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you like or dislike? How is the quality and performance?"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1 font-semibold text-right">
            {text.length} chars
          </p>
        </div>
        {error && (
          <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" /> Submit Review
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Main ProductDetails
// ═════════════════════════════════════════════════════════════════════════════
export const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onNavigateToCart,
}) => {
  const { addToCart, currentUser } = useStore();
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
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "ok" | "fail"
  >("idle");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [reviews, setReviews] = useState<Review[]>(() => {
    const seed: Review[] = [
      {
        id: "s1",
        name: "Rahul M.",
        stars: 5,
        title: "Absolutely worth it!",
        text: "Excellent condition, exactly as described. Delivery was fast and packaging was great. Would highly recommend to anyone looking for quality at this price point.",
        date: "2 weeks ago",
        verified: true,
        helpful: 14,
      },
      {
        id: "s2",
        name: "Priya S.",
        stars: 4,
        title: "Great value for money",
        text: "Works perfectly for my daily use. Minor cosmetic marks but performance is flawless. Infofix warranty gives real peace of mind.",
        date: "1 month ago",
        verified: true,
        helpful: 8,
      },
    ];
    try {
      const stored = JSON.parse(
        localStorage.getItem(`reviews_${product.id}`) ?? "[]",
      );
      return [...stored, ...seed];
    } catch {
      return seed;
    }
  });

  // ── Derived ──
  const galleryImages: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  const specEntries = normaliseSpecs(product.specs as any);
  const savings = product.retailPrice ? product.retailPrice - product.price : 0;
  const isLow = product.stock > 0 && product.stock < 10;
  const isOut = product.stock === 0;
  const maxQty = Math.min(product.stock, 10);
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length
    : product.rating;
  const ratingDist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.stars === s).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.stars === s).length / reviews.length) * 100,
        )
      : 0,
  }));

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product as any);
  };
  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product as any);
    onNavigateToCart();
  };
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
    if (supabase)
      await supabase.rpc(nowLiked ? "increment_likes" : "decrement_likes", {
        product_id: Number(product.id),
      });
  };
  const checkPincode = () => {
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setPincodeStatus("fail");
      setDeliveryDate("");
      return;
    }
    setPincodeStatus("checking");
    setTimeout(() => {
      const deliverable = trimmed[0] !== "0";
      if (deliverable) {
        const d1 = new Date();
        d1.setDate(d1.getDate() + 5);
        const d2 = new Date();
        d2.setDate(d2.getDate() + 7);
        setDeliveryDate(
          `${d1.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d2.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        );
        setPincodeStatus("ok");
      } else {
        setPincodeStatus("fail");
        setDeliveryDate("");
      }
    }, 900);
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .pd-fade { animation: fadeInUp 0.5s ease both; }
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes imgFade { from{opacity:0;transform:scale(1.02)} to{opacity:1;transform:scale(1)} }
      `}</style>

      <div className="min-h-screen bg-white pb-32">
        <div className="app-container pt-6 pb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Back to Store
          </button>
        </div>

        <div className="app-container mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
            {/* ── LEFT: Gallery ── */}
            <div className="pd-fade" style={{ animationDelay: "0ms" }}>
              <div
                className="relative aspect-square rounded-[36px] overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 shadow-[0_24px_60px_-10px_rgba(99,102,241,0.2)]"
                onTouchStart={(e) => {
                  (e.currentTarget as any)._touchStartX = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  const diff =
                    ((e.currentTarget as any)._touchStartX ?? 0) -
                    e.changedTouches[0].clientX;
                  if (Math.abs(diff) > 40) {
                    if (diff > 0)
                      setActiveImg((i) =>
                        Math.min(i + 1, galleryImages.length - 1),
                      );
                    else setActiveImg((i) => Math.max(i - 1, 0));
                  }
                }}
              >
                <img
                  key={activeImg}
                  src={
                    imgError
                      ? "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"
                      : galleryImages[activeImg] || product.image
                  }
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                  style={{ animation: "imgFade 0.35s ease both" }}
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/25 to-transparent pointer-events-none" />

                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => Math.max(i - 1, 0))}
                      disabled={activeImg === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl disabled:opacity-0 hover:bg-white hover:scale-105 transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImg((i) =>
                          Math.min(i + 1, galleryImages.length - 1),
                        )
                      }
                      disabled={activeImg === galleryImages.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl disabled:opacity-0 hover:bg-white hover:scale-105 transition-all duration-200"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>
                  </>
                )}

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`rounded-full transition-all duration-300 ${i === activeImg ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                      />
                    ))}
                  </div>
                )}

                <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
                  {product.condition === "Refurbished" && (
                    <span className="bg-emerald-600/95 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                      ✓ Infofix Certified
                    </span>
                  )}
                  {product.condition === "New" && (
                    <span className="bg-blue-600/95 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                      Brand New
                    </span>
                  )}
                  {product.discountPercent >= 10 && (
                    <span className="bg-red-500/95 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLike}
                  className={`absolute top-5 right-20 z-10 w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md border shadow-lg transition-all duration-200 ${liked ? "bg-red-500 border-red-400 text-white scale-110" : "bg-white/90 border-white/60 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() =>
                    navigator.share?.({
                      title: product.name,
                      url: window.location.href,
                    })
                  }
                  className="absolute top-5 right-5 z-10 w-11 h-11 rounded-2xl flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/60 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 shadow-lg transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {galleryImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-1 px-0.5">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative shrink-0 w-18 h-18 rounded-2xl overflow-hidden transition-all duration-200
                        ${activeImg === i ? "ring-[2.5px] ring-offset-2 ring-indigo-600 scale-[1.07] shadow-lg shadow-indigo-200/60" : "ring-1 ring-gray-200 opacity-60 hover:opacity-100 hover:ring-gray-300 hover:scale-[1.03]"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {activeImg === i && (
                        <div className="absolute inset-0 bg-indigo-600/8 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {galleryImages.length > 1 && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2.5">
                  {activeImg + 1} / {galleryImages.length}
                </p>
              )}
            </div>

            {/* ── RIGHT: Info ── */}
            <div className="flex flex-col gap-5">
              {/* Breadcrumb + brand */}
              <div
                className="pd-fade flex items-center gap-2 flex-wrap"
                style={{ animationDelay: "60ms" }}
              >
                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">
                  {product.category}
                </span>
                {product.subcategory && (
                  <>
                    <span className="text-gray-300">›</span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {product.subcategory}
                    </span>
                  </>
                )}
                {product.brand && (
                  <span className="ml-auto text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-xl">
                    {product.brand}
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1
                className="font-black text-[1.85rem] md:text-[2.3rem] text-gray-900 leading-[1.08] tracking-tight pd-fade"
                style={{ animationDelay: "80ms" }}
              >
                {product.name}
              </h1>

              {/* ── Model number row ── */}
              {(product.model || product.brand) && (
                <div
                  className="pd-fade flex items-center gap-2 flex-wrap -mt-2"
                  style={{ animationDelay: "90ms" }}
                >
                  {product.model && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                      <Cpu className="w-3 h-3 text-gray-400" />
                      Model:{" "}
                      <span className="font-bold text-gray-700">
                        {product.model}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Rating + likes */}
              <div
                className="pd-fade flex items-center gap-4 flex-wrap"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({reviews.length} reviews)
                  </span>
                </div>
                {likes > 0 && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold ${liked ? "text-red-400" : "text-gray-400"}`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${liked ? "fill-red-400" : ""}`}
                    />{" "}
                    {likes} {likes === 1 ? "like" : "likes"}
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              {/* Price */}
              <div className="pd-fade" style={{ animationDelay: "130ms" }}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-black text-[2.4rem] text-gray-900 tracking-tighter leading-none">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  {product.retailPrice &&
                    product.retailPrice > product.price && (
                      <span className="text-xl text-gray-400 line-through font-medium">
                        ₹{product.retailPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                </div>
                {savings > 0 && (
                  <span className="inline-flex mt-2 text-sm text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                    You save ₹{savings.toLocaleString("en-IN")} (
                    {product.discountPercent}% off)
                  </span>
                )}
                {isLow && (
                  <div className="flex items-center gap-1.5 mt-2 text-orange-500 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5" /> Only {product.stock} left —
                    order soon!
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p
                  className="text-gray-600 text-[14.5px] leading-relaxed pd-fade"
                  style={{ animationDelay: "160ms" }}
                >
                  {product.description}
                </p>
              )}

              {/* ── Key Specifications — full key:value table ── */}
              {specEntries.length > 0 && (
                <div className="pd-fade" style={{ animationDelay: "190ms" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                    Key Specifications
                  </p>
                  <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/60">
                    {specEntries.map((spec, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-indigo-50/40 transition-colors
                          ${i !== specEntries.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        {/* Key */}
                        <span className="w-36 shrink-0 text-[11px] font-black text-gray-400 uppercase tracking-wide leading-snug pt-0.5">
                          {spec.key || "—"}
                        </span>
                        {/* Divider */}
                        <span className="text-gray-200 shrink-0 mt-0.5">·</span>
                        {/* Value */}
                        <span className="flex-1 text-[13px] font-semibold text-gray-800 leading-snug">
                          {spec.value || spec.key}
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
                  style={{ animationDelay: "210ms" }}
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

              {/* Qty + CTA */}
              {!isOut ? (
                <div
                  className="pd-fade space-y-3"
                  style={{ animationDelay: "230ms" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Qty
                    </span>
                    <div className="flex items-center bg-gray-100 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center font-black text-gray-900 text-sm">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors"
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
                  <div className="flex gap-3">
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.12em] shadow-xl shadow-indigo-200/80 transition-all duration-200 group/b"
                    >
                      Buy Now{" "}
                      <ArrowRight className="w-4 h-4 group-hover/b:translate-x-0.5 transition-transform" />
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.12em] border-2 border-gray-200 text-gray-900 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98] transition-all duration-200"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-black text-sm uppercase tracking-widest cursor-not-allowed pd-fade"
                  style={{ animationDelay: "230ms" }}
                >
                  Out of Stock
                </button>
              )}

              {/* Delivery */}
              {!isOut && (
                <div
                  className="pd-fade space-y-2"
                  style={{ animationDelay: "250ms" }}
                >
                  {currentUser ? (
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                      <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                          Free Delivery · Est.{" "}
                          {(() => {
                            const d1 = new Date();
                            d1.setDate(d1.getDate() + 5);
                            const d2 = new Date();
                            d2.setDate(d2.getDate() + 7);
                            return `${d1.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${d2.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
                          })()}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          Order today for fastest delivery
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                          Check Delivery
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-2.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => {
                              setPincode(e.target.value.replace(/\D/g, ""));
                              setPincodeStatus("idle");
                            }}
                            onKeyDown={(e) =>
                              e.key === "Enter" && checkPincode()
                            }
                            placeholder="Enter 6-digit pincode"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <button
                            onClick={checkPincode}
                            disabled={pincodeStatus === "checking"}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-black uppercase tracking-widest transition-colors"
                          >
                            {pincodeStatus === "checking" ? (
                              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              "Check"
                            )}
                          </button>
                        </div>
                        {pincodeStatus === "ok" && (
                          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-black text-emerald-700">
                                Delivery available!
                              </p>
                              <p className="text-[11px] text-emerald-600 font-semibold">
                                Free delivery by {deliveryDate}
                              </p>
                            </div>
                          </div>
                        )}
                        {pincodeStatus === "fail" && (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs font-bold text-red-600">
                              {pincode.length !== 6
                                ? "Please enter a valid 6-digit pincode."
                                : "Sorry, we don't deliver to this pincode yet."}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trust badges */}
              <div
                className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gray-100 pd-fade"
                style={{ animationDelay: "270ms" }}
              >
                {[
                  {
                    icon: <Shield className="w-3.5 h-3.5" />,
                    label:
                      product.condition === "Refurbished"
                        ? "1-Yr Warranty"
                        : "Mfr Warranty",
                  },
                  {
                    icon: <Truck className="w-3.5 h-3.5" />,
                    label: "PAN India Shipping",
                  },
                  {
                    icon: <RefreshCw className="w-3.5 h-3.5" />,
                    label: "7-Day Returns",
                  },
                  {
                    icon: <Package className="w-3.5 h-3.5" />,
                    label: "Secure Payments",
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-2xl px-3.5 py-3"
                  >
                    <span className="text-indigo-500 shrink-0">{b.icon}</span>
                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-wide leading-tight">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Reviews Section ── */}
          <div className="mt-20 pt-12 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Customer Reviews
                </h2>
                <p className="text-sm text-gray-400 font-semibold mt-0.5">
                  {reviews.length} verified reviews
                </p>
              </div>
              <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 px-5 py-3 rounded-2xl">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-black text-amber-700 text-xl">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-amber-500 text-sm font-semibold">
                  / 5
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
              <div className="space-y-3">
                {ratingDist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <span className="text-xs font-bold text-gray-600">
                        {star}
                      </span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-bold w-8 text-right">
                      {count || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {reviews.slice(0, 6).map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
                {reviews.length === 0 && (
                  <div className="py-16 text-center text-gray-400">
                    <Star className="w-10 h-10 mx-auto mb-3 text-gray-200 fill-gray-100" />
                    <p className="font-bold">No reviews yet — be the first!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 max-w-2xl">
              <h3 className="text-xl font-black text-gray-900 mb-5 tracking-tight">
                Have this product? Leave a Review
              </h3>
              <AddReviewForm
                productId={product.id}
                onSubmit={(r) => setReviews((prev) => [r, ...prev])}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
