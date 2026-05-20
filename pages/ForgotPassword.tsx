import React, { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useStore } from "../context/StoreContext";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { Link } from "react-router-dom";
export const ForgotPassword: React.FC = () => {
    const { setCurrentPage, selectedStoreSection } = useStore();
    const theme = SECTION_ACCENT[selectedStoreSection];
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/?page=reset-password`,
        });

        setLoading(false);
        if (error) {
            alert(error.message);
            return;
        }
        setSent(true);
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center py-6 md:py-24">
                <div className="app-container">
                    <div className="max-w-md mx-auto bg-white border border-gray-100 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                            style={{ background: theme.accentLight }}>
                            <Mail className="w-10 h-10" style={{ color: theme.accent }} />

                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Check Your Email</h2>
                        <p className="text-gray-500 font-medium">
                            Password reset link sent to <span className="font-bold" style={{ color: theme.accent }}>{email}</span>.
                            Check inbox (and spam folder).
                        </p>
                        <Link
                            to="/login"
                            className="w-full text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                            style={{ background: theme.accent }}
                            onMouseEnter={e => e.currentTarget.style.background = theme.accentHover}
                            onMouseLeave={e => e.currentTarget.style.background = theme.accent}
                        >
                            <ArrowLeft className="w-5 h-5" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-6 md:py-24">
            <div className="app-container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-24 items-center text-center lg:text-left">
                    <div className="space-y-6 flex flex-col items-center lg:items-start">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                            RESET YOUR <span style={{ color: theme.accent }}>PASSWORD</span>
                        </h1>
                        <p className="text-gray-500 text-xl font-medium leading-relaxed">
                            Enter your email and we'll send a secure reset link instantly.
                        </p>
                        <div className=" p-4 md:p-8 rounded-4xl" style={{ background: theme.accentLight }}>
                            <p className="text-sm font-semibold" style={{ color: theme.accentText }}>
                                Link expires in 1 hour. Check spam if not received.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 p-6 md:p-12 rounded-[48px] shadow-2xl shadow-gray-200/50">
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none font-medium transition-all"
                                        style={{
                                            "--tw-ring-color": theme.accent,
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.boxShadow = `0 0 0 2px ${theme.accent}`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                                style={{ background: theme.accent }}
                                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = theme.accentHover; }}
                                onMouseLeave={e => e.currentTarget.style.background = theme.accent}
                            >
                                {loading ? "Sending..." : "Send Reset Link"} <Send className="w-5 h-5" />
                            </button>

                            <Link
                                to="/login"
                                className="w-full text-gray-500 hover:text-gray-700 font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};