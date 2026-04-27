import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useStore } from "../context/StoreContext";

export const ResetPassword: React.FC = () => {
  const { setCurrentPage } = useStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts tokens in URL hash after redirect
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setSessionReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      alert("Minimum 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center py-6 md:py-24">
        <div className="app-container">
          <div className="max-w-md mx-auto bg-white border border-gray-100 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Password Updated!</h2>
            <p className="text-gray-500 font-medium">Login now with new password.</p>
            <button
              onClick={() => setCurrentPage("login")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-6 md:py-24">
      <div className="app-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-24 items-center text-center lg:text-left">
          <div className="space-y-6 flex flex-col items-center lg:items-start">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
              SET NEW <span className="text-indigo-600">PASSWORD</span>
            </h1>
            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              Choose strong password. Min 6 characters.
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-6 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {[
                { label: "New Password", value: password, set: setPassword },
                { label: "Confirm Password", value: confirm, set: setConfirm },
              ].map(({ label, value, set }) => (
                <div className="space-y-2" key={label}>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-indigo-500 font-semibold"
              >
                {showPassword ? "Hide" : "Show"} passwords
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};