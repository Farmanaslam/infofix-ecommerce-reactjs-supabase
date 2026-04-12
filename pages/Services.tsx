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
} from "lucide-react";

export const Services: React.FC = () => {
  const { setCurrentPage, setSelectedCategory } = useStore();

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
      icon: Cpu,
      title: "Custom PC Builds",
      tagline: "Your specs. Your budget. Built by us.",
      color: "#f59e0b",
      dark: false,
      points: [
        "Share your use case — we pick every component",
        "Gaming, editing, coding, CAD, or everyday use",
        "Assembled, stress-tested, and warranty-backed",
        "Starts from ₹14,999 — any budget welcome",
      ],
      cta: "Request a Custom Build",
      action: () => setCurrentPage("contact"),
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
      icon: ShieldCheck,
      title: "Warranty Service",
      desc: "All our PCs and laptops come with a 1-year hardware warranty. Claim it at any of our 5 branches.",
      color: "#818cf8",
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
      use: "Study, Office & Browse",
      price: "₹14,999",
      old: "₹19,000",
      color: "#6366f1",
      specs: [
        "Intel Core i3 / Ryzen 3",
        "8GB DDR4 RAM",
        "256GB SSD",
        "Windows 11 Home",
      ],
    },
    {
      tier: "Professional",
      use: "Work, Dev & Multitask",
      price: "₹28,999",
      old: "₹36,000",
      color: "#818cf8",
      featured: true,
      specs: [
        "Intel Core i5 / Ryzen 5",
        "16GB DDR5 RAM",
        "512GB NVMe SSD",
        "Windows 11 Pro",
      ],
    },
    {
      tier: "Performance",
      use: "Editing, Gaming & CAD",
      price: "₹52,999",
      old: "₹65,000",
      color: "#10b981",
      specs: [
        "Intel Core i7 / Ryzen 7",
        "32GB DDR5 RAM",
        "1TB NVMe SSD",
        "Dedicated GPU",
      ],
    },
  ];

  return (
    <div className="pb-28">
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
              "linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 px-4 max-w-4xl py-24">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
            Laptops · Desktops · Custom Builds
          </div>

          <h1
            className="font-black text-white leading-[1.05] tracking-tight mb-6"
            style={{ fontSize: "clamp(30px, 6vw, 64px)" }}
          >
            The Right Machine.
            <br />
            <span className="shimmer-text">Built for You.</span>
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
            <button
              onClick={() => setCurrentPage("shop")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider hover:opacity-90 transition-all"
              style={{ background: "#6366f1" }}
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage("contact")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#9ca3af",
              }}
            >
              Custom Build Enquiry
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-24 space-y-28">
        {/* ── 3 MAIN SERVICES ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
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
                className={`card-hover group relative rounded-4xl overflow-hidden border ${
                  svc.dark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10"
                } transition-all duration-300`}
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
                <div className="relative z-10 p-8 md:p-10 flex flex-col h-full gap-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: svc.color + "18" }}
                  >
                    <svc.icon
                      className="w-7 h-7"
                      style={{ color: svc.color }}
                    />
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

                  <button
                    onClick={() => {
                      svc.action();
                      if (svc.title !== "Custom PC Builds")
                        setCurrentPage("shop");
                    }}
                    className="flex items-center gap-2 self-start text-sm font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                    style={{ background: svc.color + "18", color: svc.color }}
                  >
                    {svc.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CUSTOM BUILD TIERS ── */}
        <section className="bg-gray-50 rounded-[40px] p-10 md:p-16 space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
              Custom PC Builds
            </p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">
              Pick Your Tier
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              Every tier is assembled and tested by our in-house team. Need
              something specific? We'll build exactly what you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {buildTiers.map((tier, i) => (
              <div
                key={i}
                onClick={() => setCurrentPage("contact")}
                className={`card-hover cursor-pointer relative rounded-3xl p-8 flex flex-col gap-5 transition-all ${
                  tier.featured
                    ? "bg-gray-900 border-2 shadow-2xl shadow-indigo-500/20 md:-mt-6"
                    : "bg-white border border-gray-200 hover:border-indigo-100 hover:shadow-lg"
                }`}
                style={{
                  borderColor: tier.featured ? tier.color : undefined,
                }}
              >
                {tier.featured && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg"
                    style={{ background: tier.color }}
                  >
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
                    className={`font-black text-lg leading-tight ${tier.featured ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.use}
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-black tracking-tight ${tier.featured ? "text-white" : "text-gray-900"}`}
                  >
                    {tier.price}
                  </span>
                  <span
                    className={`text-sm line-through font-medium ${tier.featured ? "text-gray-500" : "text-gray-400"}`}
                  >
                    {tier.old}
                  </span>
                </div>

                <div className="space-y-2">
                  {tier.specs.map((spec, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span
                        className={`text-sm font-semibold ${tier.featured ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
                    tier.featured
                      ? "text-white hover:opacity-90"
                      : "bg-gray-900 text-white hover:bg-indigo-600"
                  }`}
                  style={tier.featured ? { background: tier.color } : {}}
                >
                  Build This Config →
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 font-medium">
            Need a different configuration?{" "}
            <button
              onClick={() => setCurrentPage("contact")}
              className="text-indigo-600 font-black hover:underline"
            >
              Tell us what you need →
            </button>
          </p>
        </section>

        {/* ── SUPPORT SERVICES ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportServices.map((svc, i) => (
              <div
                key={i}
                onClick={() => setCurrentPage("contact")}
                className="card-hover cursor-pointer group p-8 bg-white border border-gray-100 rounded-3xl hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                  style={{ background: svc.color + "15" }}
                >
                  <svc.icon className="w-6 h-6" style={{ color: svc.color }} />
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">
                  {svc.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-4">
                  {svc.desc}
                </p>
                <div
                  className="flex items-center gap-1 text-xs font-black group-hover:gap-2 transition-all"
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
                "linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 p-12 md:p-16 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Trusted by 5,000+ Customers.
              <br />
              <span style={{ color: "#818cf8" }}>
                5 Stores. 8 Years Strong.
              </span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              From a student's first laptop to a company's full desktop fleet —
              we've built, serviced, and supported thousands of machines across
              West Bengal. Walk in. Talk to us. We'll find the right solution.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-2">
              <button
                onClick={() => setCurrentPage("contact")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm text-white uppercase tracking-wider hover:opacity-90 transition-all"
                style={{ background: "#6366f1" }}
              >
                <Phone className="w-4 h-4" /> Contact Us
              </button>
              <button
                onClick={() => setCurrentPage("branches")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#9ca3af",
                }}
              >
                <MapPin className="w-4 h-4" /> Find a Store
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
