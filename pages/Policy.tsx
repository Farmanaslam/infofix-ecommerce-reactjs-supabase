import React from "react";

export const Policy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Our Policies
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Clear, transparent policies designed to ensure a safe and smooth
            shopping experience at InfoFix Computers.
          </p>
        </div>

        {/* Grid Layout Like Your Product Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          <PolicyCard
            title="Shipping & Delivery"
            content={[
              "Orders processed within 24–48 business hours.",
              "Delivery timelines depend on location & availability.",
              "Free delivery on selected products.",
              "Service available across supported regions.",
            ]}
          />

          <PolicyCard
            title="Return & Replacement"
            content={[
              "Accepted for manufacturing defects or wrong items.",
              "Request within 48 hours of delivery.",
              "Original packaging required.",
              "No return for physical misuse.",
            ]}
          />

          <PolicyCard
            title="Refund Policy"
            content={[
              "Processed after inspection approval.",
              "5–7 business days refund timeline.",
              "Credited to original payment method.",
              "COD refunds via bank transfer.",
            ]}
          />

          <PolicyCard
            title="Warranty Policy"
            content={[
              "Warranty varies by product & brand.",
              "Refurbished items may have limited warranty.",
              "Excludes physical & liquid damage.",
              "Authorized support provided.",
            ]}
          />

          <PolicyCard
            title="Payment Methods"
            content={[
              "UPI (GPay, PhonePe, Paytm)",
              "Debit / Credit Cards",
              "Net Banking",
              "Cash on Delivery (where available)",
            ]}
          />

          <PolicyCard
            title="Privacy & Terms"
            content={[
              "We collect only essential information.",
              "Customer data is never sold.",
              "Secure encrypted transactions.",
              "Using our website means acceptance of policies.",
            ]}
          />
        </div>

        {/* Contact Section Styled Like Your CTA Sections */}
        <div className="mt-16 bg-indigo-50 border border-indigo-100 rounded-2xl p-10 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-2">
            Email: infofixcomputers1@gmail.com
          </p>
          <p className="text-gray-600">Phone: +91 8293295257</p>
        </div>
      </div>
    </div>
  );
};

const PolicyCard = ({
  title,
  content,
}: {
  title: string;
  content: string[];
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300">
    <h2 className="text-xl font-bold text-indigo-600 mb-4">{title}</h2>
    <ul className="space-y-2 text-gray-600 text-sm">
      {content.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  </div>
);
