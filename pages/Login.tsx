import React, { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, LogIn } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";

export const Login: React.FC = () => {
  const { setCurrentUser, setCurrentPage, setViewMode, pendingRedirectAfterLogin, setPendingRedirectAfterLogin, currentUser } = useStore();
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

    const { data: customerProfile } = await supabase
      .from("customers")
      .select("*")
      .eq("id", user.id)
      .single();

    if (customerProfile) {
      setCurrentUser({ id: user.id, name: customerProfile.full_name, email: customerProfile.email, role: "CUSTOMER", avatar: `https://i.pravatar.cc/150?u=${user.id}` });
      const redirect = pendingRedirectAfterLogin ?? "home";
      setPendingRedirectAfterLogin(null);
      setCurrentPage(redirect);
      return;
    }

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

      setCurrentPage("home");
      return;
    }

    alert("Profile not found in system");
  };

  useEffect(() => {
    if (currentUser && pendingRedirectAfterLogin) {
      const redirect = pendingRedirectAfterLogin;
      setPendingRedirectAfterLogin(null);
      setCurrentPage(redirect);
    }
  }, [currentUser]);
  return (
    <div className="min-h-screen flex items-center justify-center py-6 md:py-24">
      <div className="app-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-24 items-center text-center lg:text-left">
          {/* LEFT SIDE */}
          <div className="space-y-6 flex flex-col items-center lg:items-start">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
              WELCOME BACK TO <span className="text-indigo-600">INFOFIX</span>
            </h1>

            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              Login to manage your orders, track services, and explore premium
              computing solutions.
            </p>

            <div className="bg-indigo-50 p-4 md:p-8 rounded-4xl">
              <p className="text-sm font-semibold text-indigo-900">
                Secure authentication powered by modern encryption standards.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE CARD */}
          <div className="bg-white border border-gray-100 p-6 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">

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
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {/* Google Logo */}
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.36 1.22 8.3 3.2l6.2-6.2C34.5 2.6 29.7 0 24 0 14.7 0 6.7 5.7 2.7 14l7.4 5.7C12.1 13.3 17.6 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.7h12.6c-.3 2-1.5 5-4.1 7l6.3 4.9c3.7-3.4 5.9-8.4 5.9-15.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.1 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7L2.7 13.6C1 17 0 20.4 0 24s1 7 2.7 10.4l7.4-5.7z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 48c6.5 0 12-2.1 16-5.7l-6.3-4.9c-1.8 1.2-4.3 2-9.7 2-6.4 0-11.9-3.8-13.9-9.2l-7.4 5.7C6.7 42.3 14.7 48 24 48z"
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
    </div>
  );
};
