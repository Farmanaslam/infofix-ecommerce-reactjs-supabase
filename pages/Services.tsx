import React, { useRef, useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import {
  Monitor, Laptop, Cpu, Wrench, ShieldCheck,
  MemoryStick, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Phone, Zap, HardDrive, RefreshCw, Star,
  MessageCircle, Wifi, Camera,
  Gamepad2, Briefcase, Database, ShieldAlert,
  AlertCircle, ExternalLink,
} from "lucide-react";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, vis };
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, vis } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export const Services: React.FC = () => {
  const { setCurrentPage, setSelectedCategory, selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const acc = theme.accent;

  const mainServices = [
    {
      icon: Monitor, title: "Desktop PCs", emoji: "🖥️",
      tagline: "Assembled in-house. Built to last.",
      points: ["All configs — i3 to i9, Ryzen 3–9", "Pre-assembled & fully tested", "Office, workstation & gaming rigs in stock", "Take home same-day from any branch"],
      cta: "Browse Desktops", href: "/buy-desktop-pc", action: () => setSelectedCategory("Desktop"), color: "#6366f1",
    },
    {
      icon: Laptop, title: "Laptops", emoji: "💻",
      tagline: "Every brand. Every budget. In stock now.",
      points: ["Student laptops from ₹22,999", "Professional ultrabooks & workstations", "Gaming laptops with dedicated GPU", "Handpicked for performance & reliability"],
      cta: "Browse Laptops", href: "/buy-laptop", action: () => setSelectedCategory("Laptop"), color: "#10b981",
    },
    {
      icon: RefreshCw, title: "Refurbished", emoji: "♻️",
      tagline: "Certified pre-owned. Infofix tested.",
      points: ["Grade-A units from top brands", "Cleaned, tested & restored in-house", "SSD upgraded for faster performance", "6-month Infofix warranty included"],
      cta: "Browse Refurbished", href: "/buy-refurbished-laptop", action: () => setSelectedCategory("Laptop"), color: "#ec4899",
    },
  ];

  const repairServices = [
    { icon: Wrench, title: "Hardware Repair", desc: "Motherboard faults, display issues, power problems, overheating — diagnosed & fixed by certified technicians.", color: "#6366f1" },
    { icon: MemoryStick, title: "RAM & SSD Upgrades", desc: "Breathe new life into a slow machine. We source & install the right upgrade for your laptop or desktop.", color: "#10b981" },
    { icon: HardDrive, title: "OS Install & Recovery", desc: "Fresh Windows install, driver setup, data migration & full system optimization. Fast turnaround.", color: "#f59e0b" },
    { icon: ShieldCheck, title: "Warranty & Support", desc: "All products carry genuine brand warranty. From troubleshooting to replacements — we ensure swift after-sale assistance.", color: "#ef4444" },
    { icon: Wifi, title: "Networking & LAN", desc: "Router configuration, LAN setup, Wi-Fi troubleshooting & complete office network solutions.", color: "#06b6d4" },
    { icon: Database, title: "Data Recovery", desc: "Retrieve lost files from crashed drives, formatted SSDs & corrupted storage. Quick & confidential.", color: "#8b5cf6" },
    { icon: ShieldAlert, title: "Virus Removal", desc: "Complete malware, spyware & ransomware removal with proactive protection setup.", color: "#f43f5e" },
    { icon: Zap, title: "Performance Tuning", desc: "Thermal repaste, fan cleaning, driver optimization & BIOS updates for peak performance.", color: "#f59e0b" },
    { icon: Gamepad2, title: "Custom Gaming PCs", desc: "High-performance gaming builds configured to your exact budget and game requirements.", color: "#a855f7" },
    { icon: Camera, title: "CCTV Installation", desc: "Security camera installation, DVR/NVR setup, remote viewing configuration & maintenance.", color: "#0ea5e9" },
    { icon: Briefcase, title: "AMC Services", desc: "Annual maintenance contracts for businesses — scheduled servicing, priority support, hardware audits.", color: "#10b981" },
    { icon: RefreshCw, title: "Certified Refurbished", desc: "Grade-A diagnostics, upgrades & restoration ensuring every refurb unit meets high-quality standards.", color: "#ec4899" },
  ];

  const stats = [
    { val: "8+", label: "Years in Business", icon: "🏆" },
    { val: "50K+", label: "Happy Customers", icon: "😊" },
    { val: "5", label: "Stores in WB", icon: "📍" },
    { val: "1 Yr", label: "Warranty Included", icon: "🛡️" },
  ];


  const testimonials = [
    { name: "Sourav M.", role: "Gamer", stars: 5, text: "Built my dream gaming PC here. Cable management is art! Runs 4K like butter." },
    { name: "Ankit R.", role: "Business Owner", stars: 5, text: "Their AMC service saved my office network twice this month. Super fast response." },
    { name: "Priya D.", role: "Student", stars: 5, text: "Thought I lost my thesis data. Infofix recovered everything in 24 hours. Lifesavers!" },
    { name: "Rahul S.", role: "Developer", stars: 5, text: "Upgraded RAM & SSD on my old laptop — it feels brand new. Great value for money." },
  ];

  const brands = [
    { name: "Dell", color: "#007DB8" }, { name: "HP", color: "#0096D6" }, { name: "Lenovo", color: "#E2231A" },
    { name: "Asus", color: "#00539B" }, { name: "Acer", color: "#83B81A" }, { name: "MSI", color: "#E4002B" },
    { name: "Intel", color: "#0071C5" }, { name: "AMD", color: "#ED1C24" }, { name: "NVIDIA", color: "#76B900" },
  ];

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>Laptop & Desktop Services in Durgapur | Custom PC Builds | Infofix Computers</title>
        <meta name="description" content="New laptops, desktop PCs & custom builds in Durgapur, Asansol & all India. Hardware repair, RAM/SSD upgrades, OS install. 1-year warranty. Infofix Computers." />
        <link rel="canonical" href="https://infofixcomputers.com/services" />
      </Helmet>

      <style>{`
        /* Uses Inter — same as app (loaded globally in index.html) */
        .svc-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; }

        @keyframes svc-shimmer-bg {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes svc-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes svc-pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes svc-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        @keyframes svc-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .svc-shimmer-text {
          background: linear-gradient(90deg, ${acc} 0%, #fff 40%, ${acc}cc 60%, ${acc} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: svc-shimmer-bg 4s linear infinite;
        }
        .svc-ticker-wrap { overflow: hidden; white-space: nowrap; }
        .svc-ticker-inner { display: inline-flex; animation: svc-ticker 28s linear infinite; }
        .svc-card-lift {
          transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
        }
        .svc-card-lift:hover { transform: translateY(-6px) scale(1.012); }
        .svc-hero-grid {
          background-image: linear-gradient(${acc}18 1px, transparent 1px), linear-gradient(90deg, ${acc}18 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .svc-scan-anim { animation: svc-scan 3s ease-in-out infinite; }
        .svc-float-anim { animation: svc-float 5s ease-in-out infinite; }
        .svc-pulse-dot {
          position: relative;
          display: inline-block;
          width: 8px; height: 8px; border-radius: 50%;
          background: ${acc};
        }
        .svc-pulse-dot::before {
          content: ''; position: absolute; inset: -3px;
          border-radius: 50%; border: 1.5px solid ${acc};
          animation: svc-pulse-ring 1.8s ease-out infinite;
        }
      `}</style>

      <div className="svc-root">

        {/* ══ HERO ══ */}
        <div className="relative overflow-hidden" style={{ background: "#07070d", minHeight: 600 }}>
          <div className="absolute inset-0 svc-hero-grid opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-96 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${acc}28 0%, transparent 68%)`, filter: "blur(4px)" }} />
          <div className="absolute inset-x-0 top-0 h-0.5 pointer-events-none svc-scan-anim"
            style={{ background: `linear-gradient(90deg, transparent, ${acc}80, transparent)` }} />

          <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-7">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: `${acc}1a`, border: `1px solid ${acc}40`, color: acc }}>
                <span className="svc-pulse-dot" />
                8 Years · 5 Stores · 50K+ Customers
              </div>

              <h1 className="font-extrabold text-white leading-tight tracking-tight"
                style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
                Your Tech.<br />
                <span className="svc-shimmer-text">Our Expertise.</span>
              </h1>

              <p className="text-slate-400 font-medium leading-relaxed max-w-lg"
                style={{ fontSize: "clamp(15px, 1.8vw, 18px)" }}>
                From student laptops to enterprise fleets, custom gaming rigs to certified refurbished devices — Infofix has been West Bengal's most trusted tech partner since 2016. Walk in or shop online.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: `linear-gradient(135deg, ${acc}, ${acc}cc)`, boxShadow: `0 8px 32px ${acc}50` }}>
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="https://service.infofixcomputer.in" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm transition-all hover:bg-white/10 active:scale-95"
                  style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}>
                  <AlertCircle className="w-4 h-4" /> Raise a Complaint <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* stats mosaic */}
            <div className="grid grid-cols-2 gap-4 shrink-0 svc-float-anim">
              {stats.map((s, i) => (
                <div key={i} className="rounded-3xl px-7 py-6 text-center"
                  style={{
                    background: i === 1 ? `linear-gradient(135deg, ${acc}22, ${acc}44)` : "rgba(255,255,255,0.04)",
                    border: i === 1 ? `1.5px solid ${acc}55` : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: i === 1 ? `0 8px 32px ${acc}30` : "none",
                  }}>
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="text-3xl font-extrabold text-white leading-none">{s.val}</div>
                  <div className="text-xs font-semibold mt-1" style={{ color: i === 1 ? acc : "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ COMPLAINT BANNER ══ */}
        <Section>
          <div className="mx-4 lg:mx-20 my-8 rounded-4xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", border: `1.5px solid ${acc}33` }}>
            <div className="absolute inset-0 opacity-20 svc-hero-grid" />
            <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${acc}22`, border: `1.5px solid ${acc}44` }}>
                  <AlertCircle className="w-6 h-6" style={{ color: acc }} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Have an issue? Raise a complaint instantly.</p>
                  <p className="text-slate-400 text-sm">Our service portal tracks your complaint end-to-end. Get updates via WhatsApp & email.</p>
                </div>
              </div>
              <a href="https://service.infofixcomputer.in" target="_blank" rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${acc}, ${acc}bb)`, boxShadow: `0 6px 24px ${acc}44` }}>
                Raise Complaint <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </Section>

        {/* ══ TICKER ══ */}
        <div className="py-4 overflow-hidden border-y" style={{ borderColor: `${acc}22`, background: `${acc}08` }}>
          <div className="svc-ticker-wrap">
            <div className="svc-ticker-inner">
              {[...Array(2)].map((_, ri) => (
                <span key={ri} className="inline-flex items-center">
                  {["Laptop Repair", "Custom PC Builds", "SSD Upgrades", "OS Install", "Data Recovery", "Virus Removal", "CCTV Setup", "Gaming PCs", "Certified Refurbished", "AMC Services", "Pan-India Delivery", "1-Year Warranty"].map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-5 px-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: acc }} />
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-28 py-24">

          {/* ══ CORE OFFERINGS ══ */}
          <Section>
            <div className="text-center mb-14 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: acc }}>What We Specialize In</p>
              <h2 className="font-extrabold text-gray-900 tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>Core Offerings</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">Every machine sold, assembled, and supported under one roof.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {mainServices.map((svc, i) => (
                <div key={i} className="svc-card-lift group relative rounded-4xl overflow-hidden border bg-white"
                  style={{ borderColor: `${svc.color}22`, boxShadow: `0 4px 24px ${svc.color}10` }}>
                  <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${svc.color}, ${svc.color}55)` }} />
                  <div className="p-8 flex flex-col gap-5 h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: `${svc.color}12`, border: `1.5px solid ${svc.color}25` }}>
                        {svc.emoji}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl text-gray-900">{svc.title}</h3>
                        <p className="text-xs font-semibold" style={{ color: svc.color }}>{svc.tagline}</p>
                      </div>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {svc.points.map((pt, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: svc.color }} />
                          <span className="text-sm text-gray-500 font-medium">{pt}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={svc.href} onClick={svc.action}
                      className="inline-flex items-center gap-2 self-start text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                      style={{ background: `${svc.color}14`, color: svc.color }}>
                      {svc.cta} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ══ REPAIR SERVICES GRID ══ */}
          <Section delay={100}>
            <div className="text-center mb-14 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: acc }}>After-Sales & Repairs</p>
              <h2 className="font-extrabold text-gray-900 tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>Full Service Coverage</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">Our relationship doesn't end at the sale. Walk into any branch for repairs, upgrades or warranty support.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {repairServices.map((svc, i) => (
                <div key={i} className="svc-card-lift group relative p-6 bg-white border border-gray-100 rounded-3xl cursor-pointer"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${svc.color}44`; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${svc.color}14`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#f3f4f6"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `${svc.color}14`, border: `1.5px solid ${svc.color}22` }}>
                    <svc.icon className="w-5 h-5" style={{ color: svc.color }} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{svc.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-medium">{svc.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: svc.color }}>
                    Enquire <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="https://service.infofixcomputer.in" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${acc}, ${acc}bb)`, boxShadow: `0 8px 32px ${acc}44` }}>
                <AlertCircle className="w-5 h-5" /> Raise a Service Complaint <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </Section>

          {/* ══ HOW IT WORKS ══ */}
          <Section delay={80}>
            <div className="relative rounded-4xl overflow-hidden" style={{ background: "#07070d" }}>
              <div className="absolute inset-0 svc-hero-grid opacity-40" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(ellipse, ${acc}28 0%, transparent 70%)` }} />
              <div className="relative z-10 px-8 py-16 md:px-16">
                <div className="text-center mb-14 space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: acc }}>Simple Process</p>
                  <h2 className="font-extrabold text-white tracking-tight" style={{ fontSize: "clamp(26px, 4vw, 44px)" }}>How Infofix Works</h2>
                  <p className="text-slate-400 max-w-lg mx-auto text-sm">From browsing to your doorstep — or walk in and walk out same day.</p>
                </div>
                <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="hidden lg:block absolute top-9 left-48 right-48 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${acc}60, ${acc}60, transparent)` }} />
                  {[
                    { step: "01", emoji: "🔍", title: "Browse or Visit", desc: "Explore online or walk into any of our 5 stores. See hardware live before you buy." },
                    { step: "02", emoji: "💬", title: "Expert Advice", desc: "Tell us your budget & use-case. Our team recommends the perfect machine — no upselling." },
                    { step: "03", emoji: "🔧", title: "Built & Tested", desc: "Every desktop assembled in-house. Every device quality-checked before it leaves." },
                    { step: "04", emoji: "🚀", title: "Delivered & Backed", desc: "Same-day pickup or pan-India delivery. 1-year warranty + after-sales support included." },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-4 group">
                      <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-transform group-hover:scale-110 duration-300"
                        style={{ background: `${acc}22`, border: `2px solid ${acc}44` }}>
                        {s.emoji}
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-9 font-extrabold text-white"
                          style={{ background: acc, fontSize: 9 }}>{s.step}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm lg:text-base mb-1">{s.title}</h3>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* brands */}
                <div className="mt-12 pt-10 border-t space-y-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">Brands We Stock & Service</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {brands.map((b, i) => (
                      <div key={i} className="svc-card-lift flex items-center gap-2 px-5 py-2.5 rounded-2xl cursor-default"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${b.color}55`; (e.currentTarget as HTMLElement).style.background = `${b.color}14`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                        <span className="text-sm font-bold text-white">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* ══ TESTIMONIALS ══ */}
          <Section delay={80}>
            <div className="text-center mb-14 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: acc }}>Social Proof</p>
              <h2 className="font-extrabold text-gray-900 tracking-tight" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>What Customers Say</h2>
              <div className="flex items-center justify-center gap-1 pt-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                <span className="ml-2 text-sm font-bold text-gray-700">4.8 / 5 on Google</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="svc-card-lift bg-white border border-gray-100 rounded-3xl p-7 relative overflow-hidden group"
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${acc}33`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#f3f4f6"; }}>
                  <div className="absolute top-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: `linear-gradient(90deg, ${acc}, transparent)` }} />
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white"
                      style={{ background: `linear-gradient(135deg, ${acc}, ${acc}99)` }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ══ FINAL CTA ══ */}
          <Section delay={60}>
            <div className="relative rounded-4xl overflow-hidden text-center py-20 px-8" style={{ background: "#07070d" }}>
              <div className="absolute inset-0 svc-hero-grid opacity-30" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full"
                style={{ background: `radial-gradient(ellipse, ${acc}28 0%, transparent 70%)` }} />
              <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
                <h2 className="font-extrabold text-white tracking-tight" style={{ fontSize: "clamp(26px, 4vw, 52px)" }}>
                  Trusted by 50,000+ Customers.<br />
                  <span style={{ color: acc }}>5 Stores. 8 Years Strong.</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm">
                  From a student's first laptop to a company's full desktop fleet — we've built, serviced & supported thousands of machines across West Bengal. Walk in. Talk to us. We'll find the right solution.
                </p>
                <div className="flex flex-wrap gap-4 justify-center pt-2">
                  <Link to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: `linear-gradient(135deg, ${acc}, ${acc}cc)`, boxShadow: `0 8px 32px ${acc}50` }}>
                    <Phone className="w-4 h-4" /> Contact Us
                  </Link>
                  <Link to="/branches"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}>
                    <MapPin className="w-4 h-4" /> Find a Store
                  </Link>
                  <a href="https://service.infofixcomputer.in" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}>
                    <AlertCircle className="w-4 h-4" /> Raise Complaint <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};