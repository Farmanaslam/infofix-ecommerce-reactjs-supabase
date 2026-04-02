import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

export const Login: React.FC = () => {
  const { setCurrentUser, setCurrentPage, setViewMode } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) alert(error.message);
  };

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

    // 🔹 1️⃣ Try CUSTOMER table first
    const { data: customerProfile } = await supabase
      .from("customers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (customerProfile) {
      setCurrentUser({
        id: user.id,
        name: customerProfile.full_name,
        email: customerProfile.email,
        role: "CUSTOMER",
        avatar: `https://i.pravatar.cc/150?u=${user.id}`,
      });

      await supabase.from("notifications").insert({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "info",
        title: "Customer Login",
        message: `${customerProfile.full_name} (${customerProfile.email}) logged in.`,
        user_id: user.id,
        user_name: customerProfile.full_name,
        user_role: "CUSTOMER",
        read_by: [],
        created_at: new Date().toISOString(),
      });

      setCurrentPage("home");
      return;
    }
    // 🔹 2️⃣ If not customer, check STAFF table
    const { data: staffProfile } = await supabase
      .from("staffs")
      .select("*")
      .eq("id", user.id)
      .single();

    if (staffProfile) {
      setViewMode("STORE");
      setCurrentUser({
        id: user.id,
        name: staffProfile.full_name,
        email: staffProfile.email,
        role: staffProfile.role,
        avatar: staffProfile.avatar_url,
      });

      await supabase.from("notifications").insert({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "info",
        title: "Staff Login",
        message: `${staffProfile.full_name} (${staffProfile.role}) signed into the portal.`,
        user_id: user.id,
        user_name: staffProfile.full_name,
        user_role: staffProfile.role,
        read_by: [],
        created_at: new Date().toISOString(),
      });

      setCurrentPage("home");
      return;
    }

    alert("Profile not found in system");
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
            {/* Login Button */}
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]">
              Login <LogIn className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] border border-gray-200 hover:border-gray-300 text-gray-700 py-4 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
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
