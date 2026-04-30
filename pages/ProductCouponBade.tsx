import React, { useState, useEffect } from "react";
import { Check, Copy, Tag } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ProductCoupon {
  code: string;
  discount_amount: number;
  min_order_amount: number;
  description: string | null;
  expires_at: string | null;
}

export const ProductCouponBadge: React.FC<{ productId: number | string }> = ({
  productId,
}) => {
  const [coupons, setCoupons] = useState<ProductCoupon[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("code, discount_amount, min_order_amount, description, expires_at, product_ids")
        .eq("is_active", true);

      if (!data) return;

      const numId = Number(productId);
      const applicable = data.filter(
        (c: any) =>
          // Global coupon (no product restriction) OR includes this product
          !c.product_ids ||
          c.product_ids.length === 0 ||
          c.product_ids.includes(numId)
      );
      // Filter out expired
      const now = new Date();
      const valid = applicable.filter(
        (c: any) => !c.expires_at || new Date(c.expires_at) > now
      );
      setCoupons(valid);
    };
    fetch();
  }, [productId]);

  if (coupons.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-emerald-100 bg-emerald-100/60">
        <Tag className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
          Available Offers
        </span>
      </div>
      <div className="divide-y divide-emerald-100">
        {coupons.map((c) => (
          <div key={c.code} className="px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="shrink-0 border-2 border-dashed border-emerald-400 rounded-md px-2 py-0.5">
                <span className="font-black text-emerald-700 text-[11px] tracking-widest">{c.code}</span>
              </div>
              <span className="text-xs font-bold text-slate-800">Save ₹{c.discount_amount}</span>
              <span className="ml-auto shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Use at Checkout</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              {c.description || (c.min_order_amount > 0 ? `On orders above ₹${c.min_order_amount}` : "No minimum order required")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export const ProductCouponInline: React.FC<{
  productId: number | string;
  productPrice: number;
  variant?: "card" | "details";
}> = ({ productId, productPrice, variant = "card" }) => {
  const [best, setBest] = useState<ProductCoupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCoupon = async () => {
      const { data } = await supabase
        .from("coupons")
        .select("code, discount_amount, min_order_amount, description, expires_at, product_ids")
        .eq("is_active", true);
      if (!data) return;
      const numId = Number(productId);
      const now = new Date();
      const valid = data.filter(
        (c: any) =>
          (!c.product_ids || c.product_ids.length === 0 || c.product_ids.includes(numId)) &&
          (!c.expires_at || new Date(c.expires_at) > now) &&
          (c.min_order_amount === 0 || productPrice >= c.min_order_amount)
      );
      const top = valid.sort((a: any, b: any) => b.discount_amount - a.discount_amount)[0] ?? null;
      setBest(top);
    };
    fetchCoupon();
  }, [productId, productPrice]);

  if (!best) return null;
  const finalPrice = productPrice - best.discount_amount;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(best.code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── DETAILS variant: always full scissors row, mobile + desktop same ──
  if (variant === "details") {
    return (
      <>
        <style>{`
          @keyframes couponIn { from { opacity:0; } to { opacity:1; } }
          .coupon-details { animation: couponIn 0.3s ease both; }
        `}</style>
        <div className="coupon-details mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-emerald-400 text-[13px] select-none shrink-0">✂︎</span>
          <span className="text-[15px] font-black text-emerald-700 tracking-tight whitespace-nowrap">
            Get at ₹{finalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">with</span>
          <span className="font-black text-[12px] text-emerald-800 bg-emerald-50 border border-dashed border-emerald-300 px-2 py-0.5 rounded-md tracking-widest leading-none whitespace-nowrap">
            {best.code}
          </span>
        </div>
      </>
    );
  }

  // ── CARD variant: mobile = tiny text, desktop = scissors row ──
  return (
    <>
      <style>{`
        @keyframes couponIn { from { opacity:0; } to { opacity:1; } }
        .coupon-wrap { animation: couponIn 0.3s ease both; }
      `}</style>

      {/* mobile card — single text line, zero overflow */}
      <div className="coupon-wrap  md:hidden">
        <span className="text-[8px] font-bold text-emerald-700 leading-none whitespace-nowrap">
          🏷 Get at ₹{finalPrice.toLocaleString("en-IN")} with offers
        </span>
      </div>

      {/* desktop card — scissors row, no wrap */}
      <div className="coupon-wrap  hidden md:flex items-center gap-1.5 flex-nowrap overflow-hidden">
        <span className="text-emerald-400 text-[11px] select-none shrink-0">✂︎</span>
        <span className="text-[13px] font-black text-emerald-700 tracking-tight whitespace-nowrap shrink-0">
          Get at ₹{finalPrice.toLocaleString("en-IN")}
        </span>
      </div>
    </>
  );
};