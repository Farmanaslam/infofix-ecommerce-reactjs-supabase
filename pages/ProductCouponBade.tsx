// ─── ProductCouponBadge.tsx ───────────────────────────────────────────────────
// Drop this component into ProductDetails just above the CTA buttons.
// It fetches coupons that apply to the given product and shows them.

import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";
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
          <div key={c.code} className="flex items-center gap-3 px-4 py-3">
            <div className="shrink-0 border-2 border-dashed border-emerald-400 rounded-lg px-2.5 py-1">
              <span className="font-black text-emerald-700 text-xs tracking-widest">
                {c.code}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">
                Save ₹{c.discount_amount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {c.description ||
                  (c.min_order_amount > 0
                    ? `On orders above ₹${c.min_order_amount}`
                    : "No minimum order required")}
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              Use at Checkout
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
