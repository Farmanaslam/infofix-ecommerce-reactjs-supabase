import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import {
  ArrowRight,
  Shield,
  Award,
  Globe,
  Wrench,
  Laptop,
  RefreshCw,
  Star,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { HeroCarousel } from "./HeroCarousel";
export const Home: React.FC = () => {
  const {
    setCurrentPage,
    setSelectedCategory,
    setHeaderSearchQuery,
    addToCart,
  } = useStore();
  const [featured, setFeatured] = useState<any[]>([]);

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
  const reviews = [
    {
      text: "Great place to buy refurbished laptops. Excellent condition and honest pricing.",
      name: "Ramanathan K",
    },
    {
      text: "Professional service and quick repairs. Highly recommended.",
      name: "Arun LKO",
    },
    {
      text: "Bought a laptop for my office. Works perfectly and saved a lot of money.",
      name: "Suman Mondal",
    },
    {
      text: "Very supportive staff and genuine products.",
      name: "Rahul Pradhan",
    },
  ];

  const [currentReview, setCurrentReview] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const diff = e.clientX - startX;

    if (diff > 50) {
      // drag right → previous
      setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    } else if (diff < -50) {
      // drag left → next
      setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }

    setIsDragging(false);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleViewDeal = (product: any) => {
    setSelectedCategory(product.category);
    setCurrentPage("shop");
  };
  return (
    <div className="flex flex-col">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-white py-3 border-b border-gray-200">
        <div className="px-4 lg:px-20 grid grid-cols-1 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] gap-4">
          {/* ---- LEFT: CAROUSEL ---- */}
          <HeroCarousel />

          {/* ---- RIGHT: PROMO BANNERS ---- */}
          <div className="flex flex-row md:flex-col gap-3">
            {/* Banner 1 — Offer Zone */}
            <div
              onClick={() => setCurrentPage("shop")}
              className="cursor-pointer relative flex-1 rounded-2xl overflow-hidden min-h-40 md:min-h-0 group"
            >
              <img
                src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800"
                alt="Deals"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-indigo-900/70" />
              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2">
                    Limited Time
                  </span>
                  <h3 className="text-white font-black text-xl md:text-2xl leading-tight">
                    OFFER
                    <br />
                    ZONE
                  </h3>
                  <p className="text-indigo-200 text-xs mt-1 font-medium">
                    Up to 40% off on select laptops & desktops
                  </p>
                </div>
                <button className="mt-3 self-start bg-white text-indigo-700 text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-wider hover:bg-indigo-50 transition-colors">
                  Shop Now →
                </button>
              </div>
            </div>

            {/* Banner 2 — Refurbished */}
            <div
              onClick={() => {
                setSelectedCategory("Refurbished Laptops");
                setCurrentPage("shop");
              }}
              className="cursor-pointer relative flex-1 rounded-2xl overflow-hidden min-h-40 md:min-h-0 group"
            >
              <img
                src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"
                alt="Refurbished"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gray-900/65" />
              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest mb-2">
                    Certified
                  </span>
                  <h3 className="text-white font-black text-xl md:text-2xl leading-tight">
                    SAVE MORE,
                    <br />
                    BUY SMART
                  </h3>
                  <p className="text-gray-300 text-xs mt-1 font-medium">
                    Refurbished laptops tested & warranted
                  </p>
                </div>
                <button className="mt-3 self-start bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors">
                  Explore →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST BADGES ================= */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
          {[
            {
              icon: Shield,
              title: "Secure Payments",
              desc: "100% safe and trusted payment methods.",
            },
            {
              icon: Award,
              title: "Quality Assured",
              desc: "Strict testing on every device.",
            },
            {
              icon: Wrench,
              title: "Expert Service",
              desc: "Skilled in-house technicians.",
            },
            {
              icon: Globe,
              title: "Local Presence",
              desc: "Multiple branches with walk-in support.",
            },
          ].map((item, i) => (
            <div key={i} className="space-y-4 text-center">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto">
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BROWSE BY CATEGORY ================= */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">
              What Are You Looking For?
            </p>
            <h2 className="text-4xl font-black text-gray-900">
              Browse by Category
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(
              [
                {
                  label: "Refurbished Laptops",
                  sub: "Certified & Tested",
                  count: "50+ Products",
                  bg: "bg-indigo-600",
                  hoverBg: "hover:bg-indigo-700",
                  badgeText: "Save up to 40%",
                  badgeBg: "bg-white/20 text-white",
                  dark: true,
                  action: () => {
                    setSelectedCategory(null);
                    setHeaderSearchQuery("refurbished");
                    setCurrentPage("shop");
                  },
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-9 h-9"
                    >
                      <rect x="2" y="4" width="20" height="13" rx="2" />
                      <path d="M8 20h8M12 17v3" />
                      <path
                        d="M7 9l2 2 4-4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  label: "New Laptops",
                  sub: "Latest Models",
                  count: "50+ Products",
                  bg: "bg-white",
                  hoverBg: "hover:bg-indigo-50",
                  badgeText: "Brand New",
                  badgeBg: "bg-indigo-100 text-indigo-700",
                  dark: false,
                  action: () => {
                    setSelectedCategory(null);
                    setCurrentPage("shop");
                  },
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-9 h-9"
                    >
                      <rect x="2" y="4" width="20" height="13" rx="2" />
                      <path d="M8 20h8M12 17v3" />
                      <path d="M9 10h6M12 8v4" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  label: "Desktops & Workstations",
                  sub: "High Performance",
                  count: "50+ Products",
                  bg: "bg-white",
                  hoverBg: "hover:bg-indigo-50",
                  badgeText: "Power Users",
                  badgeBg: "bg-indigo-100 text-indigo-700",
                  dark: false,
                  action: () => {
                    setSelectedCategory("Desktops & Workstations");
                    setHeaderSearchQuery("");
                    setCurrentPage("shop");
                  },
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-9 h-9"
                    >
                      <rect x="2" y="3" width="14" height="11" rx="2" />
                      <path d="M16 8h4a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-3" />
                      <circle cx="18" cy="14" r="1" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  label: "Accessories",
                  sub: "Mice, Keyboards & More",
                  count: "50+ Products",
                  bg: "bg-gray-900",
                  hoverBg: "hover:bg-gray-800",
                  badgeText: "All Brands",
                  badgeBg: "bg-white/15 text-white",
                  dark: true,
                  // Uses headerSearchQuery — keyword search since accessories span many categories
                  // Accessories
                  action: () => {
                    setSelectedCategory(null);
                    setHeaderSearchQuery("peripherals");
                    setCurrentPage("shop");
                  },
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className="w-9 h-9"
                    >
                      <rect x="3" y="9" width="18" height="11" rx="2" />
                      <path d="M8 9V7a4 4 0 018 0v2" strokeLinecap="round" />
                      <circle cx="9" cy="14" r="1" fill="currentColor" />
                      <circle cx="15" cy="14" r="1" fill="currentColor" />
                    </svg>
                  ),
                },
              ] as const
            ).map((cat, i) => (
              <div
                key={i}
                onClick={cat.action}
                className={`
            cursor-pointer group relative overflow-hidden
            ${cat.bg} ${cat.hoverBg}
            border border-gray-200/60
            p-6 md:p-8 rounded-3xl
            flex flex-col gap-4
            shadow-sm hover:shadow-2xl hover:shadow-indigo-500/15
            transition-all duration-300 ease-out
            hover:-translate-y-2
          `}
              >
                {/* Decorative bg circles */}
                <div
                  className={`absolute -top-6 -right-6 w-24 h-24 rounded-full transition-transform duration-500 group-hover:scale-150 ${cat.dark ? "bg-white/5" : "bg-indigo-600/5"}`}
                />
                <div
                  className={`absolute -bottom-8 -right-4 w-20 h-20 rounded-full transition-transform duration-500 group-hover:scale-125 ${cat.dark ? "bg-white/5" : "bg-indigo-600/5"}`}
                />

                {/* Badge */}
                <span
                  className={`self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${cat.badgeBg}`}
                >
                  {cat.badgeText}
                </span>

                {/* Icon */}
                <div
                  className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
            ${cat.dark ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600"}
          `}
                >
                  {cat.icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3
                    className={`font-black text-base leading-snug ${cat.dark ? "text-white" : "text-gray-900"}`}
                  >
                    {cat.label}
                  </h3>
                  <p
                    className={`text-xs mt-1 font-medium ${cat.dark ? "text-white/55" : "text-gray-400"}`}
                  >
                    {cat.sub}
                  </p>
                </div>

                {/* Footer: count + arrow */}
                <div
                  className={`flex items-center justify-between mt-auto pt-3 border-t ${cat.dark ? "border-white/10" : "border-gray-100"}`}
                >
                  <span
                    className={`text-[11px] font-bold ${cat.dark ? "text-white/50" : "text-gray-400"}`}
                  >
                    {cat.count}
                  </span>
                  <div
                    className={`
              w-7 h-7 rounded-full flex items-center justify-center
              transition-all duration-300 group-hover:translate-x-1
              ${cat.dark ? "bg-white/15 text-white" : "bg-indigo-100 text-indigo-600"}
            `}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-4xl font-black">Welcome to Infofix Computers</h2>
          <p className="text-gray-300 leading-relaxed">
            Infofix Computers is a trusted computer retail and service brand
            specializing in new and certified refurbished laptops, desktops, and
            accessories. We help students, professionals, and businesses find
            reliable technology that fits their needs and budget.
          </p>
          <button
            onClick={() => setCurrentPage("about")}
            className=" cursor-pointer bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold"
          >
            Know More About Us
          </button>
        </div>
      </section>
      {/* ================= BEST DEALS ================= */}
      <section className="py-28 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-16">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
              Featured Collection
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Best Deals You Can’t Miss
            </h3>
          </div>
          <button
            onClick={() => setCurrentPage("shop")}
            className="cursor-pointer text-gray-900 font-black flex items-center gap-2 hover:text-indigo-600 transition-colors"
          >
            View All Deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featured.map((product) => (
            <div
              key={product.id}
              onClick={() =>
                handleViewDeal({ category: product.categories?.name })
              }
              className="group relative cursor-pointer bg-white rounded-[40px] shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-indigo-500/20"
            >
              {/* IMAGE */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Discount badge */}
                {product.discount_percent > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-xl">
                    {Math.round(product.discount_percent)}% OFF
                  </span>
                )}
                {/* Add To Cart Slide Button */}
                <div className="hidden md:block absolute inset-x-6 bottom-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  {" "}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: String(product.id),
                        name: product.name,
                        image: product.image_url ?? "",
                        price: Number(
                          product.discounted_price ?? product.retail_price ?? 0,
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
                        discountPercent: Number(product.discount_percent ?? 0),
                      } as any);
                    }}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-8 space-y-2 transition-all duration-500 group-hover:translate-x-1">
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                  {product.categories?.name}
                </p>
                <h4 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-baseline gap-3">
                  <p className="text-lg font-black text-gray-900">
                    ₹{Number(product.discounted_price).toLocaleString()}
                  </p>
                  {product.retail_price && (
                    <p className="text-sm text-gray-400 line-through font-medium">
                      ₹{Number(product.retail_price).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Add to Cart — mobile only, always visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                      id: String(product.id),
                      name: product.name,
                      image: product.image_url ?? "",
                      price: Number(
                        product.discounted_price ?? product.retail_price ?? 0,
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
                      discountPercent: Number(product.discount_percent ?? 0),
                    } as any);
                  }}
                  className="md:hidden mt-2 w-full bg-gray-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* ================= REFURBISHED PROMOTION ================= */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-6">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
              Smart Investment
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Premium Refurbished Laptops
            </h2>

            <p className="text-gray-600 leading-relaxed font-medium">
              High-performance laptops professionally tested, certified and
              backed with warranty. Save up to 40% compared to new devices.
            </p>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  setSelectedCategory("Refurbished Laptops");
                  setCurrentPage("shop");
                }}
                className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all"
              >
                View Refurbished Deals
              </button>

              <button
                onClick={() => {
                  setSelectedCategory("Refurbished Laptops");
                  setCurrentPage("shop");
                }}
                className="cursor-pointer border border-gray-300 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all"
              >
                Explore Collection
              </button>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div
            onClick={() => {
              setSelectedCategory("Refurbished Laptops");
              setCurrentPage("shop");
            }}
            className="cursor-pointer group rounded-[40px] overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-500"
          >
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=2070"
              alt="Refurbished Laptops"
              className="w-full h-105 object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>
      {/* ================= CUSTOMER REVIEWS ================= */}
      <section className="py-28 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
            Testimonials
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
            What Our Customers Say
          </h3>
          <p className="text-gray-500 font-medium">300+ Verified Reviews</p>
        </div>

        <div
          className="relative max-w-6xl mx-auto h-85 flex items-center justify-center cursor-grab active:cursor-grabbing"
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
              setCurrentReview((prev) =>
                prev === 0 ? reviews.length - 1 : prev - 1,
              );
            else if (diff < -50)
              setCurrentReview((prev) =>
                prev === reviews.length - 1 ? 0 : prev + 1,
              );
            setIsDragging(false);
          }}
        >
          {reviews.map((review, index) => {
            const position =
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
                className={`
            absolute transition-all duration-700 ease-in-out
            ${
              position === "center"
                ? "opacity-100 scale-100 z-20 translate-x-0"
                : position === "left"
                  ? "opacity-40 scale-90 -translate-x-[65%] z-10"
                  : position === "right"
                    ? "opacity-40 scale-90 translate-x-[65%] z-10"
                    : "opacity-0 scale-75"
            }
          `}
              >
                <div className="w-[320px] md:w-130 bg-white rounded-[36px] p-10 shadow-xl shadow-gray-200/60 border border-gray-100">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 font-medium leading-relaxed text-sm md:text-base mb-6">
                    {review.text}
                  </p>

                  <p className="font-bold text-gray-900">{review.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              className={`transition-all rounded-full ${
                currentReview === i
                  ? "w-6 h-3 bg-indigo-600"
                  : "w-3 h-3 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </section>
      {/* ================= WHY REFURBISHED ================= */}
      <section className="py-24 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <RefreshCw className="w-10 h-10 text-indigo-500 mx-auto" />
          <h2 className="text-4xl font-black">
            Why Choose Refurbished Laptops?
          </h2>
          <p className="text-gray-300">
            Professionally tested, fully serviced, performance verified, and
            budget friendly. Perfect for students, professionals, startups, and
            businesses.
          </p>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-12">
          What We Offer
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "New & Certified Refurbished Devices",
            "Laptop & Desktop Repair",
            "Buyback & Exchange Programs",
          ].map((service, i) => (
            <div
              key={i}
              className="cursor-pointer bg-gray-100 p-10 rounded-3xl shadow-md"
            >
              <h4 className="font-bold text-gray-900">{service}</h4>
            </div>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage("services")}
          className="mt-12 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer"
        >
          View All Services
        </button>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-black mb-4">
          Need Help Choosing the Right Device?
        </h2>
        <p className="mb-8 text-indigo-100">
          Our team is here to guide you with honest advice and expert support.
        </p>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setCurrentPage("contact")}
            className="cursor-pointer bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
          >
            Contact Us
          </button>
          <button
            onClick={() => setCurrentPage("branches")}
            className="border border-white px-8 py-3 rounded-xl font-bold cursor-pointer"
          >
            Visit Our Store
          </button>
        </div>
      </section>
    </div>
  );
};
