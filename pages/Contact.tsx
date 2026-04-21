import React from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock,ShoppingCart } from "lucide-react";
import { useStore } from "../context/StoreContext";

export const Contact: React.FC = () => {
  const { setCurrentPage } = useStore();
  return (
    <div className="py-8 md:py-24 app-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              <span className="bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                Get in Touch
              </span>{" "}
              with Infofix Computers
            </h1>

            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              We’re here to help you with computer sales, repairs, orders, and
              technical support. Reach out to the right team and get fast,
              reliable assistance.
            </p>

            <p className="text-sm font-bold text-indigo-600 mt-4">
              Your trusted destination for computers, accessories, and expert
              technical support.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  Infofix Computers – Durgapur Branch
                </h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Ananda Gopal Mukherjee Sarani Road
                  <br />
                  Near BINA Gas, Kamalpur Plot
                  <br />
                  Benachity, Durgapur – 713213
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Email Us</h4>
                <p className="text-gray-500 font-medium">
                  infofixcomputers1@gmail.com
                </p>
                <p className="text-xs text-indigo-600 font-bold mt-1">
                  Response time: Within 24 hours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Call Us</h4>
                <p className="text-gray-500 font-medium">+91 8293295257</p>
                <p className="text-xs text-indigo-600 font-bold mt-1">
                  Available Mon-Sun, 10am - 8pm
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  Service Hours
                </h4>
                <p className="text-gray-500 font-medium">
                  Monday – Sunday: 10:00 AM – 8:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-2 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const name = (
                form.querySelector('[name="fullname"]') as HTMLInputElement
              ).value;
              const phone = (
                form.querySelector('[name="phone"]') as HTMLInputElement
              ).value;
              const subject = (
                form.querySelector('[name="subject"]') as HTMLSelectElement
              ).value;
              const message = (
                form.querySelector('[name="message"]') as HTMLTextAreaElement
              ).value;
              const text = `Hi Infofix Computers! 👋\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Subject:* ${subject}\n*Message:* ${message}`;
              window.open(
                `https://wa.me/8293295257?text=${encodeURIComponent(text)}`,
                "_blank",
              );
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  name="fullname"
                  type="text"
                  placeholder="Krishna Sharma"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 00000 00000"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Subject
              </label>
              <select
                name="subject"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all appearance-none cursor-pointer"
              >
                <option>Order Inquiry</option>
                <option>Repair Request</option>
                <option>Product Question</option>
                <option>Business / Bulk Order</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Your Message
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="How can we help you today?"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none transition-all"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              Send Message <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400 font-medium">
            Your information is safe with us. We never share customer data.
          </p>
          <div className="mt-8 p-6 bg-indigo-50 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-indigo-900 leading-tight">
              Prefer instant messaging? <br />
              <a
                href="https://wa.me/8670777086?text=Hi%20Infofix%20Computers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Chat with us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* Why Choose Section - Premium Styled */}
      <div className="mt-10 md:mt-28 relative">
        <div className="text-center mb-14">
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              Why Choose Infofix Computers?
            </span>
          </h3>
          <p className="text-gray-500 mt-4 font-medium">
            Trusted by students, professionals, and businesses across Durgapur.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 hover:-translate-y-2 transition-all duration-300">
            <h4 className="font-bold text-gray-900 mb-2">Expert Technicians</h4>
            <p className="text-sm text-gray-500">
              Experienced and trained staff for reliable solutions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 hover:-translate-y-2 transition-all duration-300">
            <h4 className="font-bold text-gray-900 mb-2">In-House Repairs</h4>
            <p className="text-sm text-gray-500">
              Professional repair, servicing and upgrades under one roof.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 hover:-translate-y-2 transition-all duration-300">
            <h4 className="font-bold text-gray-900 mb-2">Refurbished Deals</h4>
            <p className="text-sm text-gray-500">
              Budget-friendly refurbished PCs & laptops, fully tested, cleaned,
              and backed with warranty.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 hover:-translate-y-2 transition-all duration-300">
            <h4 className="font-bold text-gray-900 mb-2">Reliable Support</h4>
            <p className="text-sm text-gray-500">
              Quick response and dependable after-sales service.
            </p>
          </div>
        </div>
      </div>
      {/* Bottom CTA */}
    {/* Bottom CTA */}
{/* Bottom CTA */}
<div className="mt-24 relative overflow-hidden rounded-3xl" style={{ background: "#0a0a0f" }}>
  {/* Grid pattern */}
  <div
    className="absolute inset-0"
    style={{
      backgroundImage:
        "linear-gradient(rgba(99,102,241,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.07) 1px,transparent 1px)",
      backgroundSize: "40px 40px",
    }}
  />
  {/* Glow blob */}
  <div
    className="absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
    style={{
      background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
    }}
  />

  {/* Header */}
  <div className="relative px-8 md:px-16 pt-12 pb-8 text-center border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
      style={{
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.25)",
        color: "#818cf8",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
      Need Help or the Right Product?
    </div>
    <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
      We're here every day, 10am – 8pm.
    </h3>
    <p className="font-medium max-w-md mx-auto leading-relaxed" style={{ color: "#6b7280" }}>
      Browse our store, visit us in person, or just drop a message — our team responds fast.
    </p>
  </div>

  {/* Three columns */}
  <div className="relative grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: "rgba(255,255,255,0.07)" }}>

    {/* Shop */}
    <div className="p-8 flex flex-col gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        <ShoppingCart className="w-5 h-5" style={{ color: "#818cf8" }} />
      </div>
      <div className="flex-1">
        <h4 className="font-black text-white mb-1">Shop Online</h4>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#6b7280" }}>
          Browse PCs, laptops, accessories & refurbished deals.
        </p>
      </div>
      <button
        onClick={() => setCurrentPage("shop")}
        className="mt-auto w-fit flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all hover:opacity-90 cursor-pointer"
        style={{ background: "#6366f1" }}
      >
        Browse Store →
      </button>
    </div>

    {/* Visit */}
    <div className="p-8 flex flex-col gap-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <MapPin className="w-5 h-5" style={{ color: "#10b981" }} />
      </div>
      <div className="flex-1">
        <h4 className="font-black text-white mb-1">Visit Our Store</h4>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#6b7280" }}>
          Benachity, Durgapur. Open every day 10am – 8pm.
        </p>
      </div>
      <button
        onClick={() => setCurrentPage("branches")}
        className="mt-auto w-fit flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:bg-white/10 cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#9ca3af" }}
      >
        Get Directions →
      </button>
    </div>

    {/* WhatsApp */}
    <div className="p-8 flex flex-col gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.2)" }}
      >
        <MessageCircle className="w-5 h-5" style={{ color: "#ec4899" }} />
      </div>
      <div className="flex-1">
        <h4 className="font-black text-white mb-1">Message on WhatsApp</h4>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#6b7280" }}>
          Fastest way to reach us. We reply within minutes.
        </p>
      </div>
      <a
        href="https://wa.me/8293295257?text=Hi%20Infofix%20Computers,%20I%20need%20help"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto w-fit flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white uppercase tracking-wider transition-all hover:opacity-90"
        style={{ background: "#16a34a" }}
      >
        Chat Now →
      </a>
    </div>

  </div>

  {/* Footer bar */}
  <div
    className="relative px-8 py-4 flex items-center justify-center gap-2 flex-wrap border-t"
    style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
  >
    <Clock className="w-3.5 h-3.5" style={{ color: "#4b5563" }} />
    <p className="text-xs font-medium" style={{ color: "#4b5563" }}>
      Mon – Sun &nbsp;·&nbsp; 10:00 AM – 8:00 PM &nbsp;·&nbsp; +91 82932 95257 &nbsp;·&nbsp; infofixcomputers1@gmail.com
    </p>
  </div>
</div>
    </div>
  );
};
