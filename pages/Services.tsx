import React from "react";
import { useStore } from "@/context/StoreContext";
import {
  Monitor,
  Laptop,
  Cpu,
  Wrench,
  TrendingUp,
  ShieldCheck,
  MemoryStick,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Phone,
  Zap,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
export const Services: React.FC = () => {
  const { setCurrentPage, setSelectedCategory, selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];

  const mainServices = [
    {
      icon: Monitor,
      title: "Desktop PCs",
      tagline: "Assembled in-house. Built to last.",
      color: "#6366f1",
      dark: false,
      points: [
        "All configurations — i3 to i9, Ryzen 3 to Ryzen 9",
        "Pre-assembled and fully tested before delivery",
        "Office PCs, workstations, and gaming rigs in stock",
        "Ready to take home same day from any branch",
      ],
      cta: "Browse Desktops",
      action: () => setSelectedCategory("Desktop"),
    },
    {
      icon: Laptop,
      title: "Laptops",
      tagline: "Every brand. Every budget. In stock now.",
      color: "#10b981",
      dark: true,
      points: [
        "Student laptops from ₹22,999",
        "Professional ultrabooks & workstations",
        "Gaming laptops with dedicated GPU",
        "Handpicked for performance and reliability",
      ],
      cta: "Browse Laptops",
      action: () => setSelectedCategory("Laptop"),
    },
    {
      icon: RefreshCw,
      title: "Refurbished Laptops",
      tagline: "Certified pre-owned. Infofix tested.",
      color: "#ec4899",
      dark: false,
      points: [
        "Grade A refurbished laptops from top brands",
        "Every unit cleaned, tested & restored in-house",
        "SSD upgraded for faster performance",
        "6-month Infofix warranty on all refurb units",
      ],
      cta: "Browse Refurbished",
      action: () => setSelectedCategory("Laptop"),
    },
  ];

  const supportServices = [
    {
      icon: Wrench,
      title: "Hardware Repairs",
      desc: "Motherboard faults, display issues, power problems, overheating — diagnosed and fixed by certified technicians.",
      color: "#6366f1",
    },
    {
      icon: MemoryStick,
      title: "RAM & SSD Upgrades",
      desc: "Breathe new life into a slow machine. We source and install the right upgrade for your laptop or desktop.",
      color: "#10b981",
    },
    {
      icon: HardDrive,
      title: "OS Install & Recovery",
      desc: "Fresh Windows install, driver setup, data migration, and full system optimization. Fast turnaround.",
      color: "#f59e0b",
    },
    {
      icon: ShieldCheck,
      title: "Warranty & Support",
      desc: "All products come with genuine brand warranty and our support. From troubleshooting to replacements, we ensure quick assistance even after your purchase.",
      color: "#ef4444",
    },
    {
      icon: RefreshCw,
      title: "Certified Refurbished Solutions",
      desc: "From diagnostics to upgrades, we ensure every refurbished laptop and desktop meets high-quality standards. Enjoy cost-effective systems backed by our service support and reliability guarantee.",
      color: "#ec4899",
    },
    {
      icon: Zap,
      title: "Performance Tuning",
      desc: "Thermal repaste, fan cleaning, driver optimization, and BIOS updates to get peak performance from your machine.",
      color: "#06b6d4",
    },
  ];
  const buildTiers = [
    {
      tier: "Essential",
      use: "Study, Office & Daily Use",
      price: "₹10,999",
      old: "₹14,999",
      color: "#6366f1",
      specs: [
        "Intel Core i3 3rd Gen",
        "4GB RAM + 128GB SSD",
        '19" Monitor + Full Setup',
        "Keyboard, Mouse Included",
      ],
      ideal: "Students, Home Use, Basic Office",
    },
    {
      tier: "Professional",
      use: "Work, Multitasking & Business",
      price: "₹24,999",
      old: "₹33,999",
      color: "#818cf8",
      featured: true,
      specs: [
        "Intel Core i5 6th Gen",
        "8GB DDR4 RAM",
        "512GB SSD Storage",
        '22" Monitor + Full Setup',
      ],
      ideal: "Office Work, Developers, Shops",
    },
    {
      tier: "Performance",
      use: "Gaming, Editing & High-End Work",
      price: "₹86,799",
      old: "₹1,02,999",
      color: "#10b981",
      specs: [
        "Intel i5 14th Gen Processor",
        "16GB RAM + 512GB NVMe SSD",
        "RTX 3050 6GB Graphics",
        '27" Monitor + RGB Setup',
      ],
      ideal: "Gamers, Creators, Professionals",
    },
  ];
  return (
    <div className="pb-28">
      <Helmet>
        <title>
          {selectedStoreSection === 'Refurbished'
            ? 'Certified Refurbished Laptop Services Durgapur | Infofix Computers'
            : selectedStoreSection === 'Wholesale'
              ? 'Wholesale Computer Supply Services West Bengal | Infofix Computers'
              : 'Laptop & Desktop Services in Durgapur | Custom PC Builds | Infofix Computers'}
        </title>
        <meta name="description" content={
          selectedStoreSection === 'Refurbished'
            ? 'Grade-A certified refurbished laptops in Durgapur. Professionally tested, SSD upgraded, 6-month warranty. Dell, HP, Lenovo ThinkPad from ₹11,999. Infofix Computers.'
            : selectedStoreSection === 'Wholesale'
              ? 'Wholesale laptop & desktop supply across West Bengal. Bulk pricing, GST invoice, dedicated B2B support. Infofix Computers Durgapur.'
              : 'Buy laptops, desktop PCs & custom builds in Durgapur, Asansol & all India. Hardware repair, RAM/SSD upgrades, OS install. 1-year warranty. Infofix Computers.'
        } />
        <meta name="keywords" content="laptop repair durgapur, computer repair durgapur, custom pc build durgapur, desktop pc durgapur, laptop service asansol, refurbished laptop durgapur, ssd upgrade durgapur, gaming pc durgapur, computer services west bengal" />
        <link rel="canonical" href="https://infofixcomputers.com/services" />
        <meta property="og:title" content="Computer & Laptop Services in Durgapur | Infofix Computers" />
        <meta property="og:description" content="New PCs, custom builds, laptop repair, refurbished laptops & upgrades. 5 stores across West Bengal. 1-year warranty. Pan-India delivery." />
        <meta property="og:image" content="https://infofixcomputers.com/icons/logo.png" />
        <meta property="og:url" content="https://infofixcomputers.com/services" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Computer & Laptop Services — Infofix Computers",
          "url": "https://infofixcomputers.com/services",
          "description": "New laptops, desktop PCs, custom builds, hardware repair, RAM/SSD upgrades and certified refurbished devices. Serving Durgapur, Asansol, Ukhra & pan-India.",
          "provider": {
            "@type": "LocalBusiness",
            "name": "Infofix Computers",
            "@id": "https://infofixcomputers.com/#business",
            "telephone": "+91-8293295257",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Benachity Near Bank of Baroda",
              "addressLocality": "Durgapur",
              "addressRegion": "West Bengal",
              "postalCode": "713201",
              "addressCountry": "IN"
            }
          },
          "areaServed": [
            { "@type": "City", "name": "Durgapur" },
            { "@type": "City", "name": "Asansol" },
            { "@type": "City", "name": "Ukhra" },
            { "@type": "State", "name": "West Bengal" },
            { "@type": "Country", "name": "India" }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Tech Services Catalog",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Laptop Repair Durgapur", "description": "Hardware faults, screen replacement, motherboard repair — fast turnaround at our Durgapur service centre." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Custom PC Build Durgapur", "description": "Custom gaming and office PCs built to your specs and budget. Assembled and tested same day." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Certified Refurbished Laptops Durgapur", "description": "Grade-A refurbished Dell, HP, Lenovo laptops. SSD upgraded, tested, 6-month warranty." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "RAM & SSD Upgrade Durgapur", "description": "Speed up any laptop or desktop with RAM and SSD upgrades installed while you wait." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "OS Install & Data Recovery Durgapur", "description": "Fresh Windows install, driver setup, data migration and full system optimization." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Laptop Repair Asansol", "description": "Hardware and software laptop repairs at our Asansol service centre." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Desktop PC Sales Durgapur", "description": "Pre-assembled and custom desktop PCs for home, office and gaming available across 5 stores." } }
            ]
          }
        })}</script>
      </Helmet>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        .shimmer-text {
          background: linear-gradient(90deg,#6366f1 0%,#818cf8 40%,#4f46e5 60%,#6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .pulse-dot { animation: pulseDot 2s ease infinite; }
        .card-hover { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        .card-hover:hover { transform: translateY(-6px); }
      `}</style>

      {/* ── HERO ── */}
      <div
        className="relative flex items-center justify-center text-center overflow-hidden"
        style={{ minHeight: 480, background: "#0a0a0f" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              `linear-gradient(${theme.accent}14 1px,transparent 1px),linear-gradient(90deg,${theme.accent}14 1px,transparent 1px)`,
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full"
          style={{
            background:
              `radial-gradient(ellipse, ${theme.accent}33 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 px-4 max-w-4xl py-24">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8"
            style={{ background: `${theme.accent}1f`, border: `1px solid ${theme.accent}40`, color: theme.accent }}

          >
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: theme.accent }} />
            Laptops · Desktops · Custom Builds
          </div>

          <h1
            className="font-black text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: "clamp(30px, 6vw, 64px)" }}
          >
            The Right Machine.
            <br />
            <span style={{ color: theme.accent }}>Built for You.</span>
          </h1>

          <p
            className="font-medium leading-relaxed max-w-2xl mx-auto"
            style={{ fontSize: "clamp(15px, 2vw, 19px)", color: "#6b7280" }}
          >
            New laptops, assembled desktop PCs, and fully custom builds —
            configured to your exact needs, tested in-house, and backed by a
            1-year warranty. Walk in or order online across 5 locations.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-10">
            <Link
              to="/shop"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider hover:opacity-90 transition-all"
              style={{ background: theme.accent }}
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}
            >
              Custom Build Enquiry
            </Link>
          </div>
        </div>
      </div>

      <div className="app-container mt-10 md:mt-24 space-y-16 md:space-y-28">
        {/* ── 3 MAIN SERVICES ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              Core Offerings
            </p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              What We Specialize In
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mainServices.map((svc, i) => (
              <div
                key={i}
                className={`card-hover group relative rounded-4xl overflow-hidden border ${svc.dark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-100 "
                  } transition-all duration-300`}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.accent}33`; e.currentTarget.style.boxShadow = `0 20px 40px ${theme.accent}18`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = ''; }}
              >
                {svc.dark && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.1) 0%, transparent 70%)",
                    }}
                  />
                )}
                <div className="relative z-10 p-6 md:p-10 flex flex-col h-full gap-4 md:gap-6">
                  <div className="flex md:block justify-center md:justify-start">
                    <div
                      className="relative w-16 h-16 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${svc.color}22, ${svc.color}44)`,
                        border: `1.5px solid ${svc.color}33`,
                        boxShadow: `0 8px 24px ${svc.color}22`,
                      }}
                    >
                      <svc.icon className="w-7 h-7" style={{ color: svc.color }} />
                      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${svc.color}30, transparent 70%)` }} />
                    </div>
                  </div>

                  <div>
                    <h3
                      className={`font-black text-2xl mb-1 ${svc.dark ? "text-white" : "text-gray-900"}`}
                    >
                      {svc.title}
                    </h3>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: svc.color }}
                    >
                      {svc.tagline}
                    </p>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {svc.points.map((pt, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: svc.color }}
                        />
                        <span
                          className={`text-sm font-medium ${svc.dark ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={i === 0 ? "/buy-desktop-pc" : i === 1 ? "/buy-laptop" : "/buy-refurbished-laptop"}
                    onClick={() => svc.action()}
                    className="flex items-center gap-2 self-start text-sm font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                    style={{ background: svc.color + "18", color: svc.color }}
                  >
                    {svc.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="relative rounded-[40px] overflow-hidden bg-gray-50 p-6 md:p-16 space-y-8 md:space-y-10">

          {/* subtle grid bg */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `linear-gradient(${theme.accent}18 1px,transparent 1px),linear-gradient(90deg,${theme.accent}18 1px,transparent 1px)`,
            backgroundSize: "36px 36px",
          }} />

          <div className="relative text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
              Simple Process
            </p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              How Infofix Works
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              From browsing to doorstep — or walk in and walk out same day.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: `linear-gradient(90deg, ${theme.accent}40, ${theme.accent}80, ${theme.accent}40)` }} />

            {[
              { step: "01", icon: "🔍", title: "Browse or Visit", desc: "Explore online or walk into any of our 5 stores. See hardware live before you buy." },
              { step: "02", icon: "💬", title: "Expert Advice", desc: "Tell us your budget & use-case. Our team recommends the perfect machine — no upselling." },
              { step: "03", icon: "🔧", title: "Built & Tested", desc: "Every desktop assembled in-house. Every device quality-checked before it leaves." },
              { step: "04", icon: "🚀", title: "Delivered & Backed", desc: "Same-day pickup or pan-India delivery. 1-year warranty + after-sales support included." },
            ].map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center gap-4 group">
                {/* number circle */}
                <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300 z-10"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}22, ${theme.accent}44)`, border: `2px solid ${theme.accent}55` }}>
                  {s.icon}
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                    style={{ background: theme.accent }}>
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm md:text-lg mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Brand logos strip */}
          <div className="relative pt-6 border-t border-gray-200 space-y-4">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Brands We Stock & Service
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {[
                { name: "Dell", color: "#007DB8" },
                { name: "HP", color: "#0096D6" },
                { name: "Lenovo", color: "#E2231A" },
                { name: "Asus", color: "#00539B" },
                { name: "Acer", color: "#83B81A" },
                { name: "MSI", color: "#E4002B" },
                { name: "Intel", color: "#0071C5" },
                { name: "AMD", color: "#ED1C24" },
                { name: "NVIDIA", color: "#76B900" },
              ].map((brand, i) => (
                <div key={i}
                  className="card-hover px-5 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-2 group"
                  style={{ transition: "all 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = brand.color + "55"; e.currentTarget.style.boxShadow = `0 8px 24px ${brand.color}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: brand.color }} />
                  <span className="text-sm font-black text-gray-700">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SUPPORT SERVICES ── */}
        <section className="space-y-6 md:space-y-10">
          <div className="text-center space-y-2 md:space-y-3">
            <p className="text-xs font-black" style={{ color: theme.accent }}>
              After-Sales & Support
            </p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              We've Got You Covered After Too
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              Our relationship doesn't end at the sale. Walk into any branch for
              repairs, upgrades, or warranty support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

            {supportServices.map((svc, i) => (
              <div
                key={i}
                onClick={() => setCurrentPage("contact")}
                className="card-hover cursor-pointer group p-5 md:p-8 bg-white border border-gray-100 rounded-3xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div className="flex md:block justify-center md:justify-start mb-5">
                  <div
                    className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${svc.color}18, ${svc.color}35)`,
                      border: `1.5px solid ${svc.color}25`,
                      boxShadow: `0 6px 20px ${svc.color}20`,
                    }}
                  >
                    <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full opacity-60" style={{ background: svc.color }} />
                  </div>
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2 text-center md:text-left" />
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-4 text-center md:text-left">

                  {svc.desc}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1 text-xs font-black group-hover:gap-2 transition-all"

                  style={{ color: svc.color }}
                >
                  Enquire Now <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <section
          className="relative rounded-[40px] overflow-hidden"
          style={{ background: "#0a0a0f", minHeight: 320 }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                `linear-gradient(${theme.accent}14 1px,transparent 1px),linear-gradient(90deg,${theme.accent}14 1px,transparent 1px)`,
              backgroundSize: "36px 36px",
            }}
          />
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full"
            style={{
              background:
                `radial-gradient(ellipse, ${theme.accent}29 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 p-8 md:p-16 text-center space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Trusted by 50,000+ Customers.
              <br />
              <span style={{ color: theme.accent }}>
                5 Stores. 8 Years Strong.
              </span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              From a student's first laptop to a company's full desktop fleet —
              we've built, serviced, and supported thousands of machines across
              West Bengal. Walk in. Talk to us. We'll find the right solution.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <Link
                to="/contact"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider hover:opacity-90 transition-all"
                style={{ background: theme.accent }}
              >
                <Phone className="w-4 h-4" /> Contact Us
              </Link>
              <Link
                to="/branches"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}
              >
                <MapPin className="w-4 h-4" /> Find a Store
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
