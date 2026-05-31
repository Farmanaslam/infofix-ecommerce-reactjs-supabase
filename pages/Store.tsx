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
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { normalizeTerm, expandTerms, inferCategoryFromQuery } from '@/lib/searchUtils'

const PER_PAGE = 12;
const IS_SB = !!supabase;

// ─── Mappers ───────────────────────────────────────────────────────────────────
function fromSupabase(row: any): Product {
  const disc = row.discount_percent ?? 0;

  // ── Resolve primary image from colors if available ──
  let primaryImage =
    row.image_url ??
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80";

  let parsedColors: any[] = [];
  if (row.colors) {
    try {
      parsedColors = typeof row.colors === "string"
        ? JSON.parse(row.colors)
        : Array.isArray(row.colors) ? row.colors : [];
    } catch { }
  }
  // Use first in-stock color's first image (or first color if all OOS)
  const firstColor = parsedColors.find(c => c.stock > 0) ?? parsedColors[0];
  if (firstColor?.images?.length > 0) {
    primaryImage = firstColor.images[0];
  }

  const imageUrl = primaryImage;
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
  accent = '#6366f1',
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  accent?: string;
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
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.background = accent + '12'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
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
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${p === page ? "text-white shadow-lg scale-105" : "border border-gray-200 text-gray-600 hover:border-gray-300"}`}
              style={p === page ? { background: accent, boxShadow: `0 4px 12px ${accent}44` } : {}} >
              {p}
            </button>
          ),
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-200"
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.background = accent + '12'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
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
  accent = '#6366f1',
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (v: any) => void;
  single?: boolean;
  accent?: string;
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
            className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${selected.includes(option) ? "text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            style={selected.includes(option) ? { background: accent, boxShadow: `0 4px 12px ${accent}44` } : {}}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[₹&@#%\+\*\(\)\[\]]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function getSeoHeading(pathname: string, searchQuery: string, selectedCategory: string, selectedSubcategory: string, section: string) {
  const p = pathname.toLowerCase()

  // Exact SEO URL mappings
  const urlHeadings: Record<string, { h1: string; h2: string; sub: string }> = {
    '/buy-laptop': { h1: 'Buy Laptop', h2: 'Online in India', sub: 'New & refurbished laptops — all brands, all budgets. Pan-India delivery.' },
    '/buy-laptop-durgapur': { h1: 'Buy Laptop in', h2: 'Durgapur', sub: 'Walk in or order online. Laptops for students, professionals & gamers in Durgapur.' },
    '/buy-laptop-asansol': { h1: 'Buy Laptop in', h2: 'Asansol', sub: 'Best laptop prices in Asansol. Dell, HP, Lenovo, Asus & more — same-day pickup available.' },
    '/buy-laptop-west-bengal': { h1: 'Buy Laptop in', h2: 'West Bengal', sub: 'Trusted laptop retailer across West Bengal. Fast shipping & warranty included.' },
    '/buy-laptop-bengal': { h1: 'Buy Laptop in', h2: 'Bengal', sub: 'Top laptop brands available across Bengal with doorstep delivery & expert support.' },
    '/buy-gaming-laptop-durgapur': { h1: 'Gaming Laptops', h2: 'Durgapur', sub: 'High-performance gaming laptops — RTX graphics, fast refresh, competitive prices. Available in Durgapur.' },
    '/buy-desktop-pc': { h1: 'Buy Desktop PC', h2: 'Online India', sub: 'Ready-to-use desktops & custom PC builds. Office, gaming & workstation configs.' },
    '/buy-desktop-pc-durgapur': { h1: 'Desktop PC in', h2: 'Durgapur', sub: 'Pre-built and custom desktop PCs available in Durgapur. Same-day assembly.' },
    '/laptop-under-30000': { h1: 'Laptops', h2: 'Under ₹30,000', sub: 'Best laptops under ₹30,000 in India. New & refurbished — Dell, HP, Lenovo. Fast delivery.' },
    '/laptop-under-50000': { h1: 'Laptops', h2: 'Under ₹50,000', sub: 'Premium laptops under ₹50,000. i5/i7, 16GB RAM, SSD — all brands, best prices.' },
    '/gaming-laptop-under-60000': { h1: 'Gaming Laptops', h2: 'Under ₹60,000', sub: 'Best gaming laptops under ₹60,000. RTX graphics, 144Hz display, fast delivery.' },
    '/best-laptop-for-students': { h1: 'Best Laptops', h2: 'for Students', sub: 'Lightweight, long battery, budget-friendly. Best student laptops for college & school India.' },
    '/best-laptop-for-programming': { h1: 'Best Laptops', h2: 'for Programming', sub: '16GB RAM, fast SSD, sharp display. Top programming laptops in India 2025.' },
    '/refurbished-laptop-under-20000': { h1: 'Refurbished Laptops', h2: 'Under ₹20,000', sub: 'Certified refurbished laptops under ₹20,000. Grade-A condition, 6-month warranty.' },
    '/buy-desktop-pc-asansol': { h1: 'Desktop PC in', h2: 'Asansol', sub: 'Office & gaming desktops in Asansol. Budget to high-end — all configs.' },
    '/buy-gaming-pc-durgapur': { h1: 'Gaming PC in', h2: 'Durgapur', sub: 'Custom gaming rigs built to your specs. RTX, Ryzen, fast RAM — assembled in Durgapur.' },
    '/gaming-pc-durgapur': { h1: 'Gaming PC', h2: 'Durgapur', sub: 'Durgapur\'s go-to gaming PC store. Custom builds, branded rigs & accessories.' },
    '/custom-pc-build-durgapur': { h1: 'Custom PC Build', h2: 'Durgapur', sub: 'Build your dream PC with expert help. Pick parts, we assemble & test — ready in hours.' },
    '/computer-shop-durgapur': { h1: 'Computer Shop', h2: 'Durgapur', sub: 'Durgapur\'s trusted computer store. Laptops, desktops, accessories & repair under one roof.' },
    '/computer-shop-asansol': { h1: 'Computer Shop', h2: 'Asansol', sub: 'Asansol\'s favourite tech store. New & refurbished computers with warranty.' },
    '/laptop-shop-durgapur': { h1: 'Laptop Shop', h2: 'Durgapur', sub: 'Widest laptop selection in Durgapur. EMI available. Expert advice free.' },
    '/buy-refurbished-laptop': { h1: 'Refurbished Laptops', h2: 'Certified Quality', sub: 'Grade-A refurbished laptops tested, cleaned & warrantied. Save up to 50% vs new.' },
    '/buy-refurbished-laptop-durgapur': { h1: 'Refurbished Laptops', h2: 'Durgapur', sub: 'Certified refurbished laptops in Durgapur. Like-new performance, budget price.' },
    '/buy-refurbished-laptop-asansol': { h1: 'Refurbished Laptops', h2: 'Asansol', sub: 'Quality refurbished laptops available in Asansol. Warranty included.' },
    '/buy-refurbished-laptop-west-bengal': { h1: 'Refurbished Laptops', h2: 'West Bengal', sub: 'Best refurbished laptops across West Bengal. Trusted by 50,000+ customers.' },
    '/refurbished-laptop-durgapur': { h1: 'Refurbished Laptops', h2: 'Durgapur', sub: 'Pre-owned laptops professionally restored. Durgapur pick-up & delivery available.' },
    '/refurbished-laptop-asansol': { h1: 'Refurbished Laptops', h2: 'Asansol', sub: 'Affordable refurbished laptops in Asansol with 6-month warranty.' },
    '/refurbished-desktop-durgapur': { h1: 'Refurbished Desktop', h2: 'Durgapur', sub: 'Certified refurbished desktop PCs in Durgapur. Office-ready, budget-friendly.' },
    '/second-hand-laptop-durgapur': { h1: 'Refurbished Laptops', h2: 'Durgapur', sub: 'Not just second-hand — certified refurbished. Tested, cleaned & warrantied.' },
    '/certified-refurbished-laptop': { h1: 'Certified Refurbished', h2: 'Laptops', sub: 'Every laptop passes 40-point quality check. Grade-A condition. Infofix certified.' },
    '/wholesale-laptop-west-bengal': { h1: 'Wholesale Laptops', h2: 'West Bengal', sub: 'Bulk laptop supply across West Bengal. GST invoice, dedicated B2B support.' },
    '/wholesale-desktop-durgapur': { h1: 'Wholesale Desktops', h2: 'Durgapur', sub: 'Volume desktop orders for offices, schools & resellers. Competitive wholesale pricing.' },
    '/bulk-laptop-supplier-durgapur': { h1: 'Bulk Laptop Supplier', h2: 'Durgapur', sub: 'Reliable bulk laptop sourcing from Durgapur. Fast dispatch, GST billing, flexible MOQ.' },
    '/computer-wholesale-durgapur': { h1: 'Computer Wholesale', h2: 'Durgapur', sub: 'Wholesale computers & accessories in Durgapur. Best trade pricing for businesses.' },
    '/buy-laptop-ukhra': { h1: 'Buy Laptop in', h2: 'Ukhra', sub: 'Laptops delivered to Ukhra. New & refurbished — all major brands.' },
    '/buy-laptop-new-ukhra': { h1: 'New Laptops in', h2: 'Ukhra', sub: 'Brand-new laptops for students & professionals in New Ukhra.' },
    '/buy-laptop-second-hand-ukhra': { h1: 'Refurbished Laptops', h2: 'Ukhra', sub: 'Affordable certified refurbished laptops delivered to Ukhra.' },
    '/refurbished-laptop-ukhra': { h1: 'Refurbished Laptops', h2: 'Ukhra', sub: 'Grade-A refurbished laptops with warranty. Available in Ukhra.' },
    '/buy-desktop-ukhra': { h1: 'Desktop PC in', h2: 'Ukhra', sub: 'Desktop computers for home & office. Delivered to Ukhra with warranty.' },
    '/computer-shop-ukhra': { h1: 'Computer Shop', h2: 'Ukhra', sub: 'Your local computer store — now serving Ukhra with online orders & fast delivery.' },
    '/buy-laptop-india': { h1: 'Buy Laptop', h2: 'Online India', sub: 'Shop laptops online across India. Free shipping, 1-year warranty, easy EMI.' },
    '/laptop-shop-india': { h1: 'Laptop Shop', h2: 'India', sub: 'India\'s trusted online laptop store. All brands, all budgets, doorstep delivery.' },
    '/buy-desktop-india': { h1: 'Buy Desktop PC', h2: 'India', sub: 'Desktop PCs delivered pan-India. Office, gaming & custom builds.' },
    '/refurbished-laptop-india': { h1: 'Refurbished Laptops', h2: 'India', sub: 'Certified refurbished laptops shipped anywhere in India. Verified quality, great value.' },
    '/computer-shop-india': { h1: 'Computer Store', h2: 'India', sub: 'Shop computers online — delivered across India with warranty & expert support.' },
    '/buy-gaming-laptop-india': { h1: 'Gaming Laptops', h2: 'India', sub: 'Top gaming laptops in India — RTX graphics, 144Hz+ display, fast delivery.' },
    '/buy-laptop-near-me': { h1: 'Laptop Store', h2: 'Near Me', sub: 'Find laptops near you. Infofix serves Durgapur, Asansol, Ukhra & ships pan-India.' },
    '/computer-store-near-me': { h1: 'Computer Store', h2: 'Near Me', sub: 'Local computer store with online ordering. Serving Durgapur, Asansol & all of West Bengal.' },
    '/laptop-store-near-me': { h1: 'Laptop Store', h2: 'Near Me', sub: 'Your nearest laptop store — online & offline. Visit us in Durgapur or order online.' },
    '/buy-laptop-online-india': { h1: 'Buy Laptop', h2: 'Online India', sub: 'Shop laptops online across India. Free shipping, 1-year warranty, EMI available. All brands.' },
    '/refurbished-dell-laptop-india': { h1: 'Refurbished Dell', h2: 'Laptops India', sub: 'Certified refurbished Dell laptops pan-India. Latitude, XPS, Vostro — tested & warranted.' },
    '/refurbished-hp-laptop-india': { h1: 'Refurbished HP', h2: 'Laptops India', sub: 'Certified HP refurbished laptops — EliteBook, ProBook, Pavilion. Warranty included.' },
    '/refurbished-lenovo-laptop-india': { h1: 'Refurbished Lenovo', h2: 'Laptops India', sub: 'ThinkPad, IdeaPad refurbished — grade A condition, SSD upgraded, 6-month warranty.' },
    '/buy-laptop-under-20000-india': { h1: 'Laptops', h2: 'Under ₹20,000', sub: 'Best budget laptops under ₹20,000 in India. Refurbished Dell, HP, Lenovo with warranty.' },
    '/buy-laptop-under-40000-india': { h1: 'Laptops', h2: 'Under ₹40,000', sub: 'Top laptops under ₹40,000 — i5/Ryzen 5, 8GB RAM, SSD. Best value picks in India.' },
    '/gaming-laptop-under-70000-india': { h1: 'Gaming Laptops', h2: 'Under ₹70,000', sub: 'Best gaming laptops under ₹70,000 — RTX 4060, 144Hz, fast SSD. India delivery.' },
    '/best-laptop-for-college-students-india': { h1: 'Best Laptops', h2: 'for College Students', sub: 'Lightweight, long battery, budget-friendly. Top college laptops in India 2025.' },
    '/best-laptop-for-engineering-students-india': { h1: 'Best Laptops', h2: 'for Engineering Students', sub: '16GB RAM, fast CPU, long battery. Best engineering laptops in India 2025.' },
    '/best-laptop-for-video-editing-india': { h1: 'Best Laptops', h2: 'for Video Editing', sub: 'i7/Ryzen 7, dedicated GPU, 16GB+ RAM. Best video editing laptops in India 2025.' },
    '/best-business-laptop-india': { h1: 'Best Business', h2: 'Laptops India', sub: 'Durable, secure, fast. Top business laptops — ThinkPad, EliteBook, Latitude — India 2025.' },
    '/custom-gaming-pc-under-50000': { h1: 'Custom Gaming PC', h2: 'Under ₹50,000', sub: 'Best custom gaming PC build under ₹50,000. Ryzen 5, RTX/RX GPU, 16GB RAM. India delivery.' },
    '/custom-gaming-pc-under-80000': { h1: 'Custom Gaming PC', h2: 'Under ₹80,000', sub: 'High-FPS gaming PC under ₹80,000. i5/Ryzen 7, RTX 3060/4060, 32GB RAM option.' },
    '/refurbished-gaming-laptop-india': { h1: 'Refurbished Gaming', h2: 'Laptops India', sub: 'Certified refurbished gaming laptops with dedicated GPU. Pan-India delivery with warranty.' },
    '/buy-desktop-pc-under-30000-india': { h1: 'Desktop PC', h2: 'Under ₹30,000', sub: 'Complete desktop setup under ₹30,000. i3/i5, 8GB RAM, SSD, monitor. India delivery.' },
    '/buy-desktop-pc-under-50000-india': { h1: 'Desktop PC', h2: 'Under ₹50,000', sub: 'Office and gaming desktops under ₹50,000. Best value full setups in India.' },
    '/refurbished-desktop-pc-india': { h1: 'Refurbished Desktop', h2: 'PCs India', sub: 'Certified refurbished desktop PCs pan-India. Office-ready, SSD upgraded, warranted.' },
    '/wholesale-laptop-supplier-india': { h1: 'Wholesale Laptop', h2: 'Supplier India', sub: 'Bulk laptop supply pan-India. GST invoice, all brands, dedicated B2B account support.' },
    '/dell-laptop-durgapur': { h1: 'Dell Laptops', h2: 'Durgapur', sub: 'Buy Dell laptops in Durgapur — Inspiron, Vostro, Latitude. New & refurbished with warranty.' },
    '/hp-laptop-durgapur': { h1: 'HP Laptops', h2: 'Durgapur', sub: 'HP laptops in Durgapur — Pavilion, ProBook, EliteBook. New & refurbished stock.' },
    '/lenovo-laptop-durgapur': { h1: 'Lenovo Laptops', h2: 'Durgapur', sub: 'Lenovo IdeaPad & ThinkPad laptops in Durgapur. Best prices, warranty included.' },
    '/buy-laptop-bardhaman': { h1: 'Buy Laptop in', h2: 'Bardhaman', sub: 'Laptops delivered to Bardhaman. New & refurbished — all major brands, warranty included.' },
    '/computer-shop-bardhaman': { h1: 'Computer Shop', h2: 'Bardhaman', sub: 'Online computer store serving Bardhaman. Laptops, desktops, accessories with delivery.' },
    '/buy-laptop-accessories-online-india': { h1: 'Laptop Accessories', h2: 'Online India', sub: 'Buy laptop bags, chargers, mice, keyboards & more. Delivered pan-India. Infofix Computers.' },
    '/laptop-repair-service-asansol': { h1: 'Laptop Repair Service', h2: 'Asansol', sub: 'Professional laptop repair in Asansol. All brands, fast turnaround, genuine parts.' },
  }
  if (urlHeadings[p]) return urlHeadings[p]

  // Dynamic from search/category

  if (searchQuery) return { h1: `Results for`, h2: `"${searchQuery}"`, sub: `Showing products matching "${searchQuery}". Filter by brand, price & specs.` }
  if (selectedSubcategory && selectedCategory !== 'All') return { h1: selectedSubcategory, h2: `${selectedCategory}s`, sub: `Browse ${selectedSubcategory} ${selectedCategory}s. Filter by brand, price & specs.` }
  if (selectedCategory !== 'All') return { h1: `Browse`, h2: `${selectedCategory}s`, sub: `Explore our full range of ${selectedCategory}s — new, refurbished & custom builds.` }

  return section === 'Refurbished'
    ? { h1: 'Quality Tech,', h2: 'Smart Price.', sub: 'Grade-A certified refurbished laptops & desktops. Tested, cleaned, warrantied. Save up to 50%.' }
    : section === 'Wholesale'
      ? { h1: 'Buy More,', h2: 'Save More.', sub: 'Wholesale pricing for businesses, schools & resellers. GST invoice. Bulk discounts available.' }
      : { h1: 'Explore Our', h2: 'Products.', sub: 'New & certified refurbished laptops, desktops & accessories. Backed by Infofix warranty. Pan-India shipping.' }
}


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
    selectedStoreSection,
    currentPage,
    shopNavKey,
    pendingProductId, setPendingProductId, setSelectedStoreSection,
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


  const location = useLocation()
  const navigate = useNavigate()

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

  const pendingSearchRef = useRef<string>("");
  const seoHeading = getSeoHeading(location.pathname, searchQuery, selectedCategory, selectedSubcategory, selectedStoreSection)


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
    // Navigate to SEO URL — /products/hp-laptop-15s-8gb-512gb-ssd
    navigate(`/products/${toSlug(enriched.name)}-${enriched.id}`)
    window.scrollTo({ top: 0, behavior: "smooth" });

    window.gtag?.('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }]
    });
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
              `id, name, description, image_url, images,colors,
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



  const prevSectionRef = useRef(selectedStoreSection);
  useEffect(() => {
    if (prevSectionRef.current === selectedStoreSection) return;
    prevSectionRef.current = selectedStoreSection;
    setSelectedProduct(null);
    sessionStorage.removeItem("selectedProduct");
    if (!ctxCategory) {
      setSelectedCategory("All");
      setSelectedSubcategory("");
    }
    setSearchQuery("");
    setHeroSearch("");
  }, [selectedStoreSection]);

  useEffect(() => {
    if (currentPage === 'shop') {
      const saved = sessionStorage.getItem("selectedProduct");
      if (saved) {
        try { setSelectedProduct(JSON.parse(saved)); }
        catch { setSelectedProduct(null); sessionStorage.removeItem("selectedProduct"); }
      } else {
        setSelectedProduct(null);
      }
    }
  }, [currentPage]);
  const handlePageChange = (newPage: number) => {
    setRevealed(false);
    setPage(newPage);
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };
  useEffect(() => {
    if (!shopNavKey) return;
    setSelectedProduct(null);
    sessionStorage.removeItem("selectedProduct");
    setSearchQuery("");
    setHeroSearch("");
    if (!ctxCategory) {
      setSelectedCategory("All");
      setSelectedSubcategory("");
    }
  }, [shopNavKey]);


  useEffect(() => {
    if (!pendingProductId || !supabase) return;
    const fetchAndOpen = async () => {
      const { data } = await supabase
        .from("products")
        .select(`id, name, description, image_url, images,colors,
        retail_price, discount_percent, discounted_price, min_order_quantity,
        stock_quantity, condition, brand, specs,
        rating_avg, rating_count, reviews_count, likes_count,
        categories(name,slug), subcategories(name,slug), model`)
        .eq("id", Number(pendingProductId))
        .single();
      if (data) {
        const product = fromSupabase(data);
        sessionStorage.setItem("selectedProduct", JSON.stringify(product));
        setSelectedProduct(product);
        navigate(`/products/${toSlug(product.name)}-${product.id}`);
      }
      setPendingProductId(null);
    };
    fetchAndOpen();
  }, [pendingProductId]);

  useEffect(() => {
    const path = location.pathname.toLowerCase()

    // ignore non-SEO paths
    if (path === '/shop' || path === '/' || path.startsWith('/products/')) return

    // ── Set store section ──
    if (
      path.includes('refurbished') ||
      path.includes('second-hand') ||
      path.includes('certified-refurbished')
    ) {
      setSelectedStoreSection('Refurbished')
    } else if (
      path.includes('wholesale') ||
      path.includes('bulk') ||
      path.includes('b2b')
    ) {
      setSelectedStoreSection('Wholesale')
    } else {
      setSelectedStoreSection('Infofix')
    }

    // ── Set category ──
    if (path.includes('gaming-pc') || path.includes('desktop')) {
      setSelectedCategory('Desktop')
      if (path.includes('gaming')) setHeaderSearchQuery('gaming')
    } else if (path.includes('laptop')) {
      setSelectedCategory('Laptop')
      if (path.includes('gaming')) setSelectedSubcategory('Gaming')
    } else if (path.includes('repair')) {
      // repair pages → services, no category needed
    }
  }, [location.pathname])

  // Read product ID from slug URL on direct visit
  useEffect(() => {
    const path = location.pathname
    if (!path.startsWith('/products/')) return

    const slug = path.replace('/products/', '')
    // ID is the last segment after final dash
    const parts = slug.split('-')
    const id = parts[parts.length - 1]

    if (!id || !supabase) return

    // Only fetch if no product already open
    if (selectedProduct?.id === id) return

    const fetchProduct = async () => {
      const { data } = await supabase
        .from("products")
        .select(`id, name, description, image_url, images,
        retail_price, discount_percent, discounted_price, min_order_quantity,
        stock_quantity, condition, brand, specs,
        rating_avg, rating_count, reviews_count, likes_count,
        categories(name,slug), subcategories(name,slug), model`)
        .eq("id", Number(id))
        .single()

      if (data) {
        const product = fromSupabase(data)
        sessionStorage.setItem("selectedProduct", JSON.stringify(product))
        setSelectedProduct(product)
      }
    }
    fetchProduct()
  }, [location.pathname])

  // ── If a product is selected, render ProductDetails ───────────────────────
  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => {
          setSelectedProduct(null);
          sessionStorage.removeItem("selectedProduct");
          navigate('/shop')
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNavigateToCart={handleNavigateToCart}
        accent={theme.accent}
      />
    );
  }

  // ── Otherwise render the store grid ──────────────────────────────────────
  return (
    <div className="pb-32 overflow-hidden bg-white">
      <Helmet>
        <title>{seoHeading.h1} {seoHeading.h2} | Infofix Computers</title>
        <meta name="description" content={seoHeading.sub} />
        <meta property="og:title" content={`${seoHeading.h1} ${seoHeading.h2} | Infofix Computers`} />
        <meta property="og:description" content={seoHeading.sub} />
        <link rel="canonical" href={`https://infofixcomputers.com${location.pathname}`} />
        {/* LocalBusiness JSON-LD — only on computer-shop routes */}
        {location.pathname.includes('computer-shop') && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ComputerStore",
            "@id": "https://infofixcomputers.com/#business",
            "name": "Infofix Computers",
            "url": "https://infofixcomputers.com",
            "image": "https://infofixcomputers.com/icons/logo.png",
            "telephone": "+91-8293295257",
            "priceRange": "₹₹",
            "description": seoHeading.sub,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Benachity Near Bank of Baroda",
              "addressLocality": "Durgapur",
              "addressRegion": "West Bengal",
              "postalCode": "713201",
              "addressCountry": "IN"
            },
            "geo": { "@type": "GeoCoordinates", "latitude": 23.5204, "longitude": 87.3119 },
            "openingHoursSpecification": [{
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "10:00", "closes": "20:00"
            }],
            "areaServed": [
              { "@type": "City", "name": "Durgapur" },
              { "@type": "City", "name": "Asansol" },
              { "@type": "City", "name": "Ukhra" },
              { "@type": "State", "name": "West Bengal" },
              { "@type": "Country", "name": "India" }
            ],
            "sameAs": [
              "https://www.facebook.com/infofixcomputers",
              "https://www.instagram.com/infofixcomputers"
            ]
          })}</script>
        )}
        {/* Product listing schema on shop/category routes */}
        {(location.pathname === '/shop' || location.pathname.startsWith('/buy-') || location.pathname.startsWith('/laptop') || location.pathname.startsWith('/gaming') || location.pathname.startsWith('/refurbished') || location.pathname.startsWith('/custom') || location.pathname.startsWith('/wholesale')) && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${seoHeading.h1} ${seoHeading.h2}`,
            "description": seoHeading.sub,
            "url": `https://infofixcomputers.com${location.pathname}`,
            "numberOfItems": totalCount,
            "itemListElement": products.slice(0, 10).map((p, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "Product",
                "name": p.name,
                "image": p.image,
                "description": p.description?.slice(0, 160),
                "brand": { "@type": "Brand", "name": p.brand },
                "offers": {
                  "@type": "Offer",
                  "price": p.price,
                  "priceCurrency": "INR",
                  "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                  "seller": { "@type": "Organization", "name": "Infofix Computers" }
                }
              }
            }))
          })}</script>
        )}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://infofixcomputers.com/" },
            { "@type": "ListItem", "position": 2, "name": seoHeading.h1 + ' ' + seoHeading.h2, "item": `https://infofixcomputers.com${location.pathname}` }
          ]
        })}</script>
        {/* FAQ schema — only for known SEO URL pages */}
        {(() => {
          const knownSeoUrls = [
            '/buy-laptop-durgapur', '/buy-laptop-asansol', '/buy-laptop-ukhra',
            '/buy-refurbished-laptop-durgapur', '/computer-shop-durgapur',
            '/computer-shop-asansol', '/laptop-shop-durgapur', '/gaming-pc-durgapur',
            '/buy-gaming-laptop-durgapur', '/laptop-repair-durgapur',
            '/laptop-under-30000', '/laptop-under-50000', '/best-laptop-for-students',
            '/buy-refurbished-laptop', '/refurbished-laptop-india',
            '/wholesale-laptop-west-bengal', '/buy-laptop-bardhaman',
            '/dell-laptop-durgapur', '/hp-laptop-durgapur', '/lenovo-laptop-durgapur',
          ]
          if (!knownSeoUrls.includes(location.pathname.toLowerCase())) return null
          return (
            <script type="application/ld+json">{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `${seoHeading.h1} ${seoHeading.h2} — Where to buy?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${seoHeading.sub} Visit Infofix Computers at Benachity, Durgapur (10AM–8PM, Mon–Sat) or order online at infofixcomputers.com with PAN India delivery.`
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Infofix Computers offer warranty?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. All new products carry manufacturer warranty. Refurbished products have 6-month Infofix service warranty. 7-day replacement policy on all orders. Call 8293295257."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Infofix ship across India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Infofix Computers offers PAN India shipping on all products including laptops, desktops, and accessories. Free delivery available on select orders."
                  }
                }
              ]
            })}</script>
          )
        })()}
      </Helmet>
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
      <section ref={gridRef} className="relative flex items-center justify-center overflow-hidden py-3 px-2 md:py-5" style={{ background: 'white' }}>

        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full blur-[80px] opacity-30 pointer-events-none"
          style={{ background: theme.accent + '22', willChange: 'auto' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] rounded-full blur-[100px] opacity-30 pointer-events-none"
          style={{ background: theme.accent + '18' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-2">
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
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter anim-fade-in-up" style={{ animationDelay: "0.08s" }}>

            {seoHeading.h1}{' '}
            <span style={{ color: theme.accent }}>{seoHeading.h2}</span>
          </h1>
          <p className="text-sm md:text-base font-semibold text-gray-600 max-w-xl mx-auto anim-fade-in-up" style={{ animationDelay: "0.12s" }}>
            {seoHeading.sub}
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

      <div className="app-container mt-2">
        {/* ── Filter Bar ── */}
        <div
          className="sticky top-0 z-30 -mx-4 px-4 py-2.5 bg-white/96 backdrop-blur-sm border-b border-gray-100 mb-4"
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
                {["Keyboard", "Mouse", "Headphones", "Hub", "Stand", "WIFI Adapter", "Router"].map((sub) => (
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
                      <span className="ml-1.5" style={{ color: theme.accent }}>
                        · {selectedCategory}
                      </span>
                    )}
                    {searchQuery && (
                      <span className="ml-1.5" style={{ color: theme.accent }}>
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
                className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest transition-colors"
                onMouseEnter={e => { e.currentTarget.style.color = theme.accent; }}
                onMouseLeave={e => { e.currentTarget.style.color = ''; }}
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
                  accent={theme.accent}
                  accentHover={theme.accentHover}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              onPageChange={handlePageChange}
              accent={theme.accent}
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
                accent={theme.accent}
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
                accent={theme.accent}
              />
              <FilterSection
                title="RAM"
                options={["4GB", "8GB", "16GB", "32GB", "64GB"]}
                selected={selectedRam}
                onChange={setSelectedRam}
                accent={theme.accent}
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
                accent={theme.accent}
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
                className="w-full text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
                style={{ background: theme.accent, boxShadow: `0 4px 14px ${theme.accent}33` }}
                onMouseEnter={e => (e.currentTarget.style.background = theme.accentHover)}
                onMouseLeave={e => (e.currentTarget.style.background = theme.accent)}
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
            {(selectedStoreSection === 'Refurbished' ? [
              { stat: "Grade A", label: "Certified Condition" },
              { stat: "6 Month", label: "Warranty on Refurb Units" },
              { stat: "SSD", label: "Upgraded Before Dispatch" },
              { stat: "Tested", label: "Multi-Point Quality Check" },
            ] : selectedStoreSection === 'Wholesale' ? [
              { stat: "500+", label: "SKUs Available" },
              { stat: "GST", label: "Invoice on All Orders" },
              { stat: "Bulk", label: "Volume Pricing Available" },
              { stat: "B2B", label: "Dedicated Account Support" },
            ] : [
              { stat: "50,000+", label: "Happy Customers" },
              { stat: "1 Year", label: "Warranty on All Products" },
              { stat: "Secure", label: "Verified Payments" },
              { stat: "Fast", label: "PAN India Shipping" },
            ]).map((item) => (
              <div key={item.label} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all"
                style={{ ['--hover-border' as any]: theme.accent }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = theme.accent + '44')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
              >
                <h3 className="font-black text-3xl" style={{ color: theme.accent }}>
                  {item.stat}
                </h3>
                <p className="text-gray-500 font-semibold text-sm mt-2">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

      )}

    </div>
  );
};
