import React, { useState, useEffect, useCallback } from "react";

const slides = [
  {
    eyebrow: "New Arrival 2025",
    headline: "Built for",
    accent: "Power Users",
    accentColor: "#818cf8",
    glowColor: "rgba(99,102,241,0.25)",
    ledColor: "#6366f1",
    sub: "Custom-configured desktop PCs engineered for performance, reliability, and the work that matters.",
    price: "₹28,999",
    oldPrice: "₹35,000",
    specs: [
      { label: "Intel Core i5", icon: "cpu" },
      { label: "16GB DDR5 RAM", icon: "memory" },
      { label: "512GB NVMe SSD", icon: "storage" },
      { label: "Win 11 Pro", icon: "os" },
    ],
    productName: "Infofix Workstation Pro",
    productSpec: "i5 / 16GB / 512GB SSD / Win 11",
    badge: "Best Seller",
    badgeBg: "#312e81",
    badgeText: "#a5b4fc",
  },
  {
    eyebrow: "High Performance Series",
    headline: "Unleash",
    accent: "Maximum Power",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.2)",
    ledColor: "#10b981",
    sub: "Professional-grade workstations for developers, creators, and power users who demand more.",
    price: "₹62,999",
    oldPrice: "₹75,000",
    specs: [
      { label: "Intel Core i7", icon: "cpu" },
      { label: "32GB DDR5 RAM", icon: "memory" },
      { label: "1TB NVMe SSD", icon: "storage" },
      { label: "RTX GPU Included", icon: "gpu" },
    ],
    productName: "Infofix Power i7 Edition",
    productSpec: "i7 / 32GB / 1TB NVMe / RTX",
    badge: "Top Pick",
    badgeBg: "#052e16",
    badgeText: "#6ee7b7",
  },
  {
    eyebrow: "Best Value Pick",
    headline: "Smart Tech,",
    accent: "Smart Price",
    accentColor: "#f59e0b",
    glowColor: "rgba(245,158,11,0.2)",
    ledColor: "#f59e0b",
    sub: "Ideal for students, home offices, and everyday computing. Reliable performance at an honest price.",
    price: "₹18,499",
    oldPrice: "₹22,000",
    specs: [
      { label: "Intel Core i3", icon: "cpu" },
      { label: "8GB DDR4 RAM", icon: "memory" },
      { label: "256GB SSD", icon: "storage" },
      { label: "Win 11 Home", icon: "os" },
    ],
    productName: "Infofix Essential i3",
    productSpec: "i3 / 8GB / 256GB SSD / Win 11",
    badge: "Budget Friendly",
    badgeBg: "#1c1007",
    badgeText: "#fcd34d",
  },
];

const tickerItems = [
  { highlight: "FREE", text: "Same-day city delivery" },
  { highlight: "1 Year", text: "Hardware warranty" },
  { highlight: "Custom", text: "Configurations available" },
  { highlight: "Expert", text: "In-house technicians" },
  { highlight: "COD", text: "Available in India" },
];

const SpecIcon: React.FC<{ type: string; color: string }> = ({
  type,
  color,
}) => {
  const props = {
    width: 12,
    height: 12,
    fill: "none",
    stroke: color,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };
  if (type === "cpu")
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
    );
  if (type === "memory")
    return (
      <svg {...props}>
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    );
  if (type === "storage")
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    );
  if (type === "gpu")
    return (
      <svg {...props}>
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <path d="M6 7V5M10 7V5M14 7V5M18 7V5M6 17v2M10 17v2M14 17v2M18 17v2" />
      </svg>
    );
  return (
    <svg {...props}>
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
    </svg>
  );
};

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const slide = slides[current];

  const goTo = useCallback(
    (idx: number) => {
      if (animating || idx === current) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 200);
    },
    [animating, current],
  );

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [current, goTo]);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-[#0a0a0f] flex flex-col"
      style={{ minHeight: 460 }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: 2,
          background: `linear-gradient(90deg, #6366f1, #818cf8, #6366f1)`,
        }}
      />

      {/* Main body */}
      <div className="flex flex-col md:grid md:grid-cols-2 flex-1">
        {/* LEFT — Content */}
        <div
          className="flex flex-col justify-between p-8 lg:p-10"
          style={{ transition: "opacity 0.2s", opacity: animating ? 0 : 1 }}
        >
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: slide.accentColor,
                  boxShadow: `0 0 6px ${slide.accentColor}`,
                  animation: "pulse 2s ease infinite",
                }}
              />
              <span
                className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: slide.accentColor }}
              >
                {slide.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-black leading-[1.05] tracking-tight text-white mb-3"
              style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
            >
              {slide.headline}
              <br />
              <span style={{ color: slide.accentColor }}>{slide.accent}</span>
            </h1>

            {/* Sub */}
            <p
              className="text-sm font-medium leading-relaxed mb-6 max-w-xs"
              style={{ color: "#6b7280" }}
            >
              {slide.sub}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-xs font-semibold"
                style={{ color: "#6b7280" }}
              >
                Starting from
              </span>
              <span
                className="font-black text-white"
                style={{ fontSize: 28, letterSpacing: "-0.04em" }}
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

            {/* Spec pills */}
            <div className="flex flex-wrap gap-2 mb-8">
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
                  <SpecIcon type={spec.icon} color={slide.accentColor} />
                  {spec.label}
                </span>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all duration-200 hover:opacity-90"
              style={{ background: slide.accentColor }}
            >
              Shop Desktops
            </button>
            <button
              className="text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:border-current"
              style={{
                background: "transparent",
                border: "1px solid #2d2d4e",
                color: "#9ca3af",
              }}
            >
              View Configs →
            </button>
          </div>
        </div>

        {/* RIGHT — Visual */}
        <div
          className="relative flex flex-col items-center justify-center py-8 px-4 overflow-hidden"
          style={{ minHeight: 280 }}
        >
          {/* BG */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 70% 70% at 60% 50%, #1e1b4b 0%, #0a0a0f 100%)`,
              transition: "background 0.4s",
            }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* PC Illustration */}
          <div
            className="relative z-10 mb-5"
            style={{
              width: 240,
              height: 190,
              transition: "opacity 0.2s",
              opacity: animating ? 0 : 1,
            }}
          >
            {/* Monitor */}
            <div
              style={{
                width: 195,
                height: 132,
                background: "#111827",
                borderRadius: 10,
                border: "2px solid #374151",
                position: "absolute",
                top: 0,
                left: 18,
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
                    fontSize: 24,
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
                    fontSize: 8,
                    color: "#4b5563",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  {slide.productName}
                </div>
                <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                  {[12, 20, 16, 22, 14].map((h, i) => (
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

            {/* Stand */}
            <div
              style={{
                width: 11,
                height: 16,
                background: "#374151",
                position: "absolute",
                bottom: 27,
                left: 111,
              }}
            />
            <div
              style={{
                width: 55,
                height: 6,
                background: "#374151",
                borderRadius: 3,
                position: "absolute",
                bottom: 22,
                left: 89,
              }}
            />

            {/* Tower */}
            <div
              style={{
                width: 42,
                height: 100,
                background: "#1f2937",
                borderRadius: 8,
                border: `1.5px solid #374151`,
                position: "absolute",
                bottom: 22,
                right: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 6px",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: slide.ledColor,
                  boxShadow: `0 0 8px ${slide.ledColor}`,
                  transition: "background 0.3s, box-shadow 0.3s",
                }}
              />
              <div
                style={{
                  width: 26,
                  height: 3,
                  background: "#374151",
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  width: 26,
                  height: 3,
                  background: "#374151",
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "2px solid #374151",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "spin 4s linear infinite",
                }}
              >
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 7,
                      height: 2,
                      background: "#4b5563",
                      borderRadius: 1,
                      transform: `rotate(${deg}deg) translateX(4px)`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Keyboard */}
            <div
              style={{
                width: 180,
                height: 16,
                background: "#1f2937",
                borderRadius: 4,
                border: "1px solid #374151",
                position: "absolute",
                bottom: 22,
                left: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                padding: "0 6px",
              }}
            >
              {[8, 8, 8, 20, 8, 8, 14, 8, 8].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w,
                    height: 8,
                    background: "#374151",
                    borderRadius: 1.5,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product card */}
          <div
            className="relative z-10 flex items-center gap-3 rounded-xl px-4 py-3 w-full"
            style={{
              maxWidth: 290,
              background: "#111827",
              border: "1px solid #1f2937",
              transition: "opacity 0.2s",
              opacity: animating ? 0 : 1,
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{ width: 34, height: 34, background: slide.badgeBg }}
            >
              <svg
                width="16"
                height="16"
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

          {/* Dots */}
          <div className="flex gap-2 mt-5 relative z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  height: 6,
                  width: i === current ? 22 : 6,
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

      {/* Ticker */}
      <div
        style={{
          background: "#111827",
          borderTop: "1px solid #1f2937",
          padding: "10px 0",
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
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div
              key={i}
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
                {item.highlight}
              </span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes barAnim {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
};
