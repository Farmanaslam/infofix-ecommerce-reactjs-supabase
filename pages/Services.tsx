import React from "react";
import {
  Truck,
  Headphones,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  PackageCheck,
} from "lucide-react";

export const Services: React.FC = () => {
  const services = [
    {
      icon: Truck,
      title: "Global Express",
      desc: "Next-day shipping to over 200 cities worldwide.",
    },
    {
      icon: Headphones,
      title: "24/7 Concierge",
      desc: "Dedicated human support experts available around the clock.",
    },
    {
      icon: ShieldCheck,
      title: "Extended Warranty",
      desc: "Up to 5 years of comprehensive protection on all electronics.",
    },
    {
      icon: CreditCard,
      title: "Flexible Payments",
      desc: "Zero-interest installments on purchases over $500.",
    },
    {
      icon: RotateCcw,
      title: "No-Hassle Returns",
      desc: "90-day free returns with home pickup service.",
    },
    {
      icon: PackageCheck,
      title: "Eco-Packaging",
      desc: "100% biodegradable and recycled materials for every box.",
    },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      <div className="text-center mb-24 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
          Beyond the Product.
        </h1>
        <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
          We provide an ecosystem of services designed to support your
          high-performance lifestyle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {services.map((service, i) => (
          <div
            key={i}
            className="group p-10 bg-white border border-gray-200 rounded-[32px] hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-8">
              <service.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {service.title}
            </h3>
            <p className="text-gray-500 leading-relaxed font-medium">
              {service.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
