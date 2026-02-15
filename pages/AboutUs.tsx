
import React from 'react';

export const AboutUs: React.FC = () => {
  return (
    <div className="pb-24">
      <div className="h-[400px] bg-indigo-900 relative flex items-center justify-center text-center">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="Our Team"
        />
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">Our Legacy.</h1>
          <p className="text-indigo-200 text-xl font-medium max-w-xl mx-auto">Built by innovators, for the next generation of pioneers.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-24 space-y-20">
        <section className="space-y-8">
          <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Since 2024</h2>
          <h3 className="text-4xl font-black text-gray-900 leading-tight">We believe that premium quality shouldn't come with compromise.</h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">
            NexusCart was founded on the principle that the shopping experience should be as innovative as the products themselves. 
            We started as a small tech collective and grew into a global powerhouse by obsessing over the details that others ignore. 
            From our AI-powered supply chain to our white-glove delivery service, every touchpoint is designed to delight.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <div className="text-5xl font-black text-indigo-600">50M+</div>
            <p className="text-gray-900 font-bold text-lg">Happy Customers</p>
            <p className="text-gray-500 font-medium">Serving a global community of thinkers and doers.</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-black text-indigo-600">120+</div>
            <p className="text-gray-900 font-bold text-lg">Innovation Awards</p>
            <p className="text-gray-500 font-medium">Recognized for excellence in UI/UX and sustainable tech.</p>
          </div>
        </div>

        <section className="bg-gray-50 p-12 rounded-[40px] space-y-6">
          <h4 className="text-2xl font-bold text-gray-900">Our Core Values</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h5 className="font-bold text-indigo-600 mb-2">Integrity First</h5>
              <p className="text-gray-500 text-sm font-medium">We source ethically and transparency is at our core.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h5 className="font-bold text-indigo-600 mb-2">Constant Evolution</h5>
              <p className="text-gray-500 text-sm font-medium">We are never finished. We iterate daily to stay ahead.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
