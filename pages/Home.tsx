import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../context/StoreContext";
import {
  ArrowRight,
  Shield,
  Award,
  Globe,
  Wrench,
  RefreshCw,
  Star,
  ShoppingBag,
  MapPin,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Zap,
  CheckCircle2,
  ChevronRight,
  Phone,
  TrendingUp,
  Users,
  Package,
  Clock,
  Laptop,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────
// HERO CAROUSEL
// ─────────────────────────────────────────────────────────
const heroSlides = [
  {
    eyebrow: "Best Value Pick",
    headline: "Smart Tech,",
    accent: "Smart Price",
    accentColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.18)",
    sub: "Perfect entry-level desktop for students and home users. Smooth performance for online classes, browsing, MS Office, and daily tasks — all at an unbeatable price.",
    price: "₹10,999",
    oldPrice: "₹14,999",
    specs: [
      { label: "Intel Core i3 (3rd Gen)", icon: "cpu" },
      { label: "4GB DDR3 RAM", icon: "memory" },
      { label: "128GB SSD", icon: "storage" },
      { label: '19" Monitor + Accessories', icon: "os" },
    ],
    productName: "Infofix Essential i3",
    productSpec: "i3 / 4GB / 128GB SSD / Full Set",
  },

  {
    eyebrow: "Office & Study Ready",
    headline: "Built for",
    accent: "Everyday Work",
    accentColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.22)",
    sub: "Reliable performance for office work, multitasking, and students. Ideal for billing, Excel, coding beginners, and productivity tasks with smooth SSD speed.",
    price: "₹24,999",
    oldPrice: "₹33,999",
    specs: [
      { label: "Intel Core i5 (6th Gen)", icon: "cpu" },
      { label: "8GB DDR4 RAM", icon: "memory" },
      { label: "512GB SSD", icon: "storage" },
      { label: '22" Monitor Full Setup', icon: "os" },
    ],
    productName: "Infofix Workstation i5",
    productSpec: 'i5 / 8GB / 512GB SSD / 22"',
  },

  {
    eyebrow: "Gaming Performance",
    headline: "Unleash",
    accent: "Maximum Power",
    accentColor: "#818cf8",
    glowColor: "rgba(129,140,248,0.18)",
    sub: "High-performance gaming desktop built for modern gamers and creators. Enjoy smooth gameplay, fast rendering, and multitasking with powerful GPU and RGB setup.",
    price: "₹86,799",
    oldPrice: "₹1,02,999",
    specs: [
      { label: "Intel i5 14th Gen", icon: "cpu" },
      { label: "16GB DDR4 RAM", icon: "memory" },
      { label: "512GB NVMe SSD", icon: "storage" },
      { label: "RTX 3050 6GB GPU", icon: "gpu" },
    ],
    productName: "Infofix Gaming Beast",
    productSpec: "i5 14th / 16GB / RTX 3050",
  },

  {
    eyebrow: "Gaming Value Deal",
    headline: "High FPS,",
    accent: "Lower Price",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.18)",
    sub: "Affordable gaming PC designed for smooth 1080p gaming, streaming, and editing. Perfect balance of performance and price for budget gamers.",
    price: "₹52,999",
    oldPrice: "₹64,999",
    specs: [
      { label: "Ryzen 5 5500", icon: "cpu" },
      { label: "8GB DDR4 RAM", icon: "memory" },
      { label: "512GB SSD", icon: "storage" },
      { label: "RX 580 8GB GPU", icon: "gpu" },
    ],
    productName: "Infofix Gaming Starter",
    productSpec: 'R5 / 8GB / RX 580 / 24"',
  },
  {
    eyebrow: "Best Refurbished Deal",
    headline: "Like New,",
    accent: "Half the Price",
    accentColor: "#ec4899",
    glowColor: "rgba(236,72,153,0.18)",
    sub: "Certified refurbished laptops tested and restored by our in-house technicians. Perfect for students and budget buyers who want reliable performance without the premium price tag.",
    price: "₹12,999",
    oldPrice: "₹28,000",
    specs: [
      { label: "Tested & Restored", icon: "cpu" },
      { label: "6 Month Warranty", icon: "memory" },
      { label: "Grade A Condition", icon: "storage" },
      { label: "All Brands Available", icon: "os" },
    ],
    productName: "Infofix Certified Refurb",
    productSpec: "i3–i7 / 8GB+ / SSD / Warranty",
  },
];

const SpecIcon: React.FC<{ type: string; color: string }> = ({
  type,
  color,
}) => {
  const p = {
    width: 11,
    height: 11,
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };
  if (type === "cpu")
    return (
      <svg {...p}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    );
  if (type === "memory")
    return (
      <svg {...p}>
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    );
  if (type === "storage")
    return (
      <svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    );
  if (type === "gpu")
    return (
      <svg {...p}>
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  );
};

const HeroCarousel: React.FC<{ onShop: () => void; onContact: () => void }> = ({
  onShop,
  onContact,
}) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const slide = heroSlides[current];

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === current) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 220);
    },
    [animating, current],
  );

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % heroSlides.length), 3000);
    return () => clearInterval(t);
  }, [current, goTo]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-[#0a0a0f] flex flex-col "
      style={{ minHeight: "clamp(320px, 75vw, 420px)" }}
    >
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg,${slide.accentColor},#818cf8,${slide.accentColor})`,
          transition: "background 0.4s",
        }}
      />
      <div className="flex flex-col flex-1">
        {/* MOBILE ONLY — compact single column */}
        <div
          className="flex flex-col md:hidden flex-1 p-5"
          style={{ transition: "opacity 0.22s", opacity: animating ? 0 : 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: slide.accentColor,
                boxShadow: `0 0 6px ${slide.accentColor}`,
                animation: "pulseDot 2s ease infinite",
              }}
            />
            <span
              className="text-[9px] font-black uppercase tracking-[0.18em]"
              style={{ color: slide.accentColor }}
            >
              {slide.eyebrow}
            </span>
          </div>

          <h1
            className="font-black leading-[1.05] tracking-tight text-white mb-2"
            style={{ fontSize: "clamp(22px, 6vw, 30px)" }}
          >
            {slide.headline}{" "}
            <span style={{ color: slide.accentColor }}>{slide.accent}</span>
          </h1>

          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-[10px] font-semibold"
              style={{ color: "#6b7280" }}
            >
              From
            </span>
            <span
              className="font-black text-white"
              style={{ fontSize: 22, letterSpacing: "-0.04em" }}
            >
              {slide.price}
            </span>
            <span className="text-xs line-through" style={{ color: "#374151" }}>
              {slide.oldPrice}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {slide.specs.map((spec, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                style={{
                  background: "#1a1a2e",
                  border: "1px solid #2d2d4e",
                  color: slide.accentColor,
                }}
              >
                <SpecIcon type={spec.icon} color={slide.accentColor} />{" "}
                {spec.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={onShop}
              className="text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex-1"
              style={{ background: slide.accentColor }}
            >
              Shop Now
            </button>
            <button
              onClick={onContact}
              className="text-[10px] font-semibold px-4 py-2.5 rounded-xl"
              style={{
                background: "transparent",
                border: "1px solid #2d2d4e",
                color: "#9ca3af",
              }}
            >
              Custom →
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  height: 4,
                  width: i === current ? 18 : 4,
                  borderRadius: 3,
                  background: i === current ? slide.accentColor : "#374151",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-2 flex-1">
          {/* LEFT */}
          <div
            className="flex flex-col justify-between p-7 lg:p-10"
            style={{ transition: "opacity 0.22s", opacity: animating ? 0 : 1 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: slide.accentColor,
                    boxShadow: `0 0 6px ${slide.accentColor}`,
                    animation: "pulseDot 2s ease infinite",
                  }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{ color: slide.accentColor }}
                >
                  {slide.eyebrow}
                </span>
              </div>
              <h1
                className="font-black leading-[1.05] tracking-tight text-white mb-3"
                style={{ fontSize: "clamp(26px,3.5vw,42px)" }}
              >
                {slide.headline}
                <br />
                <span style={{ color: slide.accentColor }}>{slide.accent}</span>
              </h1>
              <p
                className="text-sm font-medium leading-relaxed mb-5 max-w-xs"
                style={{ color: "#6b7280" }}
              >
                {slide.sub}
              </p>
              <div className="flex items-baseline gap-3 mb-5">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#6b7280" }}
                >
                  Starting from
                </span>
                <span
                  className="font-black text-white"
                  style={{ fontSize: 26, letterSpacing: "-0.04em" }}
                >
                  {slide.price}
                </span>
                <span
                  className="text-sm line-through"
                  style={{ color: "#374151" }}
                >
                  {slide.oldPrice}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-7">
                {slide.specs.map((spec, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                    style={{
                      background: "#1a1a2e",
                      border: "1px solid #2d2d4e",
                      color: slide.accentColor,
                    }}
                  >
                    <SpecIcon type={spec.icon} color={slide.accentColor} />{" "}
                    {spec.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={onShop}
                className="text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all hover:opacity-90"
                style={{ background: slide.accentColor }}
              >
                Shop Now
              </button>
              <button
                onClick={onContact}
                className="text-sm font-semibold px-5 py-3 rounded-xl transition-all"
                style={{
                  background: "transparent",
                  border: "1px solid #2d2d4e",
                  color: "#9ca3af",
                }}
              >
                Custom Build →
              </button>
            </div>
          </div>
          {/* RIGHT */}
          <div
            className="relative flex flex-col items-center justify-center py-6 px-4 overflow-hidden"
            style={{ minHeight: 240 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 70% at 60% 50%, #1e1b4b 0%, #0a0a0f 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.06) 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div
              className="relative z-10 mb-4"
              style={{
                width: "clamp(160px, 45vw, 220px)",
                height: "clamp(120px, 32vw, 170px)",
                transition: "opacity 0.22s",
                opacity: animating ? 0 : 1,
              }}
            >
              <div
                style={{
                  width: 175,
                  height: 120,
                  background: "#111827",
                  borderRadius: 10,
                  border: "2px solid #374151",
                  position: "absolute",
                  top: 0,
                  left: 14,
                  overflow: "hidden",
                  boxShadow: `0 0 36px ${slide.glowColor}`,
                  transition: "box-shadow 0.4s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#0d0d1a",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      color: slide.accentColor,
                      transition: "color 0.3s",
                    }}
                  >
                    INFOFIX
                  </div>
                  <div
                    style={{
                      fontSize: 7,
                      color: "#4b5563",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}
                  >
                    {slide.productName}
                  </div>
                  <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                    {[10, 18, 14, 20, 12].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: h,
                          borderRadius: 2,
                          background: slide.accentColor,
                          animation: `barAnim 1.2s ease ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 10,
                  height: 14,
                  background: "#374151",
                  position: "absolute",
                  bottom: 24,
                  left: 99,
                }}
              />
              <div
                style={{
                  width: 50,
                  height: 5,
                  background: "#374151",
                  borderRadius: 3,
                  position: "absolute",
                  bottom: 20,
                  left: 79,
                }}
              />
              <div
                style={{
                  width: 38,
                  height: 90,
                  background: "#1f2937",
                  borderRadius: 8,
                  border: "1.5px solid #374151",
                  position: "absolute",
                  bottom: 20,
                  right: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px 5px",
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: slide.accentColor,
                    boxShadow: `0 0 8px ${slide.accentColor}`,
                    transition: "background 0.3s",
                  }}
                />
                <div
                  style={{
                    width: 22,
                    height: 3,
                    background: "#374151",
                    borderRadius: 2,
                  }}
                />
                <div
                  style={{
                    width: 22,
                    height: 3,
                    background: "#374151",
                    borderRadius: 2,
                  }}
                />
              </div>
            </div>
            <div
              className="relative z-10 flex items-center gap-3 rounded-xl px-4 py-3 w-full"
              style={{
                maxWidth: 270,
                background: "#111827",
                border: "1px solid #1f2937",
                transition: "opacity 0.22s",
                opacity: animating ? 0 : 1,
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 32, height: 32, background: "#1e1b4b" }}
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={slide.accentColor}
                  strokeWidth="1.8"
                >
                  <rect x="2" y="3" width="13" height="11" rx="2" />
                  <path d="M16 8h4a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {slide.productName}
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: "#6b7280" }}
                >
                  {slide.productSpec}
                </div>
              </div>
              <div
                className="text-sm font-black shrink-0"
                style={{ color: slide.accentColor }}
              >
                {slide.price}
              </div>
            </div>
            <div className="flex gap-2 mt-4 relative z-10">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    height: 5,
                    width: i === current ? 20 : 5,
                    borderRadius: 3,
                    background: i === current ? slide.accentColor : "#374151",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Ticker */}
      <div
        style={{
          background: "#111827",
          borderTop: "1px solid #1f2937",
          padding: "9px 0",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "ticker 24s linear infinite",
          }}
        >
          {[...Array(2)].flatMap((_, ri) =>
            [
              { h: "FREE", t: "Same-day city delivery" },
              { h: "1 Year", t: "Hardware warranty included" },
              { h: "Custom", t: "PC & laptop builds" },
              { h: "Expert", t: "In-house technicians" },
              { h: "COD", t: "Available in India" },
              { h: "5 Stores", t: "Walk in anytime" },
            ].map((item, i) => (
              <div
                key={`${ri}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 28px",
                  fontSize: 11,
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                  borderRight: "1px solid #1f2937",
                }}
              >
                <span style={{ color: "#818cf8", fontWeight: 700 }}>
                  {item.h}
                </span>{" "}
                {item.t}
              </div>
            )),
          )}
        </div>
      </div>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes barAnim { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const {
    setCurrentPage,
    setSelectedCategory,
    setHeaderSearchQuery,
    addToCart,
  } = useStore();
  const [featured, setFeatured] = useState<any[]>([]);
  const [currentReview, setCurrentReview] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const [countersStarted, setCountersStarted] = useState(false);
  const [counts, setCounts] = useState({
    customers: 0,
    stores: 0,
    products: 0,
    years: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, image_url, discounted_price, retail_price, discount_percent, category_id, categories(name)",
        )
        .eq("is_active", true)
        .gt("discount_percent", 0)
        .order("discount_percent", { ascending: false })
        .limit(3);
      if (data) setFeatured(data);
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) setCountersStarted(true);
      },
      { threshold: 0.3 },
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [countersStarted]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    // Observe all reveal elements
    document.querySelectorAll(".reveal, .stagger-children").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [featured]); // re-run when featured loads
  useEffect(() => {
    if (!countersStarted) return;
    const targets = { customers: 50000, stores: 5, products: 500, years: 8 };
    const duration = 1800;
    const steps = 60;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
      setCounts({
        customers: Math.round(targets.customers * ease),
        stores: Math.round(targets.stores * ease),
        products: Math.round(targets.products * ease),
        years: Math.round(targets.years * ease),
      });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [countersStarted]);

  const reviews = [
    {
      text: "Bought a full desktop setup for my office — best price I found anywhere in Durgapur. Machine runs perfectly after 8 months.",
      name: "Suman Mondal",
      role: "Business Owner",
      rating: 5,
    },
    {
      text: "The team helped me choose the right laptop for video editing. Amazing service and honest advice.",
      name: "Priya Sharma",
      role: "Content Creator",
      rating: 5,
    },
    {
      text: "Infofix gave me a custom PC build within my budget that outperforms machines twice the price elsewhere.",
      name: "Arjun Das",
      role: "Developer",
      rating: 5,
    },
    {
      text: "Five stores, all with the same quality and service. Bought laptops for our whole team — zero issues.",
      name: "Rahul Pradhan",
      role: "IT Manager",
      rating: 5,
    },
  ];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollAmount = 240;

    container.scrollBy({
      left: dir === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentReview((p) => (p === reviews.length - 1 ? 0 : p + 1)),
      5500,
    );
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (diff > 50)
      setCurrentReview((p) => (p === 0 ? reviews.length - 1 : p - 1));
    else if (diff < -50)
      setCurrentReview((p) => (p === reviews.length - 1 ? 0 : p + 1));
    setIsDragging(false);
  };

  const buildTiers = [
    {
      tier: "Smart Price",
      tagline: "Best Budget Desktop for Everyday Use",
      price: "₹10,999",
      oldPrice: "₹14,999",
      color: "#f59e0b",
      bg: "linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%)",
      dark: false,
      featured: false,
      specs: [
        "Intel Core i3 (3rd Gen)",
        "4GB RAM + 128GB SSD",
        '19" Monitor Full Set',
        "Keyboard + Mouse Included",
      ],
      ideal: "Students, Home Use, Basic Work",
    },

    {
      tier: "Balanced Performance",
      tagline: "Smooth Multitasking & Office Work",
      price: "₹24,999",
      oldPrice: "₹33,999",
      color: "#6366f1",
      bg: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
      dark: true,
      featured: true,
      specs: [
        "Intel Core i5 (6th Gen)",
        "8GB DDR4 RAM",
        "512GB SSD Storage",
        '22" Monitor + Full Setup',
      ],
      ideal: "Office Work, Students, Business Use",
    },

    {
      tier: "Refurbished Pick",
      tagline: "Certified Refurbished Laptops",
      price: "₹12,999",
      oldPrice: "₹28,000",
      color: "#ec4899",
      bg: "linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)",
      dark: false,
      featured: false,
      specs: [
        "Grade A Refurbished Laptops",
        "Intel i3–i5 / 4–8GB RAM",
        "SSD Upgraded Storage",
        "6-Month Infofix Warranty",
      ],
      ideal: "Students, Budget Buyers, First Laptop",
    },
  ];
  const whyUs = [
    {
      icon: TrendingUp,
      title: "Lowest Prices, Guaranteed",
      desc: "We match or beat any verified competitor price in West Bengal. No hidden fees, no surprises.",
    },
    {
      icon: Shield,
      title: "1-Year Hardware Warranty",
      desc: "Every PC and laptop comes with a full 1-year warranty backed by our in-house service team.",
    },
    {
      icon: RefreshCw,
      title: "Certified Refurbished Quality",
      desc: "Every refurbished laptop is professionally tested, SSD-upgraded, and backed by warranty — delivering reliable performance at a much lower cost.",
    },
    {
      icon: Users,
      title: "5 Physical Stores",
      desc: "Walk in, see the hardware live, speak to our team. We're always here when you need us.",
    },
    {
      icon: Award,
      title: "Custom Build Service",
      desc: "Tell us your budget and use case — we'll hand-pick every component for maximum value.",
    },
    {
      icon: Clock,
      title: "Same-Day Ready",
      desc: "Most configurations available same-day. Pre-orders built and delivered within 48 hours.",
    },
  ];

  return (
    <div className="flex flex-col page-enter">
      <style>{`
  /* ── KEYFRAMES ── */
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes pulseGlobal { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
  @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes barAnim { 0%,100%{opacity:0.3} 50%{opacity:1} }
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

  @keyframes heroFadeUp {
    0% { opacity:0; transform:translateY(40px) scale(0.97); }
    100% { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes heroSlideRight {
    0% { opacity:0; transform:translateX(-60px); }
    100% { opacity:1; transform:translateX(0); }
  }
  @keyframes heroSlideLeft {
    0% { opacity:0; transform:translateX(60px); }
    100% { opacity:1; transform:translateX(0); }
  }
  @keyframes revealUp {
    0% { opacity:0; transform:translateY(50px) scale(0.96); }
    100% { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes revealLeft {
    0% { opacity:0; transform:translateX(-70px); }
    100% { opacity:1; transform:translateX(0); }
  }
  @keyframes revealRight {
    0% { opacity:0; transform:translateX(70px); }
    100% { opacity:1; transform:translateX(0); }
  }
  @keyframes scaleIn {
    0% { opacity:0; transform:scale(0.85); }
    100% { opacity:1; transform:scale(1); }
  }
  @keyframes fadeIn {
    0% { opacity:0; }
    100% { opacity:1; }
  }

  /* ── PAGE ENTER ── */
  .page-enter { animation: fadeIn 0.5s ease forwards; }

 /* ── HERO SECTION ENTER ── */
.hero-section {
  opacity: 1; /* section itself doesn't animate — children do */
}

/* Hero LEFT panel: slides in from left */
.hero-carousel-wrap {
  opacity: 0;
  transform: translateX(-80px) scale(0.97);
  animation: heroSlideInLeft 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
}

/* Hero RIGHT promo stack: slides in from right */
.hero-promo-stack {
  opacity: 0;
  transform: translateX(80px) scale(0.97);
  animation: heroSlideInRight 0.9s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
}

/* Hero RIGHT promo cards stagger (desktop) */
.hero-promo-stack > * {
  opacity: 0;
  transform: translateX(60px);
  animation: heroCardIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
}
.hero-promo-stack > *:nth-child(1) { animation-delay: 0.35s; }
.hero-promo-stack > *:nth-child(2) { animation-delay: 0.48s; }
.hero-promo-stack > *:nth-child(3) { animation-delay: 0.61s; }

/* Mobile: hero carousel slides up from bottom */
.hero-carousel-mobile {
  opacity: 0;
  transform: translateY(50px) scale(0.97);
  animation: heroFadeUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
}

/* Mobile promo 3-col: cards drop in from top, staggered */
.hero-mobile-promos > * {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
  animation: heroDropIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards;
}
.hero-mobile-promos > *:nth-child(1) { animation-delay: 0.5s; }
.hero-mobile-promos > *:nth-child(2) { animation-delay: 0.62s; }
.hero-mobile-promos > *:nth-child(3) { animation-delay: 0.74s; }

@keyframes heroSlideInLeft {
  0% { opacity:0; transform:translateX(-80px) scale(0.97); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes heroSlideInRight {
  0% { opacity:0; transform:translateX(80px) scale(0.97); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes heroCardIn {
  0% { opacity:0; transform:translateX(60px); }
  100% { opacity:1; transform:translateX(0); }
}
@keyframes heroFadeUp {
  0% { opacity:0; transform:translateY(50px) scale(0.97); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes heroDropIn {
  0% { opacity:0; transform:translateY(-30px) scale(0.95); }
  100% { opacity:1; transform:translateY(0) scale(1); }
}

  /* ── SCROLL-REVEAL BASE ── */
  .reveal {
    opacity: 0;
    transform: translateY(50px) scale(0.96);
    transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                transform 0.75s cubic-bezier(0.22,1,0.36,1);
    will-change: opacity, transform;
  }
  .reveal.from-left {
    transform: translateX(-70px);
  }
  .reveal.from-right {
    transform: translateX(70px);
  }
  .reveal.scale {
    transform: scale(0.88);
  }
  .reveal.visible {
    opacity: 1 !important;
    transform: translateY(0) translateX(0) scale(1) !important;
  }

  /* ── STAGGER CHILDREN ── */
  .stagger-children > * {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
                transform 0.6s cubic-bezier(0.22,1,0.36,1);
    will-change: opacity, transform;
  }
  .stagger-children.visible > *:nth-child(1) { opacity:1; transform:none; transition-delay:0s; }
  .stagger-children.visible > *:nth-child(2) { opacity:1; transform:none; transition-delay:0.08s; }
  .stagger-children.visible > *:nth-child(3) { opacity:1; transform:none; transition-delay:0.16s; }
  .stagger-children.visible > *:nth-child(4) { opacity:1; transform:none; transition-delay:0.24s; }
  .stagger-children.visible > *:nth-child(5) { opacity:1; transform:none; transition-delay:0.32s; }
  .stagger-children.visible > *:nth-child(6) { opacity:1; transform:none; transition-delay:0.40s; }

  /* ── MISC ── */
  .shimmer-text {
    background: linear-gradient(90deg,#6366f1 0%,#818cf8 40%,#4f46e5 60%,#6366f1 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }
 .card-hover { transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease; }
.card-hover:hover { transform: translateY(-10px) scale(1.02) !important; }
  .pulse-dot { animation: pulseGlobal 2s ease infinite; }
  .sidebar-scroll::-webkit-scrollbar { display: none; }
`}</style>

      {/* ══════════ HERO ══════════ */}
      <section className="bg-white py-3 border-gray-800 hero-section">
        <div className="px-3 lg:px-20">
          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_320px] gap-4 hero-carousel-wrap">
            <HeroCarousel
              onShop={() => {
                setCurrentPage("shop");
              }}
              onContact={() => setCurrentPage("contact")}
            />
            <div className="flex flex-col gap-3 hero-promo-stack">
              <div
                onClick={() => setCurrentPage("shop")}
                className="cursor-pointer group relative flex-1 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
                  border: "1px solid #3730a3",
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2">
                      Limited Time
                    </span>
                    <h3 className="text-white font-black text-xl leading-tight">
                      OFFER
                      <br />
                      ZONE
                    </h3>
                    <p className="text-indigo-200 text-xs mt-1 font-medium">
                      Up to 40% off on select devices
                    </p>
                  </div>
                  <button className="mt-3 self-start bg-white text-indigo-700 text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-wider hover:bg-indigo-50 transition-colors flex items-center gap-1">
                    Shop Now <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div
                onClick={() => {
                  setSelectedCategory("Laptop");
                  setCurrentPage("shop");
                }}
                className="cursor-pointer group relative flex-1 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg,#064e3b 0%,#065f46 100%)",
                  border: "1px solid #047857",
                }}
              >
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2">
                      New Stock
                    </span>
                    <h3 className="text-white font-black text-xl leading-tight">
                      LAPTOPS
                      <br />
                      ARE HERE
                    </h3>
                    <p className="text-emerald-200 text-xs mt-1 font-medium">
                      Latest models · All budgets
                    </p>
                  </div>
                  <button className="mt-3 self-start bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div
                onClick={() => {
                  setSelectedCategory("Laptop");
                  setCurrentPage("shop");
                }}
                className="cursor-pointer group relative flex-1 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg,#500724 0%,#881337 100%)",
                  border: "1px solid #9f1239",
                }}
              >
                <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2">
                      Best Value
                    </span>
                    <h3 className="text-white font-black text-xl leading-tight">
                      REFURB
                      <br />
                      LAPTOPS
                    </h3>
                    <p className="text-pink-200 text-xs mt-1 font-medium">
                      From ₹12,999 · Warranted
                    </p>
                  </div>
                  <button className="mt-3 self-start bg-pink-500 text-white text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-wider hover:bg-pink-400 transition-colors flex items-center gap-1">
                    Shop <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-2 hero-carousel-mobile">
            <HeroCarousel
              onShop={() => {
                setSelectedCategory("Desktop");
                setCurrentPage("shop");
              }}
              onContact={() => setCurrentPage("contact")}
            />
            {/* Mobile promo — 3 horizontal compact cards */}
            <div className="grid grid-cols-3 gap-2 hero-mobile-promos">
              {[
                {
                  badge: "Sale",
                  badgeBg: "bg-red-500",
                  title: "Offer Zone",
                  sub: "Up to 40% off",
                  btnLabel: "Shop",
                  grad: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
                  border: "#3730a3",
                  action: () => setCurrentPage("shop"),
                },
                {
                  badge: "New",
                  badgeBg: "bg-emerald-500",
                  title: "Laptops",
                  sub: "All budgets",
                  btnLabel: "View",
                  grad: "linear-gradient(135deg,#064e3b 0%,#065f46 100%)",
                  border: "#047857",
                  action: () => {
                    setSelectedCategory("Laptop");
                    setCurrentPage("shop");
                  },
                },
                {
                  badge: "Value",
                  badgeBg: "bg-pink-500",
                  title: "Refurbished",
                  sub: "From ₹12,999",
                  btnLabel: "Shop",
                  grad: "linear-gradient(135deg,#500724 0%,#881337 100%)",
                  border: "#9f1239",
                  action: () => {
                    setSelectedCategory("Laptop");
                    setCurrentPage("shop");
                  },
                },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={card.action}
                  className="cursor-pointer relative rounded-xl overflow-hidden flex flex-col justify-between p-3"
                  style={{
                    background: card.grad,
                    border: `1px solid ${card.border}`,
                    minHeight: 90,
                  }}
                >
                  <div>
                    <span
                      className={`inline-block ${card.badgeBg} text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest mb-1.5`}
                    >
                      {card.badge}
                    </span>
                    <h3 className="text-white font-black text-xs leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-white/60 text-[9px] mt-0.5 font-medium">
                      {card.sub}
                    </p>
                  </div>
                  <button className="mt-2 self-start bg-white/15 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                    {card.btnLabel} <ArrowRight className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TRUST ══════════ */}
      <section
        className="py-8 md:py-12 bg-white border-b border-gray-100"
        ref={counterRef}
      >
        <div className="app-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 stagger-children">
            {[
              {
                count: counts.customers,
                suffix: "+",
                label: "Happy Customers",
                icon: Users,
                color: "#6366f1",
              },
              {
                count: counts.stores,
                suffix: " Stores",
                label: "Across West Bengal",
                icon: MapPin,
                color: "#10b981",
              },
              {
                count: counts.products,
                suffix: "+",
                label: "Products Available",
                icon: Package,
                color: "#f59e0b",
              },
              {
                count: counts.years,
                suffix: " Years",
                label: "Trusted Since 2017",
                icon: Award,
                color: "#ef4444",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 md:gap-2 bg-gray-50 border border-gray-100 rounded-2xl py-4 md:py-6 px-3 md:px-4"
              >
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
                  style={{ background: item.color + "18" }}
                >
                  <item.icon
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: item.color }}
                  />
                </div>
                <div className="text-xl md:text-2xl font-black text-gray-900 tracking-tight tabular-nums">
                  {item.count.toLocaleString()}
                  {item.suffix}
                </div>
                <div className="text-[10px] md:text-xs font-semibold text-gray-400 text-center leading-tight">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BROWSE BY CATEGORY ══════════ */}
      <section className="py-10 md:py-24 bg-gray-50">
        <div className="app-container">
          <div className="text-center mb-6 md:mb-14 reveal">
            <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 md:mb-3">
              What Are You Looking For?
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900">
              Browse by Category
            </h2>
            <p className="text-gray-500 font-medium mt-1.5 md:mt-3 text-sm md:text-base max-w-xl mx-auto hidden md:block">
              Every device, every budget, in stock now across our 5 stores.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 stagger-children">
            {[
              {
                label: "Desktop PCs",
                sub: "Daily computing, study & work",
                badge: "Most Popular",
                badgeColor: "#6366f1",
                from: "10,999",
                dark: false,
                icon: <Monitor className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => {
                  setSelectedCategory("Desktop");
                  setCurrentPage("shop");
                },
              },
              {
                label: "Laptops",
                sub: "Slim · Powerful · All brands",
                badge: "New Stock",
                badgeColor: "#10b981",
                from: "₹22,999",
                dark: false,
                icon: <Laptop className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => {
                  setSelectedCategory("Laptop");
                  setCurrentPage("shop");
                },
              },
              {
                label: "Gaming Desktops",
                sub: "RTX GPU · High FPS · RGB",
                badge: "Top Sellers",
                badgeColor: "#ef4444",
                from: "14,999",
                dark: true,
                icon: <Zap className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => {
                  setSelectedCategory("Desktop");
                  setHeaderSearchQuery("gaming");
                  setCurrentPage("shop");
                },
              },
              {
                label: "Refurbished Laptops",
                sub: "Tested · Restored · Warranted",
                badge: "Best Value",
                badgeColor: "#ec4899",
                from: "₹12,999",
                dark: false,
                icon: <RefreshCw className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => {
                  setSelectedCategory("Laptop");
                  setCurrentPage("shop");
                },
              },
              {
                label: "Custom PC Builds",
                sub: "Built for your exact needs",
                badge: "Popular",
                badgeColor: "#8b5cf6",
                from: "11,499",
                dark: false,
                icon: <Cpu className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => setCurrentPage("contact"),
              },
              {
                label: "Components",
                sub: "RAM · SSD · GPU · CPU",
                badge: "All Brands",
                badgeColor: "#06b6d4",
                from: "₹999",
                dark: true,
                icon: <MemoryStick className="w-6 h-6 md:w-8 md:h-8" />,
                action: () => {
                  setSelectedCategory(null);
                  setHeaderSearchQuery("components");
                  setCurrentPage("shop");
                },
              },
            ].map((cat, i) => (
              <div
                key={i}
                onClick={cat.action}
                className={`card-hover cursor-pointer group relative overflow-hidden ${cat.dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200/60"} border p-4 md:p-8 rounded-2xl flex flex-col gap-2 md:gap-3`}
                style={{ minHeight: 140 }}
              >
                <div
                  className="absolute -top-6 -right-6 w-20 h-20 md:w-24 md:h-24 rounded-full transition-transform duration-500 group-hover:scale-150"
                  style={{ background: cat.badgeColor + "15" }}
                />
                <span
                  className="self-start text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg"
                  style={{
                    background: cat.badgeColor + "20",
                    color: cat.badgeColor,
                  }}
                >
                  {cat.badge}
                </span>
                <div
                  className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: cat.badgeColor + "15",
                    color: cat.badgeColor,
                  }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-black text-xs md:text-base leading-snug ${cat.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {cat.label}
                  </h3>
                  <p
                    className={`text-[10px] md:text-xs mt-0.5 font-medium hidden sm:block ${cat.dark ? "text-white/55" : "text-gray-400"}`}
                  >
                    {cat.sub}
                  </p>
                </div>
                <div
                  className={`flex items-center justify-between mt-auto pt-2 md:pt-3 border-t ${cat.dark ? "border-white/10" : "border-gray-100"}`}
                >
                  <div>
                    <span
                      className={`text-[9px] md:text-[10px] font-semibold ${cat.dark ? "text-white/40" : "text-gray-400"}`}
                    >
                      From
                    </span>
                    <div
                      className="text-sm md:text-lg font-black"
                      style={{ color: cat.badgeColor }}
                    >
                      {cat.from}
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                    style={{
                      background: cat.badgeColor + "15",
                      color: cat.badgeColor,
                    }}
                  >
                    <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ABOUT — */}
      <section className="py-10 md:py-24 bg-gray-900 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.1) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative app-container grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-5 reveal from-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />{" "}
              Durgapur's Most Trusted Tech Store
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Not just a store.
              <br />
              <span className="shimmer-text">Your tech partner.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed font-medium text-sm md:text-base">
              Infofix Computers has been West Bengal's go-to destination for
              desktops, laptops, and computer components since 2017. With 5
              physical stores, an expert in-house service team, and prices that
              no one can beat — we don't just sell technology, we back it up.
            </p>
            <div className="flex gap-3 pt-1 flex-wrap">
              <button
                onClick={() => setCurrentPage("about")}
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-5 md:px-7 py-3 md:py-3.5 rounded-2xl font-black text-sm transition-all"
              >
                Our Story →
              </button>
              <button
                onClick={() => setCurrentPage("branches")}
                className="cursor-pointer border border-gray-700 text-gray-300 hover:border-indigo-500 hover:text-white px-5 md:px-7 py-3 md:py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Find Store
              </button>
            </div>
          </div>
          {/* On mobile: compact 2x2 grid */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 stagger-children">
            {[
              {
                title: "Certified Builds",
                desc: "Every PC tested before delivery",
                icon: "🛡️",
              },
              {
                title: "Price Match",
                desc: "Show us lower — we'll beat it",
                icon: "💰",
              },
              {
                title: "Walk-in Welcome",
                desc: "5 stores. Real hardware.",
                icon: "🏪",
              },
              {
                title: "After-Sales Care",
                desc: "1-year warranty included",
                icon: "🔧",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 md:p-5 space-y-1.5 md:space-y-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-xl md:text-2xl">{item.icon}</div>
                <div className="text-white font-black text-xs md:text-sm">
                  {item.title}
                </div>
                <div className="text-gray-500 text-[10px] md:text-xs font-medium leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BEST DEALS ══════════ */}
      <section className="py-10 md:py-28 app-container">
        <div className="flex items-end justify-between mb-6 md:mb-16 reveal">
          <div className="space-y-1 md:space-y-4">
            <h2 className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
              Featured Collection
            </h2>
            <h3 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight">
              Best Deals You Can't Miss
            </h3>
          </div>
          <button
            onClick={() => setCurrentPage("shop")}
            className="cursor-pointer text-gray-900 font-black hidden md:flex items-center gap-2 hover:text-indigo-600 transition-colors"
          >
            View All Deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 stagger-children">
          {featured.length > 0
            ? featured.map((product) => (
                <div
                  key={product.id}
                  onClick={async () => {
                    try {
                      const { data } = await supabase
                        .from("products")
                        .select(
                          `
        id, name, description, image_url, images,
        retail_price, discount_percent, discounted_price,
        stock_quantity, condition, brand, specs,
        rating_avg, rating_count, reviews_count, likes_count,
        categories ( name, slug ),
        subcategories ( name, slug ), model
      `,
                        )
                        .eq("id", product.id)
                        .single();

                      if (data) {
                        const disc = data.discount_percent ?? 0;
                        const imageUrl = data.image_url ?? "";
                        const fullProduct = {
                          id: String(data.id),
                          name: data.name ?? "",
                          description: data.description ?? "",
                          image: imageUrl,
                          images:
                            Array.isArray(data.images) && data.images.length > 0
                              ? data.images
                              : [imageUrl],
                          price: Number(
                            data.discounted_price ?? data.retail_price ?? 0,
                          ),
                          retailPrice:
                            disc > 0 ? Number(data.retail_price) : undefined,
                          discountPercent: disc,
                          stock: data.stock_quantity ?? 99,
                          condition: data.condition ?? "New",
                          category: data.categories?.[0]?.name ?? "",
                          brand: data.brand ?? "",
                          specs: data.specs
                            ? Object.values(
                                data.specs as Record<string, unknown>,
                              ).map(String)
                            : [],
                          rating: Number(data.rating_avg ?? 0),
                          reviews: data.reviews_count ?? data.rating_count ?? 0,
                          likesCount: data.likes_count ?? 0,
                          tags: [],
                          model: data.model ?? "",
                        };
                        sessionStorage.setItem(
                          "selectedProduct",
                          JSON.stringify(fullProduct),
                        );
                      } else {
                        // fallback: use what we have with all available images
                        sessionStorage.setItem(
                          "selectedProduct",
                          JSON.stringify({
                            id: String(product.id),
                            name: product.name,
                            description: "",
                            image: product.image_url ?? "",
                            images:
                              Array.isArray(product.images) &&
                              product.images.length > 0
                                ? product.images
                                : [product.image_url ?? ""],
                            price: Number(
                              product.discounted_price ??
                                product.retail_price ??
                                0,
                            ),
                            retailPrice:
                              product.discount_percent > 0
                                ? Number(product.retail_price)
                                : undefined,
                            discountPercent: Number(
                              product.discount_percent ?? 0,
                            ),
                            stock: 99,
                            condition: "New",
                            category: product.categories?.name ?? "",
                            brand: "",
                            specs: [],
                            rating: 0,
                            reviews: 0,
                            likesCount: 0,
                            tags: [],
                            model: "",
                          }),
                        );
                      }
                    } catch (error) {
                      console.error("Error fetching product details:", error);

                      // fallback safely
                      sessionStorage.setItem(
                        "selectedProduct",
                        JSON.stringify({
                          id: String(product.id),
                          name: product.name ?? "",
                          description: "",
                          image: product.image_url ?? "",
                          images:
                            Array.isArray(product.images) &&
                            product.images.length > 0
                              ? product.images
                              : [product.image_url ?? ""],
                          price: Number(
                            product.discounted_price ??
                              product.retail_price ??
                              0,
                          ),
                          retailPrice:
                            product.discount_percent > 0
                              ? Number(product.retail_price)
                              : undefined,
                          discountPercent: Number(
                            product.discount_percent ?? 0,
                          ),
                          stock: 99,
                          condition: "New",
                          category: product.categories?.[0]?.name ?? "",
                          brand: "",
                          specs: [],
                          rating: 0,
                          reviews: 0,
                          likesCount: 0,
                          tags: [],
                          model: "",
                        }),
                      );
                    }
                    setCurrentPage("shop");
                  }}
                  className="group relative cursor-pointer bg-white rounded-3xl md:rounded-[40px] shadow-md md:shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-indigo-500/20 flex md:block"
                >
                  {/* Mobile: horizontal card layout */}
                  <div className="relative w-28 md:w-auto md:h-72 shrink-0 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={"Product Image Unavailable"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl shadow-lg">
                        {Math.round(product.discount_percent)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-4 md:p-8 space-y-1 md:space-y-2 flex flex-col justify-center flex-1">
                    <p className="text-[9px] md:text-xs font-black text-indigo-600 uppercase tracking-widest">
                      {product.categories?.name}
                    </p>
                    <h4 className="text-sm md:text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-snug">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2 md:gap-3">
                      <p className="text-base md:text-lg font-black text-gray-900">
                        ₹{Number(product.discounted_price).toLocaleString()}
                      </p>
                      {product.retail_price && (
                        <p className="text-xs md:text-sm text-gray-400 line-through font-medium">
                          ₹{Number(product.retail_price).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: String(product.id),
                          name: product.name,
                          image: product.image_url ?? "",
                          price: Number(
                            product.discounted_price ??
                              product.retail_price ??
                              0,
                          ),
                          category: product.categories?.name ?? "",
                          description: "",
                          stock: 99,
                          condition: "New",
                          brand: "",
                          specs: [],
                          rating: 0,
                          reviews: 0,
                          likesCount: 0,
                          tags: [],
                          discountPercent: Number(
                            product.discount_percent ?? 0,
                          ),
                        } as any);
                      }}
                      className="mt-1 w-full bg-gray-900 text-white py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center justify-center gap-1.5 md:gap-2 hover:bg-indigo-600 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> Add to
                      Cart
                    </button>
                  </div>
                </div>
              ))
            : buildTiers.map((tier, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedCategory("Desktop");
                    setCurrentPage("shop");
                  }}
                  className="card-hover cursor-pointer bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl overflow-hidden"
                >
                  <div
                    className="h-36 md:h-48 flex items-center justify-center"
                    style={{ background: i === 1 ? "#0a0a0f" : "#f8f9fa" }}
                  >
                    {i === 1 ? (
                      <Laptop className="w-14 h-14 md:w-20 md:h-20 text-indigo-400" />
                    ) : (
                      <Monitor className="w-14 h-14 md:w-20 md:h-20 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4 md:p-6 space-y-1">
                    <p className="text-[9px] md:text-xs font-black text-indigo-600 uppercase tracking-widest">
                      {i === 1 ? "Laptop" : "Desktop PC"}
                    </p>
                    <h4 className="text-base md:text-lg font-black text-gray-900">
                      Infofix {tier.tier} Build
                    </h4>
                    <div className="text-lg md:text-xl font-black text-gray-900">
                      {tier.price}
                    </div>
                  </div>
                </div>
              ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => setCurrentPage("shop")}
            className="md:hidden bg-indigo-600 text-white px-7 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
          >
            View All Deals
          </button>
        </div>
      </section>

      {/* ══════════ CONFIGURATION TIERS ══════════ */}
      <section className="py-10 md:py-24 bg-gray-50 overflow-hidden">
        <div className="app-container">
          <div className="text-center mb-6 md:mb-14 reveal">
            <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 md:mb-2">
              Pick Your Power
            </p>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight">
              PCs & Laptops for Every Need
            </h2>
            <p className="text-gray-500 font-medium mt-1.5 md:mt-3 text-sm hidden md:block">
              Every tier built, tested, and ready to ship from our warehouse.
            </p>
          </div>
          {/* Mobile: horizontal scroll tiers */}
          <div className="grid md:hidden grid-cols-1 gap-4">
            {buildTiers.map((tier, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentPage("shop");
                }}
                className={`card-hover cursor-pointer relative rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg ${
                  tier.featured
                    ? "shadow-xl shadow-indigo-500/20"
                    : "hover:shadow-lg hover:shadow-indigo-500/10"
                }`}
                style={{
                  background: tier.bg || "#fff",
                  border: tier.featured
                    ? "2px solid #6366f1"
                    : "1px solid #e5e7eb",
                }}
              >
                {(tier as any).featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    ★ Most Popular
                  </div>
                )}
                <div>
                  <div
                    className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                    style={{ color: tier.color }}
                  >
                    {tier.tier}
                  </div>
                  <div
                    className={`text-base font-black tracking-tight ${tier.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.tagline}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-black tracking-tight ${tier.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-xs line-through font-medium ${tier.dark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {tier.oldPrice}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {tier.specs.map((spec, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-3 h-3 shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span
                        className={`text-xs font-semibold ${tier.dark ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-80 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: tier.color, color: "#fff" }}
                >
                  Shop {tier.tier} →
                </button>
              </div>
            ))}
          </div>
          {/* Desktop: standard grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 items-center stagger-children">
            {buildTiers.map((tier, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentPage("shop");
                }}
                className={`card-hover cursor-pointer relative rounded-4xl p-8 flex flex-col gap-5 ${tier.featured ? "md:-mt-6 shadow-2xl shadow-indigo-500/20" : "shadow-sm hover:shadow-xl hover:shadow-indigo-500/15"}`}
                style={{
                  background: tier.bg,
                  border: tier.featured
                    ? "2px solid #6366f1"
                    : "1px solid #e5e7eb",
                }}
              >
                {(tier as any).featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    ★ Most Popular
                  </div>
                )}
                <div>
                  <div
                    className="text-xs font-black uppercase tracking-widest mb-1"
                    style={{ color: tier.color }}
                  >
                    {tier.tier}
                  </div>
                  <div
                    className={`text-2xl font-black tracking-tight ${tier.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.tagline}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-black tracking-tight ${tier.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm line-through font-medium ${tier.dark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {tier.oldPrice}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {tier.specs.map((spec, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span
                        className={`text-sm font-semibold ${tier.dark ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="text-xs font-bold px-3 py-1.5 rounded-lg self-start"
                  style={{ background: tier.color + "15", color: tier.color }}
                >
                  Ideal for: {tier.ideal}
                </div>
                <button
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all`}
                  style={{ background: tier.color, color: "#fff" }}
                >
                  Shop {tier.tier} →
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs md:text-sm text-gray-400 font-medium mt-5 md:mt-10">
            Need something custom?{" "}
            <button
              onClick={() => setCurrentPage("contact")}
              className="text-indigo-600 font-black hover:underline"
            >
              Talk to our experts →
            </button>
          </p>
        </div>
      </section>

      {/* ══════════ WHY INFOFIX ══════════ */}
      <section className="py-10 md:py-24 bg-white">
        <div className="app-container">
          <div className="text-center mb-6 md:mb-14 reveal">
            <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 md:mb-2">
              Why 50,000+ Customers Choose Us
            </p>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight">
              The Infofix Difference
            </h2>
          </div>
          {/* Mobile: 2-col compact grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 stagger-children">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="group p-4 md:p-7 rounded-2xl md:rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h4 className="font-black text-gray-900 text-xs md:text-lg mb-1 md:mb-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-[10px] md:text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CUSTOMER REVIEWS ══════════ */}
      <section className="py-10 md:py-28 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 md:px-4 text-center mb-8 md:mb-16 reveal">
          <h2 className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
            Testimonials
          </h2>
          <h3 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight mt-1">
            What Our Customers Say
          </h3>
          <div className="flex items-center justify-center gap-1 mt-2 md:mt-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="text-xs md:text-sm font-bold text-gray-500 ml-2">
              4.9 · 300+ Reviews
            </span>
          </div>
        </div>
        <div
          className="relative max-w-6xl mx-auto h-64 md:h-80 flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => {
            setIsDragging(true);
            setStartX(e.touches[0].clientX);
          }}
          onTouchEnd={(e) => {
            if (!isDragging) return;
            const diff = e.changedTouches[0].clientX - startX;
            if (diff > 50)
              setCurrentReview((p) => (p === 0 ? reviews.length - 1 : p - 1));
            else if (diff < -50)
              setCurrentReview((p) => (p === reviews.length - 1 ? 0 : p + 1));
            setIsDragging(false);
          }}
        >
          {reviews.map((review, index) => {
            const pos =
              index === currentReview
                ? "center"
                : index ===
                    (currentReview - 1 + reviews.length) % reviews.length
                  ? "left"
                  : index === (currentReview + 1) % reviews.length
                    ? "right"
                    : "hidden";
            return (
              <div
                key={index}
                className={`absolute transition-all duration-700 ease-in-out ${pos === "center" ? "opacity-100 scale-100 z-20 translate-x-0" : pos === "left" ? "opacity-40 scale-90 -translate-x-[65%] z-10" : pos === "right" ? "opacity-40 scale-90 translate-x-[65%] z-10" : "opacity-0 scale-75"}`}
              >
                <div className="w-70 md:w-130 bg-white rounded-3xl md:rounded-[36px] p-6 md:p-10 shadow-xl shadow-gray-200/60 border border-gray-100">
                  <div className="flex gap-1 mb-3 md:mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed text-xs md:text-base mb-4 md:mb-6 italic">
                    "{review.text}"
                  </p>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs md:text-sm shrink-0">
                      {review.name[0]}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-xs md:text-sm">
                        {review.name}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-400 font-medium">
                        {review.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-2 md:gap-3 mt-8 md:mt-12">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              className={`rounded-full transition-all ${currentReview === i ? "w-5 h-2.5 md:w-6 md:h-3 bg-indigo-600" : "w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-300"}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════ WE'RE CLOSER ══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0a0a0f", minHeight: 320 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative app-container py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 reveal from-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />{" "}
              5 Stores · Durgapur &amp; nearby
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              We're closer
              <br />
              than you think.
            </h2>
            <p className="text-gray-400 leading-relaxed font-medium text-sm md:text-base max-w-md">
              No waiting for couriers. Walk into any of our 5 stores, see the
              hardware in person, and walk out same day.
            </p>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {[
                {
                  label: "Infofix Showroom, Benachity",
                  detail: "Main branch · Open daily",
                },
                {
                  label: "Infofix Shop, Benachity",
                  detail: "Electronics hub · Fast service",
                },
                {
                  label: "Infofix Asansol",
                  detail: "Trusted by 1000+ customers",
                },
                { label: "Infofix Ukhra", detail: "Reliable & fast delivery" },
              ].map((store, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl md:rounded-2xl px-3 py-2.5 md:px-4 md:py-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <MapPin className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white font-black text-[10px] md:text-xs">
                      {store.label}
                    </div>
                    <div className="text-gray-500 text-[9px] md:text-[10px] font-medium">
                      {store.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setCurrentPage("branches")}
                className="cursor-pointer flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider transition-all hover:opacity-90"
                style={{ background: "#6366f1" }}
              >
                <MapPin className="w-4 h-4" /> View All Stores
              </button>
              <button
                onClick={() => setCurrentPage("contact")}
                className="cursor-pointer flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:bg-white/10"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#9ca3af",
                }}
              >
                <Phone className="w-4 h-4" /> Call Us
              </button>
            </div>
          </div>
          {/* Right stat cards — hidden on mobile to save space, shown on desktop */}
          <div className="hidden md:grid grid-cols-2 gap-4 stagger-children">
            {[
              {
                number: "5",
                label: "Physical Stores",
                sub: "Across Durgapur region",
                color: "#6366f1",
                icon: MapPin,
              },
              {
                number: "Same Day",
                label: "Walk-in Service",
                sub: "No appointment needed",
                color: "#10b981",
                icon: Clock,
              },
              {
                number: "8+",
                label: "Years Serving",
                sub: "Durgapur since 2017",
                color: "#f59e0b",
                icon: Award,
              },
              {
                number: "50,000+",
                label: "Happy Customers",
                sub: "And counting",
                color: "#818cf8",
                icon: Users,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-3xl p-6 flex flex-col gap-3 transition-all hover:-translate-y-1 duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: stat.color + "20" }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {stat.number}
                  </div>
                  <div className="text-sm font-black text-white/80">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    {stat.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section className="py-10 md:py-24 app-container text-center">
        <div className="mb-6 md:mb-12 reveal">
          <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 md:mb-2">
            What We Offer
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-gray-900">
            Complete Tech Solutions
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 stagger-children">
          {[
            {
              title: "New PCs & Laptops",
              desc: "All configs, all budgets. Built & tested in-house.",
              icon: Monitor,
              color: "#6366f1",
            },
            {
              title: "PC & Laptop Repair",
              desc: "Hardware faults, OS reinstall — fast turnaround.",
              icon: Wrench,
              color: "#10b981",
            },
            {
              title: "Custom PC Builds",
              desc: "We pick the best parts for your money.",
              icon: Cpu,
              color: "#f59e0b",
            },
            {
              title: "Certified Refurbished",
              desc: "Tested, upgraded, and warranty-backed laptops at affordable prices.",
              icon: RefreshCw,
              color: "#ec4899",
            },
          ].map((svc, i) => (
            <div
              key={i}
              onClick={() => setCurrentPage("services")}
              className="cursor-pointer group p-4 md:p-7 rounded-2xl md:rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: svc.color + "15" }}
              >
                <svc.icon
                  className="w-4 h-4 md:w-5 md:h-5"
                  style={{ color: svc.color }}
                />
              </div>
              <h4 className="font-black text-gray-900 text-xs md:text-base mb-1 md:mb-1.5 leading-snug">
                {svc.title}
              </h4>
              <p className="text-gray-500 text-[10px] md:text-sm font-medium leading-relaxed">
                {svc.desc}
              </p>
              <div className="mt-3 md:mt-4 flex items-center justify-center gap-1 text-[10px] md:text-xs font-black text-indigo-600 group-hover:gap-2 transition-all">
                Learn more{" "}
                <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCurrentPage("services")}
          className="mt-6 md:mt-12 bg-indigo-600 hover:bg-indigo-500 text-white px-7 md:px-8 py-3 md:py-4 rounded-2xl font-bold cursor-pointer transition-all text-sm"
        >
          View All Services
        </button>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#0a0a0f", minHeight: 320 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="relative app-container py-10 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 reveal from-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />{" "}
              Need Help Choosing?
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Confused what to buy?
            </h2>
            <p className="text-gray-400 leading-relaxed font-medium text-sm md:text-base max-w-md">
              Tell us your budget and use-case — gaming, office, editing or
              study. Our experts will suggest the best option for you.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setCurrentPage("contact")}
                className="cursor-pointer flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider transition-all hover:opacity-90"
                style={{ background: "#6366f1" }}
              >
                Get Expert Help →
              </button>
              <button
                onClick={() => setCurrentPage("shop")}
                className="cursor-pointer flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:bg-white/10"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#9ca3af",
                }}
              >
                Browse Products
              </button>
            </div>
          </div>
          {/* CTA cards — 2x2 on mobile, 2x2 on desktop */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 stagger-children">
            {[
              {
                title: "Custom PC",
                desc: "Built for your workload",
                color: "#6366f1",
                icon: Cpu,
              },
              {
                title: "Laptop Guide",
                desc: "Best for your budget",
                color: "#10b981",
                icon: Laptop,
              },
              {
                title: "Upgrade Help",
                desc: "RAM, SSD, GPU advice",
                color: "#f59e0b",
                icon: MemoryStick,
              },
              {
                title: "Instant Support",
                desc: "Talk to our experts",
                color: "#818cf8",
                icon: Phone,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col gap-2 md:gap-3 transition-all hover:-translate-y-1 duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
                  style={{ background: item.color + "20" }}
                >
                  <item.icon
                    className="w-4 h-4 md:w-5 md:h-5"
                    style={{ color: item.color }}
                  />
                </div>
                <div>
                  <div className="text-sm md:text-lg font-black text-white">
                    {item.title}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
