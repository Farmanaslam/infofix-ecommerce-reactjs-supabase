import { useStore } from "@/context/StoreContext";
import React from "react";
import {
  Monitor,
  Laptop,
  Cpu,
  Wrench,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Users,
  Award,
  RefreshCw,
} from "lucide-react";

export const AboutUs: React.FC = () => {
  const { setIsMessageModalOpen, setCurrentPage } = useStore();

  return (
    <div className="pb-24">
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        .pulse-dot { animation: pulseDot 2s ease infinite; }
        .card-lift { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .card-lift:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(99,102,241,0.1); }
      `}</style>

      {/* ── HERO — exactly as original ── */}
      <div className="h-125 bg-indigo-900 relative flex items-center justify-center text-center">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="Computer Shop"
        />
        <div className="relative z-10 px-4 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Built on Trust. Driven by Technology.
          </h1>
          <p className="text-indigo-100 text-xl font-medium">
            Infofix combines quality devices, expert builds, and transparent
            pricing to deliver powerful computing solutions for students,
            professionals, and businesses across West Bengal.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-24 space-y-28">
        {/* ── ABOUT INFOFIX ── */}
        <section className="space-y-8 text-center max-w-4xl mx-auto">
          <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            About Infofix
          </h2>
          <h3 className="text-4xl font-black text-gray-900 leading-tight">
            Reliable Technology. Honest Pricing. Long-Term Value.
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed font-medium">
            Infofix Computers is Durgapur's most trusted technology company —
            specializing in new laptops, desktop PCs, and fully custom-built
            computers. Every machine we sell is hand-configured and tested by
            our in-house technicians before it reaches you. We've been serving
            students, professionals, and businesses since 2017 across 5 physical
            branches in West Bengal — and we're just getting started.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            {[
              {
                value: "50,000+",
                label: "Happy Customers",
                icon: Users,
                color: "#6366f1",
              },
              {
                value: "5",
                label: "Physical Stores",
                icon: MapPin,
                color: "#10b981",
              },
              {
                value: "500+",
                label: "Devices Sold",
                icon: Monitor,
                color: "#f59e0b",
              },
              {
                value: "8+",
                label: "Years Trusted",
                icon: Award,
                color: "#ef4444",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl py-6 px-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: s.color + "18" }}
                >
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-gray-400 text-center">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── MISSION & VISION ── */}
        <section
          className="rounded-[40px] overflow-hidden relative"
          style={{ background: "#0a0a0f" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 p-12 md:p-16 grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="space-y-5">
              <div
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#818cf8",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
                Our Mission
              </div>
              <h4 className="text-2xl font-black text-white leading-tight">
                Make powerful computing accessible to every budget in West
                Bengal.
              </h4>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">
                We believe everyone deserves a machine that genuinely performs —
                not just hardware that looks good on paper. Our mission is to
                match every customer with the right laptop, desktop, or custom
                build for their exact use case, at the best possible price,
                backed by expert guidance and fully honest service.
              </p>
              <div className="space-y-2.5 pt-2">
                {[
                  "No upselling — we recommend what you actually need",
                  "Price-match on any verified local competitor",
                  "In-house technicians who stand behind every build",
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm font-medium">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision */}
            <div className="space-y-5">
              <div
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#34d399",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Our Vision
              </div>
              <h4 className="text-2xl font-black text-white leading-tight">
                Become West Bengal's most trusted name in laptops and custom
                PCs.
              </h4>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">
                We're building more than a store — we're building a brand that
                customers return to and recommend. As we expand our branches,
                grow our online presence, and scale our custom-build program,
                our vision stays the same: technology that works, from people
                you can trust.
              </p>
              <div className="space-y-2.5 pt-2">
                {[
                  "Expanding across West Bengal city by city",
                  "Growing our custom PC build program statewide",
                  "A digital platform customers rely on, not just browse",
                ].map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm font-medium">
                      {pt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT WE OFFER ── */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              What We Offer
            </h2>
            <h3 className="text-4xl font-black text-gray-900 leading-tight">
              Everything You Need. One Place.
            </h3>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              From a student's first laptop to a developer's custom workstation
              — we build, sell, and support it all under one roof.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Wrench,
                title: "Repairs & Upgrades",
                badge: "Fast Turnaround",
                badgeColor: "#818cf8",
                desc: "Hardware faults, screen replacements, RAM and SSD upgrades, OS reinstalls — our certified in-house team handles it all with quick turnaround and warranty.",
                from: "Walk in anytime",
                dark: false,
              },
              {
                icon: RefreshCw,
                title: "Certified Refurbished Laptops",
                badge: "Grade A Quality",
                badgeColor: "#ec4899",
                desc: "Every refurbished laptop at Infofix is cleaned, tested, and restored by our in-house technicians. We upgrade storage to SSD, verify all hardware, and provide a 6-month warranty — so you get near-new performance at half the price.",
                from: "Quality Checked • Warranty Backed",
                dark: false,
              },
              {
                icon: ShieldCheck,
                title: "1-Year Warranty",
                badge: "All Devices",
                badgeColor: "#06b6d4",
                desc: "Every laptop and desktop PC we sell comes with a full 1-year hardware warranty — claimable at any of our 5 branches. We stand behind every machine we build.",
                from: "Included on all sales",
                dark: false,
              },
            ].map((svc, i) => (
              <div
                key={i}
                className={`card-lift group relative rounded-3xl p-8 border transition-all duration-300 ${
                  svc.dark
                    ? "bg-gray-900 border-gray-800"
                    : "bg-white border-gray-100 hover:border-indigo-100"
                }`}
              >
                {svc.dark && (
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 70%)",
                    }}
                  />
                )}
                <div className="relative z-10 flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: svc.badgeColor + "18" }}
                    >
                      <svc.icon
                        className="w-6 h-6"
                        style={{ color: svc.badgeColor }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                      style={{
                        background: svc.badgeColor + "18",
                        color: svc.badgeColor,
                      }}
                    >
                      {svc.badge}
                    </span>
                  </div>
                  <div>
                    <h4
                      className={`font-black text-lg mb-2 ${svc.dark ? "text-white" : "text-gray-900"}`}
                    >
                      {svc.title}
                    </h4>
                    <p
                      className={`text-sm font-medium leading-relaxed ${svc.dark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {svc.desc}
                    </p>
                  </div>
                  <div
                    className={`text-xs font-black mt-auto pt-4 border-t ${svc.dark ? "border-white/10" : "border-gray-100"}`}
                    style={{ color: svc.badgeColor }}
                  >
                    {svc.from}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY CHOOSE INFOFIX ── */}
        <section className="bg-indigo-900 text-white p-12 md:p-16 rounded-[40px] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-xs font-black text-indigo-300 uppercase tracking-widest">
                Why Choose Infofix
              </h2>
              <h3 className="text-3xl md:text-4xl font-black">
                The Infofix Difference
              </h3>
              <p className="text-indigo-200 font-medium max-w-xl mx-auto">
                50,000+ customers chose us. Here's why they keep coming back.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  emoji: "💰",
                  title: "Lowest Prices, Guaranteed",
                  desc: "We match or beat any verified competitor price in West Bengal. No hidden charges, no surprises.",
                },
                {
                  emoji: "🔧",
                  title: "Expert In-House Technicians",
                  desc: "Every machine is built, tested, and configured by certified engineers before it reaches you.",
                },
                {
                  emoji: "🏪",
                  title: "5 Physical Stores",
                  desc: "Walk in, see the hardware live, speak to real people. No chatbots — just expert humans.",
                },
                {
                  emoji: "🛡️",
                  title: "1-Year Hardware Warranty",
                  desc: "Every laptop and desktop PC we sell comes with a full 1-year warranty backed by our service team.",
                },
                {
                  emoji: "⚡",
                  title: "Same-Day Ready",
                  desc: "Most configurations available same-day. Custom builds assembled and delivered within 48 hours.",
                },
                {
                  emoji: "🎯",
                  title: "Honest, Unbiased Advice",
                  desc: "We recommend what genuinely fits your workload and budget — not the highest-margin item on the shelf.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/8 border border-white/10 rounded-2xl p-6 space-y-2 hover:bg-white/12 transition-colors"
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <h4 className="font-black text-white text-sm">
                    {item.title}
                  </h4>
                  <p className="text-indigo-200 text-xs font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR JOURNEY ── */}
        <section className="space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
              Our Journey
            </h2>
            <h3 className="text-4xl font-black text-gray-900">
              Started Small. Grown Through Trust.
            </h3>
            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-3xl mx-auto">
              What began as a single computer sales outlet in Durgapur has grown
              into West Bengal's most recognized multi-branch technology
              company. Our growth hasn't come from ads — it's come from
              customers walking out satisfied and sending their friends and
              colleagues back to us.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />
            <div className="space-y-8">
              {[
                {
                  year: "2017",
                  side: "left",
                  title: "Founded in Durgapur",
                  desc: "Infofix opened its first outlet with a simple promise — quality computers at honest prices, backed by real expertise.",
                  color: "#6366f1",
                },
                {
                  year: "2019",
                  side: "right",
                  title: "Second Branch Launched",
                  desc: "Customer demand drove expansion. Our second location opened to serve a growing base of professionals and businesses.",
                  color: "#10b981",
                },
                {
                  year: "2021",
                  side: "left",
                  title: "Custom Build Program Introduced",
                  desc: "We launched our signature custom PC build service — letting customers define their specs, budget, and use case.",
                  color: "#f59e0b",
                },
                {
                  year: "2023",
                  side: "right",
                  title: "Expanded to 5 Stores",
                  desc: "With branches across Durgapur, Asansol, and Ukhra, Infofix became a recognized name across West Bengal.",
                  color: "#818cf8",
                },
                {
                  year: "Now",
                  side: "left",
                  title: "Going Digital & Beyond",
                  desc: "Our online store is live. We're expanding our reach, our product range, and our custom-build program statewide.",
                  color: "#ef4444",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col md:flex-row items-center gap-6 ${item.side === "right" ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="md:w-[calc(50%-32px)] w-full">
                    <div className="card-lift bg-white border border-gray-100 rounded-2xl p-6 space-y-2 hover:border-indigo-100">
                      <div
                        className="text-xs font-black uppercase tracking-widest"
                        style={{ color: item.color }}
                      >
                        {item.year}
                      </div>
                      <h4 className="font-black text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className="hidden md:flex w-14 h-14 rounded-full items-center justify-center font-black text-white text-xs shrink-0 z-10"
                    style={{ background: item.color }}
                  >
                    {item.year === "Now" ? "Now" : item.year.slice(2)}
                  </div>
                  <div className="md:w-[calc(50%-32px)] hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="bg-gray-50 p-12 rounded-[40px] text-center space-y-6">
          <h3 className="text-3xl font-black text-gray-900">
            Have a Question? Reach Out to Us
          </h3>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Need help choosing a laptop, planning a custom build, or finding the
            nearest branch? Send us a message and our team will respond shortly.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setIsMessageModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold transition cursor-pointer"
            >
              Send Message
            </button>
            <button
              onClick={() => setCurrentPage("branches")}
              className="border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 px-8 py-3.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Find a Store
            </button>
          </div>

          <p className="text-sm text-gray-400">
            We respect your privacy. Your details are used only for
            communication purposes.
          </p>
        </section>
      </div>
    </div>
  );
};
