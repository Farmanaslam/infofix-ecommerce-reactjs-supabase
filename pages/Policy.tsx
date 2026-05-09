import React from "react";
import { useStore } from "../context/StoreContext";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
export const Policy: React.FC = () => {
  const { selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  return (
    <div className="bg-gray-50/40 min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Our Policies
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transparent policies designed to ensure trust, clarity, and a smooth
            shopping experience at Infofix Computers.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Last Updated: February 2026
          </p>
        </div>

        {/* Intro Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: theme.accent }}>
            Customer Commitment
          </h2>
          <p className="text-gray-600 leading-relaxed">
            At Infofix Computers, customer satisfaction and transparency are our
            top priorities. These policies explain how we handle shipping,
            payments, returns, warranties, and data privacy to ensure a secure
            and reliable shopping experience.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <PolicyCard theme={theme}
            title="🚚 Shipping & Delivery"
            content={[
              "Orders processed within 24–48 business hours.",
              "Delivery timelines depend on location & availability.",
              "Free delivery on selected products.",
              "Delays may occur during festivals or peak seasons.",
              "Service support available across serviceable regions.",
            ]}
          />

          <PolicyCard theme={theme}
            title="🔄 Return & Replacement"
            content={[
              "Accepted for manufacturing defects or wrong items.",
              "Request must be raised within 48 hours of delivery.",
              "Original packaging & accessories required.",
              "Transit damage must be reported immediately.",
              "No return for misuse or post-delivery damage.",
            ]}
          />

          <PolicyCard theme={theme}
            title="💰 Refund Policy"
            content={[
              "Refund initiated after quality inspection approval.",
              "Processed within 5–7 business days.",
              "Credited to original payment method.",
              "COD refunds processed via bank transfer.",
              "No refund for change of mind after delivery.",
            ]}
          />

          <PolicyCard theme={theme}
            title="🛠 Warranty Policy"
            content={[
              "Warranty varies by product & brand.",
              "Refurbished products may have limited warranty.",
              "Excludes physical, liquid, or unauthorized repairs.",
              "Support via authorized service centers or in-house team.",
            ]}
          />

          <PolicyCard theme={theme}
            title="💳 Payment Policy"
            content={[
              "UPI (Google Pay, PhonePe, Paytm).",
              "Debit / Credit Cards.",
              "Net Banking.",
              "Cash on Delivery (where available).",
              "All payments processed through secure gateways.",
              "We do not store card details.",
            ]}
          />

          <PolicyCard theme={theme}
            title="🔐 Privacy & Data Protection"
            content={[
              "We collect only essential customer information.",
              "Name, Email, Phone & Shipping Address.",
              "Data is never sold or shared without consent.",
              "Encrypted and secure transaction systems used.",
              "Customers may request data updates anytime.",
            ]}
          />

          <PolicyCard theme={theme}
            title="❌ Order Cancellation"
            content={[
              "Orders can be cancelled before dispatch.",
              "Shipped orders cannot be cancelled.",
              "Refunds processed as per Refund Policy.",
            ]}
          />

          <PolicyCard theme={theme}
            title="📄 Terms & Conditions"
            content={[
              "By placing an order, you agree to all policies.",
              "Prices & availability may change without notice.",
              "We reserve the right to update policies anytime.",
            ]}
          />
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-white rounded-3xl p-10 text-center shadow-xl" style={{ background: theme.accent }}>
          <h3 className="text-2xl font-bold mb-6">
            Why Shop With Infofix Computers?
          </h3>

          <div className="grid md:grid-cols-4 gap-6 text-sm font-medium">
            <p>✔ Transparent Policies</p>
            <p>✔ Secure Transactions</p>
            <p>✔ Genuine Verified Products</p>
            <p>✔ Reliable Customer Support</p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 text-center shadow-sm border" style={{ borderColor: `${theme.accent}33` }}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Need Help or Clarification?
          </h3>
          <p className="text-gray-600 mb-2">📧 infofixcomputers1@gmail.com</p>
          <p className="text-gray-600">📞 +91 8293295257</p>
        </div>
      </div>
    </div>
  );
};

const PolicyCard = ({
  theme,
  title,
  content,
}: {
  theme: any;
  title: string;
  content: string[];
}) => (
  <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300">
    <h2 className="text-xl font-bold mb-4" style={{ color: theme.accent }}>{title}</h2>
    <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
      {content.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  </div>
);
