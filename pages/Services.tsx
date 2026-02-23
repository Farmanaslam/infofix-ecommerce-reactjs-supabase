import React from "react";
import {
  Laptop,
  ShieldCheck,
  Wrench,
  RefreshCw,
  CreditCard,
  Camera,
} from "lucide-react";

export const Services: React.FC = () => {
  const services = [
    {
      icon: Laptop,
      title: "New & Refurbished Devices",
      desc: "Premium quality new and certified refurbished laptops, desktops, and PCs — professionally tested and ready for performance.",
    },
    {
      icon: ShieldCheck,
      title: "Warranty Protection",
      desc: "Up to 1 year warranty on refurbished devices and manufacturer warranty on new products for complete peace of mind.",
    },
    {
      icon: Wrench,
      title: "Repairs & Upgrades",
      desc: "Expert hardware repairs, SSD upgrades, RAM expansion, battery replacement, and performance optimization services.",
    },
    {
      icon: RefreshCw,
      title: "Device Exchange & Buyback",
      desc: "Upgrade smarter with our exchange program. Trade in old devices and get the best value on your next purchase.",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Options",
      desc: "Affordable pricing with easy payment options to make technology accessible for students, professionals, and businesses.",
    },
    {
      icon: Camera,
      title: "CCTV & Security Solutions",
      desc: "Complete CCTV setup for homes, offices, and shops — including installation, configuration, and after-sales support.",
    },
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-24 space-y-6">
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
          Complete Technology Solutions.
        </h1>
        <p className="text-gray-500 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
          Infofix Computers provides trusted sales, expert repairs, and
          long-term support for laptops, desktops, accessories, and security
          systems — all backed by real technicians and real experience.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {services.map((service, i) => (
          <div
            key={i}
            className="group p-10 bg-white border border-gray-200 rounded-4xl 
            hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 
            transition-all duration-500"
          >
            <div
              className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center 
              justify-center text-gray-400 group-hover:bg-indigo-600 
              group-hover:text-white transition-all mb-8"
            >
              <service.icon className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
              {service.title}
            </h3>

            <p className="text-gray-500 leading-relaxed font-medium">
              {service.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Trust Section */}
      <div className="mt-32 bg-indigo-600 rounded-[40px] p-16 text-center text-white shadow-2xl">
        <h2 className="text-4xl font-black mb-6">
          Trusted by Students, Professionals & Businesses
        </h2>
        <p className="max-w-3xl mx-auto text-lg font-medium opacity-90 leading-relaxed">
          With years of hands-on technical experience and thousands of devices
          sold, serviced, and refurbished, Infofix Computers is committed to
          delivering reliable technology solutions at affordable prices.
        </p>
      </div>
    </div>
  );
};
