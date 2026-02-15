
import React from 'react';
import { Calendar, User, Clock, ChevronRight } from 'lucide-react';

export const Updates: React.FC = () => {
  const posts = [
    {
      title: "Nexus Pro Series: The Future of Spatial Audio",
      excerpt: "We explore the breakthrough technology behind our newest driver array and what it means for the audiophile community.",
      category: "Innovation",
      author: "Marcus Chen",
      date: "Oct 12, 2024",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2070"
    },
    {
      title: "Our Commitment to Carbon-Zero Logistics",
      excerpt: "Announcing our 2030 roadmap for a completely sustainable global supply chain and the partners helping us get there.",
      category: "Sustainability",
      author: "Sarah West",
      date: "Oct 10, 2024",
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=2070"
    },
    {
      title: "Designing the Perfect Home Office Interface",
      excerpt: "Why we believe minimal design isn't just an aesthetic, but a productivity requirement in the remote age.",
      category: "Design",
      author: "Elena Rod",
      date: "Oct 08, 2024",
      image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070"
    }
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Insights & Updates.</h1>
        <div className="flex gap-4 mt-6 md:mt-0">
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold">Latest</button>
          <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-200">Engineering</button>
          <button className="px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-bold hover:bg-gray-200">Company</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16">
        {posts.map((post, i) => (
          <div key={i} className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center cursor-pointer">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[40px] shadow-2xl shadow-gray-200">
              <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={post.title} />
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {post.category}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</div>
                <div className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author}</div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">{post.excerpt}</p>
              <button className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Read full article <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
