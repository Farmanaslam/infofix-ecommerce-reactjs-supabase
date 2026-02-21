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

export const Home: React.FC = () => {
  const { setCurrentPage, setSelectedCategory, products, addToCart } =
    useStore();
  const featured = products.slice(0, 3);
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
    }, 6000); // change every 4 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col">
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Laptop Showroom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-900"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
            Powering Smart & Affordable{" "}
            <span className="text-indigo-500">Computing</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
            New and certified refurbished laptops, desktops, and accessories
            backed by expert servicing and trusted local support.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage("shop")}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-2"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage("contact")}
              className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-2xl font-bold backdrop-blur-md"
            >
              Visit Our Stores
            </button>
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
      <section className="py-24 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black text-gray-900 mb-12 text-center">
          Browse by Category
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            "Refurbished Laptops",
            "New Laptops",
            "Desktops & Workstations",
            "Accessories",
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => setCurrentPage("shop")}
              className="bg-gray-100 hover:bg-indigo-50 cursor-pointer p-10 rounded-3xl text-center transition-all shadow-md"
            >
              <Laptop className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900">{cat}</h3>
            </div>
          ))}
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
              className="group relative cursor-pointer bg-white rounded-[40px] shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-indigo-500/20"
            >
              {/* IMAGE */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Glass Overlay */}
                <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage("shop")}
                    className="w-12 h-12 glass rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all transform scale-0 group-hover:scale-100 duration-300"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Add To Cart Slide Button */}
                <div className="absolute inset-x-6 bottom-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>

              {/* DETAILS */}
              <div className="p-8 space-y-3 transition-all duration-500 group-hover:translate-x-1">
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                  {product.category}
                </p>

                <h4 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h4>

                <p className="text-lg font-black text-gray-900">
                  ₹{product.price}
                </p>
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
              className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
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
          className="relative max-w-6xl mx-auto h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
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
                <div className="w-[320px] md:w-[520px] bg-white rounded-[36px] p-10 shadow-xl shadow-gray-200/60 border border-gray-100">
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
          className="mt-12 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold"
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
            onClick={() => setCurrentPage("contact")}
            className="border border-white px-8 py-3 rounded-xl font-bold"
          >
            Visit Our Store
          </button>
        </div>
      </section>
    </div>
  );
};
