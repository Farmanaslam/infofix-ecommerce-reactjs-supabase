import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Search,
  Info,
  ExternalLink,
  Sparkles,
  Map as MapIcon,
} from "lucide-react";

export const Branches: React.FC = () => {
  const { branches } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredBranches = branches.filter(
    (b) =>
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="pb-32 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Immersive Header Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
            className="w-full h-full object-cover opacity-30 scale-105"
            alt="Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md animate-fade-in-up">
            <MapIcon className="w-3 h-3 text-indigo-400" /> Regional Experience
            Centers
          </div>
          <h1
            className="text-5xl md:text-7xl font-black text-white tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Visit <span className="text-indigo-400">Our Space.</span>
          </h1>
          <p
            className="text-gray-300 text-lg max-w-2xl mx-auto font-medium animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Experience our flagship computing solutions in person at any of our
            high-tech hubs across West Bengal.
          </p>

          {/* Floating Search Bar */}
          <div
            className="max-w-xl mx-auto relative group pt-8 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-1.5 shadow-2xl">
              <Search className="ml-4 text-indigo-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search city or branch name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 px-4 py-3 text-sm font-semibold text-white placeholder:text-gray-400"
              />
              <div className="hidden sm:flex items-center gap-2 pr-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  {filteredBranches.length} Results
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 pt-6 relative z-20">
        {filteredBranches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {filteredBranches.map((branch, i) => (
              <div
                key={branch.id}
                className="group bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 animate-fade-in-up"
                style={{
                  animationDelay: `${0.1 * (i + 1)}s`,
                  opacity: isLoaded ? 1 : 0,
                }}
              >
                {/* Visual Header */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Floating Labels */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <span className="bg-indigo-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">
                      {branch.city}
                    </span>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white">
                      <Navigation className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
                      {branch.title}
                    </h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-10 space-y-8 flex-1 flex flex-col">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> Availability
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {branch.hours}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                          {branch.days}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          <Phone className="w-3 h-3" /> Phone
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {branch.phone}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                          Open
                        </div>
                      </div>
                    </div>
                  </div>

                  {branch.details && (
                    <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden group/info">
                      <div className="absolute top-0 right-0 p-3 text-gray-200 group-hover/info:text-indigo-100 transition-colors">
                        <Info className="w-12 h-12" />
                      </div>
                      <p className="relative z-10 text-xs text-gray-500 font-medium leading-relaxed">
                        {branch.details}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 mt-auto">
                    <a
                      href={branch.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
                    >
                      <ExternalLink className="w-4 h-4" /> View Map
                    </a>
                    <button
                      onClick={() =>
                        (window.location.href = `tel:${branch.phone}`)
                      }
                      className="px-6 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-[0.98] border border-indigo-100"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center animate-fade-in-up bg-white rounded-[48px] shadow-2xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-8 border border-gray-100">
              <MapPin className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
              No locations found.
            </h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10">
              We couldn't find any branches matching your search. Try searching
              by city name like "Durgapur" or "Asansol".
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
            >
              Show All Branches
            </button>
          </div>
        )}
      </div>

      {/* Premium CTA Footer */}
      <section className="mt-40 max-w-7xl mx-auto px-4">
        <div className="relative bg-[#172337] rounded-[56px] p-16 md:p-32 overflow-hidden text-center text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3 h-3" /> National Expansion
            </div>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
              Always Nearby{" "}
              <span className="text-indigo-400">Wherever You Go.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-medium opacity-80 leading-relaxed">
              We're rapidly expanding our footprint to bring cutting-edge
              computing and premium service to every corner of India.
            </p>
            <div className="pt-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-white text-[#172337] px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl"
              >
                Find Nearest Center
              </button>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
      </section>
    </div>
  );
};
