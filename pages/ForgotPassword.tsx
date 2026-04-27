import React, { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useStore } from "../context/StoreContext";

export const ForgotPassword: React.FC = () => {
    const { setCurrentPage } = useStore();
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
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Check Your Email</h2>
                        <p className="text-gray-500 font-medium">
                            Password reset link sent to <span className="text-indigo-600 font-bold">{email}</span>.
                            Check inbox (and spam folder).
                        </p>
                        <button
                            onClick={() => setCurrentPage("login")}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                        >
                            <ArrowLeft className="w-5 h-5" /> Back to Login
                        </button>
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
                            RESET YOUR <span className="text-indigo-600">PASSWORD</span>
                        </h1>
                        <p className="text-gray-500 text-xl font-medium leading-relaxed">
                            Enter your email and we'll send a secure reset link instantly.
                        </p>
                        <div className="bg-indigo-50 p-4 md:p-8 rounded-4xl">
                            <p className="text-sm font-semibold text-indigo-900">
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
                                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {loading ? "Sending..." : "Send Reset Link"} <Send className="w-5 h-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentPage("login")}
                                className="w-full text-gray-500 hover:text-gray-700 font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};