

import React, { useState, useEffect, useRef } from "react";
import { Tag, Zap, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useStore } from "../context/StoreContext";

interface DealItem {
    couponCode: string;
    discountAmount: number;
    productId: number;
    productName: string;
    productImage: string | null;
    model: string | null;
    brand: string | null;
}

interface Props {
    /** Called when user clicks a deal pill — navigate to product */
    onProductClick: (productId: string) => void;
    storeSection: string;
    accent?: string;
}

export const CouponDealsStrip: React.FC<Props> = ({ onProductClick, storeSection = 'Infofix', accent = '#6366f1' }) => {
    const [deals, setDeals] = useState<DealItem[]>([]);
    const [dismissed, setDismissed] = useState(false);
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    useEffect(() => {
        const fetchDeals = async () => {
            // Fetch active product-specific coupons
            const { data: coupons } = await supabase
                .from("coupons")
                .select("code, discount_amount, product_ids, expires_at")
                .eq("is_active", true)
                .not("product_ids", "is", null);

            if (!coupons || coupons.length === 0) return;

            // Collect all unique product IDs
            const now = new Date();
            const validCoupons = coupons.filter(
                (c: any) =>
                    !c.expires_at || new Date(c.expires_at) > now
            );

            if (validCoupons.length === 0) return;

            const allProductIds: number[] = [];
            validCoupons.forEach((c: any) => {
                if (Array.isArray(c.product_ids)) {
                    c.product_ids.forEach((id: any) => {
                        const numId = Number(id);
                        if (!allProductIds.includes(numId)) allProductIds.push(numId);
                    });
                }
            });

            if (allProductIds.length === 0) return;

            // Fetch product details
            const { data: productRows } = await supabase
                .from("products")
                .select("id, name, image_url, model, brand")
                .in("id", allProductIds)
                .eq("is_active", true)
                .eq("store_section", storeSection);

            if (!productRows) return;

            const productMap = new Map<number, any>(productRows.map((p: any) => [p.id, p]));

            // Build deal items
            const items: DealItem[] = [];
            validCoupons.forEach((c: any) => {
                if (!Array.isArray(c.product_ids)) return;
                c.product_ids.forEach((pid: number) => {
                    const product = productMap.get(pid);
                    if (!product) return;
                    items.push({
                        couponCode: c.code,
                        discountAmount: c.discount_amount,
                        productId: pid,
                        productName: product.name,
                        productImage: product.image_url,
                        model: product.model,
                        brand: product.brand,
                    });
                });
            });

            setDeals(items);
        };

        fetchDeals();
    }, [storeSection]);

    if (deals.length === 0 || dismissed) return null;
    if (isMobile) {
        return (
            <MobileDealsCarousel
                deals={deals}
                onProductClick={onProductClick}
                onDismiss={() => setDismissed(true)}
                accent={accent}
            />
        );
    }
    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    };

    return (
        <div className="w-full relative overflow-hidden" style={{ background: `linear-gradient(to right, ${accent}ee, ${accent}cc, ${accent}ee)` }}>
            {/* Animated background shimmer */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(90deg, transparent, transparent 200px, rgba(255,255,255,0.05) 200px, rgba(255,255,255,0.05) 201px)",
                }}
            />

            <div className="relative flex items-center gap-2 px-4 py-2">
                {/* Label */}
                <div className="flex items-center gap-1.5 shrink-0 text-white/90">
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] whitespace-nowrap">
                        Exclusive Deals
                    </span>
                    <span className="w-px h-3 bg-white/30 mx-1" />
                </div>

                {/* Left scroll button */}
                <button
                    onClick={() => scroll("left")}
                    className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Scrollable pills */}
                <div
                    ref={scrollRef}
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1"
                    style={{ scrollbarWidth: "none" }}
                >
                    {deals.map((deal, idx) => (
                        <div
                            key={`${deal.couponCode}-${deal.productId}`}
                            className="relative shrink-0"
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        >
                            {/* Pill button */}
                            <button
                                onClick={() => onProductClick(String(deal.productId))}
                                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 rounded-full px-3 py-1.5 transition-all duration-150 group"
                            >
                                {deal.productImage && (
                                    <img
                                        src={deal.productImage}
                                        alt=""
                                        className="w-5 h-5 rounded-full object-cover border border-white/30 shrink-0"
                                    />
                                )}
                                <Tag className="w-3 h-3 text-amber-300 shrink-0" />
                                <span className="text-[11px] font-black text-white tracking-wide whitespace-nowrap">
                                    {deal.couponCode}
                                </span>
                                <span className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
                                    Save ₹{deal.discountAmount}
                                </span>
                            </button>

                            {/* Tooltip on hover */}
                            {hoveredIdx === idx && (
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-56 bg-gray-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                                    style={{
                                        animation: "tooltipIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
                                    }}
                                >
                                    <style>{`
                    @keyframes tooltipIn {
                      from { opacity:0; transform: translate(-50%, 6px); }
                      to   { opacity:1; transform: translate(-50%, 0); }
                    }
                  `}</style>
                                    {/* Triangle */}
                                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-950 border-l border-t border-white/10 rotate-45" />

                                    {deal.productImage && (
                                        <img
                                            src={deal.productImage}
                                            alt={deal.productName}
                                            className="w-full h-24 object-cover"
                                        />
                                    )}
                                    <div className="p-3">
                                        <p className="text-xs font-bold text-white leading-snug line-clamp-2 mb-1">
                                            {deal.productName}
                                        </p>
                                        {(deal.model || deal.brand) && (
                                            <p className="text-[10px] text-gray-400 mb-2">
                                                {[deal.brand, deal.model].filter(Boolean).join(" · ")}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/50 rounded-lg px-3 py-1.5 mb-2">
                                            <Tag className="w-3 h-3 text-emerald-400 shrink-0" />
                                            <span className="font-black text-emerald-300 text-xs tracking-widest">
                                                {deal.couponCode}
                                            </span>
                                            <span className="text-emerald-400 font-bold text-xs ml-auto">
                                                −₹{deal.discountAmount}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onProductClick(String(deal.productId))}
                                            className="w-full text-[11px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition"
                                        >
                                            View Product →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right scroll button */}
                <button
                    onClick={() => scroll("right")}
                    className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Dismiss */}
                <button
                    onClick={() => setDismissed(true)}
                    className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition ml-1"
                    title="Dismiss"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
// AFTER
const MobileDealsCarousel = ({ deals, onProductClick, onDismiss, accent = '#6366f1' }: any) => {
    const [index, setIndex] = useState(0);
    const touchStartX = useRef<number>(0);  // ADD useRef to imports if not there

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % deals.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [deals.length]);

    const deal = deals[index];

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
            if (diff > 0) setIndex((i) => (i + 1) % deals.length);
            else setIndex((i) => (i - 1 + deals.length) % deals.length);
        }
    };

    return (
        <div
            className="relative px-4 pt-6 pb-3 text-white"
            style={{ background: `linear-gradient(to right, ${accent}ee, ${accent}bb)` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-black/50 transition"
            >
                <X className="w-4 h-4 text-white" />
            </button>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg">

                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span className="text-xs font-bold tracking-widest uppercase">
                        Exclusive Deal
                    </span>
                </div>

                {/* Content */}
                <div
                    onClick={() => onProductClick(String(deal.productId))}
                    className="flex items-center gap-3"
                >
                    {deal.productImage && (
                        <img
                            src={deal.productImage}
                            className="w-14 h-14 rounded-xl object-cover border border-white/20"
                        />
                    )}

                    <div className="flex-1">
                        <p className="text-sm font-semibold line-clamp-1">
                            {deal.productName}
                        </p>

                        <p className="text-xs text-yellow-200 font-bold">
                            {deal.couponCode} • Save ₹{deal.discountAmount}
                        </p>

                        <p className="text-[10px] text-white/70 mt-1">
                            Tap to view →
                        </p>
                    </div>
                </div>

                {/* Dots */}
                <div className="flex justify-center mt-3 gap-1">
                    {deals.map((_: any, i: number) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};