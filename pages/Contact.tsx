
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
              WELCOME TO <span className="text-indigo-600">INFOFIX COMPUTER</span>
            </h1>
            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              Your premier destination for high-performance computing, expert repairs, and digital solutions in Durgapur.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Visit Our Store</h4>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Ananda Gopal Mukherjee Sarani Rd, near BINA GAS,<br />
                  Kamalpur Plot, Benachity, Durgapur,<br />
                  West Bengal 713213
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Email Us</h4>
                <p className="text-gray-500 font-medium">infofixcomputers1@gmail.com</p>
                <p className="text-xs text-indigo-600 font-bold mt-1">Response time: Within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Phone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Call Us</h4>
                <p className="text-gray-500 font-medium">+91 8293295257</p>
                <p className="text-xs text-indigo-600 font-bold mt-1">Available Mon-Sat, 10am - 8pm</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Service Hours</h4>
                <p className="text-gray-500 font-medium">Monday - Saturday: 10:00 AM - 8:30 PM</p>
                <p className="text-gray-500 font-medium">Sunday: Closed / Emergency Only</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 00000 00000"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Service Required</label>
              <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all appearance-none cursor-pointer">
                <option>Laptop/PC Repair</option>
                <option>Custom PC Build</option>
                <option>Hardware Purchase</option>
                <option>Software Installation</option>
                <option>Networking Solutions</option>
                <option>Other Inquiry</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Message</label>
              <textarea 
                rows={4} 
                placeholder="How can we help you today?"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none transition-all"
              ></textarea>
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]">
              Send Message <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-8 p-6 bg-indigo-50 rounded-3xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-indigo-900 leading-tight">
              Prefer instant messaging? <br />
              <button className="text-indigo-600 hover:underline">Chat with us on WhatsApp</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
