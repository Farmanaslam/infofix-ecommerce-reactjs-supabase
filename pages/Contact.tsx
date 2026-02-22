import React from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { useStore } from "../context/StoreContext";
export const Contact: React.FC = () => {
  const { setCurrentPage } = useStore();
  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
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
                  Available Mon-Sat, 10am - 8pm
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
                  Monday – Saturday: 10:00 AM – 8:30 PM
                </p>
                <p className="text-gray-500 font-medium">
                  Sunday: Closed / Limited Support
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
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
              <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all appearance-none cursor-pointer">
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
                rows={4}
                placeholder="How can we help you today?"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none transition-all"
              ></textarea>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]">
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
                href="https://wa.me/918927881606?text=Hi%20Infofix%20Computers"
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
      <div className="mt-28 relative">
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
            <h4 className="font-bold text-gray-900 mb-2">Genuine Products</h4>
            <p className="text-sm text-gray-500">
              Authentic accessories and branded components only.
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
      <div className="mt-24 bg-indigo-600 text-white rounded-3xl p-12 text-center space-y-6">
        <h3 className="text-3xl font-black">
          Need Immediate Help or Looking for the Right Product?
        </h3>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button
            onClick={() => setCurrentPage("shop")}
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl cursor-pointer font-bold hover:scale-105 transition"
          >
            🛒 Shop Now
          </button>

          <button
            onClick={() => setCurrentPage("branches")}
            className="bg-white/20 backdrop-blur-md border cursor-pointer border-white/30 px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition"
          >
            📍 Visit Our Store
          </button>

          <a
            href="https://wa.me/918927881606?text=Hi%20Infofix%20Computers,%20I%20need%20help"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 px-6 py-3 rounded-2xl font-bold cursor-pointer hover:bg-green-400 transition text-white text-center"
          >
            📲 Message on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
