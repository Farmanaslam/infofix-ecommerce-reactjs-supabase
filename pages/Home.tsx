
import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Zap, Shield, Globe, Award, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const { setCurrentPage, products } = useStore();
  const featured = products.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
          alt="Nexus Future"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <Sparkles className="w-3 h-3" /> Redefining Commerce 2.0
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter">
            Elevate Your <span className="text-indigo-500">Lifestyle.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover a curated collection of cutting-edge technology and premium essentials designed for the modern trailblazer.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button 
              onClick={() => setCurrentPage('shop')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3"
            >
              Start Shopping <ArrowRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-bold text-lg transition-all backdrop-blur-md"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 max-w-7xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
          <div className="space-y-4">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Featured Drops</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900">Today's Highlights</h3>
          </div>
          <button 
            onClick={() => setCurrentPage('shop')}
            className="text-gray-900 font-bold flex items-center gap-2 hover:text-indigo-600 transition-colors"
          >
            View all collection <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featured.map(product => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 mb-6 shadow-2xl shadow-gray-200">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                  <button 
                    onClick={() => setCurrentPage('shop')}
                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl"
                  >
                    View Details
                  </button>
                </div>
              </div>
              <p className="text-xs font-bold text-indigo-600 uppercase mb-2">{product.category}</p>
              <h4 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h4>
              <p className="text-gray-500 text-sm font-medium">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: Zap, title: "Hyper-Speed Delivery", desc: "Global shipping in under 48 hours for premium members." },
            { icon: Shield, title: "Titanium Security", desc: "Every transaction is protected by bank-grade encryption." },
            { icon: Globe, title: "Global Network", desc: "Over 500 partner branches across all major continents." },
            { icon: Award, title: "Curated Excellence", desc: "Only the top 1% of tech products make it into our store." }
          ].map((item, i) => (
            <div key={i} className="space-y-6">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <item.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
