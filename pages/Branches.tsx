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
import { BranchCarousel } from "./BranchCarousel";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { Helmet } from 'react-helmet-async'
import { useLocation } from "react-router-dom";
export const Branches: React.FC = () => {
  const { branches, selectedStoreSection } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = SECTION_ACCENT[selectedStoreSection];
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredBranches = branches.filter(
    (b) =>
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const location = useLocation()
  const path = location.pathname.toLowerCase()

  const repairMeta = {
    '/computer-repair-durgapur': {
      title: 'Computer Repair in Durgapur | Infofix Computers',
      desc: 'Expert computer repair service in Durgapur — desktop, laptop, motherboard, screen & more. Walk-in at Benachity. Fast turnaround. Infofix Computers.',
      h1: 'Computer Repair', h2: 'Durgapur',
    },
    '/laptop-repair-durgapur': {
      title: 'Laptop Repair in Durgapur | Infofix Computers',
      desc: 'Fast laptop repair in Durgapur. Screen, battery, keyboard, hinge, motherboard — all brands. Same-day service at Infofix Computers, Benachity.',
      h1: 'Laptop Repair', h2: 'Durgapur',
    },
    '/laptop-repair-asansol': {
      title: 'Laptop Repair in Asansol | Infofix Computers',
      desc: 'Laptop repair service in Asansol. Dell, HP, Lenovo, Acer — all brands serviced. Quick turnaround at Infofix Computers.',
      h1: 'Laptop Repair', h2: 'Asansol',
    },
  } as const

  const currentRepair = repairMeta[path as keyof typeof repairMeta]
  return (
    <div className="pb-32 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {currentRepair && (
        <>
          <Helmet>
            <title>{currentRepair.title}</title>
            <meta name="description" content={currentRepair.desc} />
            <link rel="canonical" href={`https://infofixcomputers.com${location.pathname}`} />
            <script type="application/ld+json">{JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Infofix Computers",
              "url": "https://infofixcomputers.com",
              "telephone": "+91-8293295257",
              "description": currentRepair.desc,
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
                { "@type": "City", "name": "Ukhra" }
              ]
            })}</script>
          </Helmet>
          {/* Unique hero for repair pages */}
          <section className="bg-white py-12 px-4 text-center border-b border-gray-100">
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              {currentRepair.h1}{' '}
              <span style={{ color: theme.accent }}>{currentRepair.h2}</span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto font-medium">{currentRepair.desc}</p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-bold">
              <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-full">✓ All Brands Serviced</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full">✓ Fast Turnaround</span>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-full">✓ Walk-in Welcome</span>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-full">✓ Genuine Parts</span>
            </div>
          </section>
        </>
      )}
      {/* Immersive Header Section */}
      <section className="relative min-h-[50vh] md:h-100 flex items-center justify-center overflow-hidden bg-gray-900 pt-10 md:pt-0">
        {" "}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
            className="w-full h-full object-cover opacity-30 scale-105"
            alt="Infofix store branches background"
            width={1200}
            height={500}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-900/50 to-white"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md animate-fade-in-up">
            <MapIcon style={{ width: 10, height: 10, color: theme.accent }} /> Infofix Store
            Network
          </div>
          <h1
            className="text-5xl md:text-7xl font-black text-white tracking-tighter animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Visit <span style={{ color: theme.accent }}>Store Locations</span>
          </h1>
          <p
            className="text-gray-300 text-lg max-w-2xl mx-auto font-medium animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Visit Infofix Computers at any of our branches for product
            purchases, repairs, upgrades, and expert technical support.
          </p>
          <p className=" text-sm font-semibold tracking-wide" style={{ color: theme.accent }}>
            Trusted service. Genuine products. Local presence.
          </p>
          {/* Floating Search Bar */}
          <div
            className="max-w-xl mx-auto relative group mt-6 md:mt-8 px-4 md:px-0 animate-fade-in-up mb-2"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center p-2 shadow-2xl">
              <Search className="ml-4 w-5 h-5" style={{ color: theme.accent }} />
              <input
                type="text"
                placeholder="Search city or branch name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none flex-1 px-4 py-3 text-sm font-semibold text-white placeholder:text-gray-400"
              />
              <div className="hidden sm:flex items-center gap-2 pr-2">
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  {filteredBranches.length} Stores
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="app-container pt-6 relative z-20">
        {/* Store Overview Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16 mt-4 md:mt-0">

          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Find an Infofix Computers Store Near You
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            Infofix Computers operates multiple physical branches across West
            Bengal, offering walk-in support, hands-on product experience, and
            fast, reliable service. All our stores follow the same quality
            standards and customer-first approach.
          </p>
        </div>
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
                <div className="relative overflow-hidden">
                  <BranchCarousel
                    images={branch.images ?? []}
                    title={branch.title}
                    fallback={branch.images?.[0] ?? ""}
                  />
                  {/* Keep city badge + title overlay */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                    <span className="backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                      style={{ background: theme.accent + 'e6', border: `1px solid ${theme.accent}66` }}>
                      {branch.city}
                    </span>

                  </div>
                  <div className="absolute bottom-8 left-8 right-8 z-10">
                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">
                      {branch.title}
                    </h3>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-10 space-y-8 flex-1 flex flex-col">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl transition-all duration-300"
                        style={{ background: theme.accentLight, color: theme.accent }}
                        onMouseEnter={e => { e.currentTarget.style.background = theme.accent; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = theme.accentLight; e.currentTarget.style.color = theme.accent; }}>                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed">
                        {branch.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                          style={{ color: theme.accent }}>
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
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: theme.accent }}>
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
                      className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
                      onMouseEnter={e => (e.currentTarget.style.background = theme.accent)}
                      onMouseLeave={e => (e.currentTarget.style.background = '#111827')}                    >
                      <ExternalLink className="w-4 h-4" /> View Map
                    </a>
                    <button
                      onClick={() =>
                        (window.location.href = `tel:${branch.phone}`)
                      }
                      className="px-6 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-all active:scale-[0.98] border border-indigo-100"
                      style={{ color: theme.accent }}
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
              No Infofix store found.
            </h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10">
              We couldn’t find any Infofix branch matching your search. Try
              searching by city name like "Durgapur" or "Asansol".
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
      <section className="mt-18 app-container">
        <div className="relative bg-[#172337] rounded-[56px] p-16 md:p-32 overflow-hidden text-center text-white">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-indigo-600/20 to-transparent"></div>
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full  text-[10px] font-black uppercase tracking-widest backdrop-blur-md" style={{ color: theme.accent }}>
              <Sparkles className="w-3 h-3" /> Store Assistance
            </div>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
              Need Help Finding a{" "}
              <span style={{ color: theme.accent }}>Nearest Store?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-medium opacity-80 leading-relaxed">
              Looking for product availability, service support, or directions?
              Our team is ready to guide you to the nearest Infofix branch.
            </p>
            <div className="pt-6">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-white text-[#172337] cursor-pointer px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-2xl"
              >
                Find Nearest Store
              </button>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute -top-25 -left-25 w-100 h-100 bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-25 -right-25 w-75 h-75 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
      </section>
    </div>
  );
};
