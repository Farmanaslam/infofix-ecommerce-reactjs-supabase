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
  const FilterSection = ({
    title,
    options,
    selected,
    onChange,
    single = false,
  }) => {
    const toggle = (value) => {
      if (single) {
        onChange(value);
      } else {
        if (selected.includes(value)) {
          onChange(selected.filter((v) => v !== value));
        } else {
          onChange([...selected, value]);
        }
      }
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
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                selected.includes(option)
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };
  const { products, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState("latest");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCondition =
        selectedCondition === "All" || p.condition === selectedCondition;

      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand);

      const matchesProcessor =
        selectedProcessors.length === 0 ||
        selectedProcessors.includes(p.processor);

      const matchesRam =
        selectedRam.length === 0 || selectedRam.includes(p.ram);

      const matchesStorage =
        selectedStorage.length === 0 || selectedStorage.includes(p.storage);

      const matchesMinPrice = minPrice === "" || p.price >= Number(minPrice);

      const matchesMaxPrice = maxPrice === "" || p.price <= Number(maxPrice);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesCondition &&
        matchesBrand &&
        matchesProcessor &&
        matchesRam &&
        matchesStorage &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      if (sortOption === "low-high") return a.price - b.price;
      if (sortOption === "high-low") return b.price - a.price;
      if (sortOption === "rating") return b.rating - a.rating;
      return 0;
    });
  return (
    <div className="pb-32 overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative h-112.5 flex items-center justify-center overflow-hidden">
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
            Explore Our <span className="text-indigo-600">Products.</span>
          </h1>

          <p
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Discover new and certified refurbished laptops, desktops, PCs, and
            accessories curated for students, professionals, and businesses.
            Shop with confidence backed by Infofix warranty and support.
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
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {[
              "All",
              "Laptop",
              "Graphics Card",
              "Processor",
              "RAM",
              "Monitor",
              "Peripherals",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {cat === "All" ? "All Drops" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filteredProducts.length} Results
            </p>
            <div className="h-4 w-px bg-gray-200"></div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
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
                <div className="relative aspect-4/5 rounded-4xl overflow-hidden bg-gray-50 mb-6 product-card-glow transition-all duration-500 group-hover:-translate-y-2">
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
                  <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
                    {/* Condition Badge */}
                    {product.condition === "Refurbished" && (
                      <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        Infofix Certified Refurbished
                      </span>
                    )}

                    {product.condition === "New" && (
                      <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        Brand New
                      </span>
                    )}

                    {/* Low Stock Badge */}
                    {product.stock < 15 && (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        Running Low
                      </span>
                    )}

                    {/* Optional: First Product Highlight */}
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
                  {/* Quick Specs */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.specs?.slice(0, 2).map((spec, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-semibold"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between pt-1">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-2xl text-gray-900 tracking-tighter">
                          ₹{product.price.toLocaleString()}
                        </p>

                        {product.retailPrice && (
                          <span className="text-sm text-gray-400 line-through font-semibold">
                            ₹{product.retailPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {product.retailPrice && (
                        <span className="text-[10px] text-green-600 font-bold">
                          Save ₹
                          {(
                            product.retailPrice - product.price
                          ).toLocaleString()}
                        </span>
                      )}
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
      {/* Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight text-gray-900">
                Filter Products
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-400 hover:text-gray-900 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="px-8 py-8 space-y-10">
              {/* SORT */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  Sort By
                </h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="latest">Featured</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
              {/* CATEGORY */}
              <FilterSection
                title="Category"
                options={CATEGORIES}
                selected={selectedCategory === "All" ? [] : [selectedCategory]}
                single
                onChange={(value) => setSelectedCategory(value)}
              />
              {/* CONDITION */}
              <FilterSection
                title="Condition"
                options={["New", "Refurbished"]}
                selected={
                  selectedCondition === "All" ? [] : [selectedCondition]
                }
                single
                onChange={(value) => setSelectedCondition(value)}
              />

              {/* BRAND */}
              <FilterSection
                title="Brand"
                options={["Dell", "HP", "Lenovo", "Acer", "Apple", "Asus"]}
                selected={selectedBrands}
                onChange={setSelectedBrands}
              />

              {/* PROCESSOR */}
              <FilterSection
                title="Processor"
                options={["i3", "i5", "i7", "Ryzen 5", "Ryzen 7"]}
                selected={selectedProcessors}
                onChange={setSelectedProcessors}
              />

              {/* RAM */}
              <FilterSection
                title="RAM"
                options={["4GB", "8GB", "16GB", "32GB"]}
                selected={selectedRam}
                onChange={setSelectedRam}
              />

              {/* STORAGE */}
              <FilterSection
                title="Storage"
                options={["256GB SSD", "512GB SSD", "1TB HDD", "1TB SSD"]}
                selected={selectedStorage}
                onChange={setSelectedStorage}
              />

              {/* PRICE */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  Price Range
                </h3>

                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* APPLY */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Trust Section */}
      <section className="mt-40 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <h3 className="font-black text-3xl text-indigo-600">5000+</h3>
            <p className="text-gray-500 font-semibold text-sm mt-2">
              Happy Customers
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <h3 className="font-black text-3xl text-indigo-600">1 Year</h3>
            <p className="text-gray-500 font-semibold text-sm mt-2">
              Warranty on Refurbished
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <h3 className="font-black text-3xl text-indigo-600">Secure</h3>
            <p className="text-gray-500 font-semibold text-sm mt-2">
              Verified Payments
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
            <h3 className="font-black text-3xl text-indigo-600">Fast</h3>
            <p className="text-gray-500 font-semibold text-sm mt-2">
              PAN India Shipping
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
