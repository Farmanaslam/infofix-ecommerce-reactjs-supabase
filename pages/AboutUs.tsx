import React from "react";

export const AboutUs: React.FC = () => {
  return (
    <div className="pb-24">
      {/* HERO SECTION */}
      <div className="h-[500px] bg-indigo-900 relative flex items-center justify-center text-center">
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
            Infofix combines quality devices, expert servicing, and transparent
            pricing to deliver reliable computing solutions for students,
            professionals, and businesses.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-24 space-y-28">
        {/* ABOUT INFOFIX */}
        <section className="space-y-6 text-center max-w-4xl mx-auto">
          <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            About Infofix
          </h2>
          <h3 className="text-4xl font-black text-gray-900 leading-tight">
            Reliable Technology. Honest Pricing. Long-Term Value.
          </h3>
          <p className="text-gray-600 text-lg leading-relaxed font-medium">
            Infofix is a growing technology and e-commerce company specializing
            in new and certified refurbished laptops, desktops, and accessories.
            Every device is carefully tested and professionally serviced to
            ensure dependable performance for students, professionals, and
            businesses.
          </p>
        </section>

        {/* MISSION & VISION */}
        <section className="bg-gray-50 p-12 rounded-[40px] space-y-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-indigo-600">
                Our Mission
              </h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                To make dependable technology accessible to everyone by offering
                high-quality new and refurbished devices backed by expert
                service and transparent guidance.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-indigo-600">Our Vision</h4>
              <p className="text-gray-600 font-medium leading-relaxed">
                To build a trusted and scalable computer retail brand where
                affordability, quality, and sustainable computing go hand in
                hand.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="space-y-8">
          <h3 className="text-3xl font-black text-gray-900 text-center">
            What We Offer
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "New & Certified Refurbished Laptops",
              "Computer Accessories & Peripherals",
              "In-House Repairs & Hardware Upgrades",
              "Laptop Buyback & Exchange Programs",
              "Business & Individual Tech Solutions",
              "Strict Quality Testing on Every Device",
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-lg transition"
              >
                <p className="text-gray-800 font-semibold">{service}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE INFOFIX */}
        <section className="bg-indigo-900 text-white p-16 rounded-[40px] text-center space-y-8">
          <h3 className="text-3xl font-black">Why Choose Infofix</h3>
          <div className="grid md:grid-cols-2 gap-8 text-indigo-100 font-medium">
            <p>Affordable pricing without compromising quality</p>
            <p>Strict testing for refurbished devices</p>
            <p>Professional in-house servicing</p>
            <p>Transparent and honest recommendations</p>
            <p>Physical store presence for direct support</p>
            <p>Long-term customer-focused support</p>
          </div>
        </section>

        {/* OUR JOURNEY */}
        <section className="space-y-6 max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-black text-gray-900">Our Journey</h3>
          <p className="text-gray-600 text-lg font-medium leading-relaxed">
            What began as a focused computer sales and service operation has
            grown steadily through customer trust and technical expertise.
            Today, Infofix operates through four physical branches supported by
            a growing digital presence — continuing to evolve as a modern
            technology company.
          </p>
        </section>

        {/* TRUST SECTION */}
        <section className="grid md:grid-cols-4 gap-8 text-center">
          {[
            "Thousands of Devices Sold",
            "Experienced Technical Team",
            "Diverse Customer Base",
            "Expanding Digital Presence",
          ].map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="text-4xl font-black text-indigo-600">
                {index === 0
                  ? "1000+"
                  : index === 1
                    ? "Expert"
                    : index === 2
                      ? "Wide"
                      : "4+"}
              </div>
              <p className="text-gray-700 font-semibold">{item}</p>
            </div>
          ))}
        </section>

        {/* CONTACT SECTION */}
        <section className="bg-gray-50 p-12 rounded-[40px] text-center space-y-6">
          <h3 className="text-3xl font-black text-gray-900">
            Have a Question? Reach Out to Us
          </h3>
          <p className="text-gray-600 font-medium max-w-xl mx-auto">
            Need help choosing a product or locating a branch? Send us a message
            and our team will respond shortly.
          </p>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition">
            Send Message
          </button>

          <p className="text-sm text-gray-500">
            We respect your privacy. Your details are used only for
            communication purposes.
          </p>
        </section>
      </div>
    </div>
  );
};
