import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

export const Login: React.FC = () => {
  const { setCurrentUser, setCurrentPage } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    if (!user) return;

    // Fetch customer profile
    const { data: profile } = await supabase
      .from("customers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      alert("Profile not found");
      return;
    }

    setCurrentUser({
      id: user.id,
      name: profile.full_name,
      email: profile.email,
      role: "CUSTOMER",
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
    });

    setCurrentPage("home");
  };

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* LEFT SIDE */}
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            WELCOME BACK TO <span className="text-indigo-600">INFOFIX</span>
          </h1>

          <p className="text-gray-500 text-xl font-medium leading-relaxed">
            Login to manage your orders, track services, and explore premium
            computing solutions.
          </p>

          <div className="bg-indigo-50 p-8 rounded-4xl">
            <p className="text-sm font-semibold text-indigo-900">
              Secure authentication powered by modern encryption standards.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE CARD */}
        <div className="bg-white border border-gray-100 p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]">
              Login <LogIn className="w-5 h-5" />
            </button>

            <p className="text-sm text-gray-500 text-center font-medium">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setCurrentPage("signup")}
                className="text-indigo-600 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
