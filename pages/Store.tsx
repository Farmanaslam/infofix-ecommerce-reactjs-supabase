import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Eye,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "../constants";

export const Store: React.FC = () => {
  const { products, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-32 overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-100 rounded-full blur-[120px] animate-float opacity-60"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[50%] bg-blue-100 rounded-full blur-[100px] animate-float opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/5 border border-indigo-600/10 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest animate-fade-in-up">
            <Sparkles className="w-3 h-3" /> Curated Technology
          </div>
          <h1
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            The Digital <span className="text-indigo-600">Collection.</span>
          </h1>
          <p
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Explore our meticulously selected range of hardware and lifestyle
            essentials designed for those who live on the cutting edge.
          </p>

          {/* Hero Search Bar */}
          <div
            className="max-w-2xl mx-auto relative group animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative glass rounded-2xl flex items-center p-2 shadow-2xl shadow-gray-200/50">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Find your next upgrade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 px-4 py-3 text-sm font-semibold text-gray-900"
              />
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              All Drops
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filteredProducts.length} Results
            </p>
            <div className="h-4 w-px bg-gray-200"></div>
            <button className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest hover:text-indigo-600 transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Filter & Sort
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group relative flex flex-col animate-fade-in-up`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: isLoaded ? 1 : 0,
                }}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-gray-50 mb-6 product-card-glow transition-all duration-500 group-hover:-translate-y-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />

                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
                    <button className="w-12 h-12 glass rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all transform scale-0 group-hover:scale-100 duration-300">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 glass rounded-full flex items-center justify-center text-gray-900 hover:bg-white transition-all transform scale-0 group-hover:scale-100 duration-300 delay-75">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add to Cart Button Overlay */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-2xl hover:bg-indigo-600 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.stock < 15 && (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        Running Low
                      </span>
                    )}
                    {index === 0 && (
                      <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> New Arrival
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 px-2 transition-transform duration-500 group-hover:translate-x-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">
                      {product.category}
                    </p>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-[10px] font-bold text-yellow-700">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between pt-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">
                        Retail Price
                      </span>
                      <p className="font-black text-2xl text-gray-900 tracking-tighter">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                      {product.reviews} Reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
              <Search className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              No matches found.
            </h2>
            <p className="text-gray-500 font-medium max-w-sm mb-8">
              Try adjusting your filters or search keywords to find what you're
              looking for.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Newsletter / Feature Banner */}
      <section className="mt-40 max-w-7xl mx-auto px-4">
        <div className="relative bg-indigo-600 rounded-[48px] p-12 md:p-24 overflow-hidden text-center text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/50 to-transparent"></div>
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Become a Nexus Insider.
            </h2>
            <p className="text-indigo-100 text-lg font-medium opacity-80">
              Get first access to limited drops, technical whitepapers, and
              exclusive community events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-white transition-all placeholder:text-indigo-200"
              />
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                Join
              </button>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};
