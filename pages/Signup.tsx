import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

export const Signup = () => {
  const { setCurrentUser, setCurrentPage } = useStore();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    acceptTerms: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!formData.acceptTerms) {
      return setError("Please accept Terms & Conditions");
    }

    // 1️⃣ Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return setError(error.message);
    }

    const user = data.user;
    if (!user) return;

    // 2️⃣ Insert into customers table
    const { error: profileError } = await supabase.from("customers").insert({
      id: user.id,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country,
    });

    if (profileError) {
      return setError(profileError.message);
    }

    // 3️⃣ Set local state
    setCurrentUser({
      id: user.id,
      name: formData.fullName,
      email: formData.email,
      role: "CUSTOMER",
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
    });

    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Your Infofix Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <hr />

          <h3 className="font-semibold">Shipping Address</h3>

          {/* Address 1 */}
          <input
            type="text"
            name="address1"
            placeholder="Address Line 1"
            required
            value={formData.address1}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Address 2 */}
          <input
            type="text"
            name="address2"
            placeholder="Address Line 2 (Optional)"
            value={formData.address2}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* City */}
          <input
            type="text"
            name="city"
            placeholder="City"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* State */}
          <input
            type="text"
            name="state"
            placeholder="State"
            required
            value={formData.state}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Pincode */}
          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            required
            value={formData.pincode}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          {/* Country */}
          <input
            type="text"
            name="country"
            value={formData.country}
            readOnly
            className="w-full border p-3 rounded bg-gray-100"
          />

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
            />
            <label>I agree to the Terms & Conditions</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setCurrentPage("login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};
