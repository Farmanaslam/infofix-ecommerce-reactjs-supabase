

import React, { useState, useEffect } from "react";
import {
    X,
    Phone,
    MapPin,
    ChevronRight,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Props {
    open: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
}

export const ProfileSetupModal: React.FC<Props> = ({
    open,
    onClose,
    userId,
    userName,
}) => {
    const [form, setForm] = useState({
        phone: "",
        address_line: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim()))
            e.phone = "Valid 10-digit mobile number required";
        if (!form.address_line.trim()) e.address_line = "Address required";
        if (!form.city.trim()) e.city = "City required";
        if (!form.state.trim()) e.state = "State required";
        if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
            e.pincode = "Valid 6-digit pincode required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        await supabase
            .from("customers")
            .update({
                address1: form.address_line.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                phone: `91${form.phone.trim()}`,
            })
            .eq("id", userId);
        setSaving(false);
        setDone(true);
        // Auto-close after 1.8s
        setTimeout(onClose, 1800);
    };

    if (!open) return null;

    return (
        <>
            <style>{`
        @keyframes modalSlideUp {
          from { opacity:0; transform:translateY(60px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .profile-modal { animation: modalSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

            {/* Backdrop */}
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    zIndex: 9998,
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    padding: "16px",
                }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="profile-modal bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                    {/* Done state */}
                    {done ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">
                                Profile Complete!
                            </h3>
                            <p className="text-gray-500 text-sm font-medium">
                                You're all set to shop and checkout smoothly.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div
                                className="relative px-6 pt-6 pb-5"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                }}
                            >
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                                            Welcome to Infofix
                                        </p>
                                        <h2 className="text-white font-black text-lg leading-tight">
                                            Hi {userName.split(" ")[0]}! 👋
                                        </h2>
                                    </div>
                                </div>
                                <p className="text-white/80 text-sm font-medium leading-relaxed">
                                    Complete your profile so we can deliver to you without any
                                    delays. Takes 30 seconds.
                                </p>

                                {/* Steps */}
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                        <Phone className="w-3 h-3 text-white" />
                                        <span className="text-white text-[10px] font-black">
                                            Phone
                                        </span>
                                    </div>
                                    <div className="flex-1 h-px bg-white/30" />
                                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                        <MapPin className="w-3 h-3 text-white" />
                                        <span className="text-white text-[10px] font-black">
                                            Address
                                        </span>
                                    </div>
                                    <div className="flex-1 h-px bg-white/30" />
                                    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                        <span className="text-white text-[10px] font-black">
                                            Done
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                {/* Phone */}
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                        Mobile Number *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    phone: e.target.value.replace(/\D/g, ""),
                                                }))
                                            }
                                            placeholder="10-digit number"
                                            className={`w-full bg-gray-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.phone ? "ring-2 ring-red-400" : ""}`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                        House / Flat / Street *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.address_line}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, address_line: e.target.value }))
                                        }
                                        placeholder="e.g. 12B Park Street, Near Central Mall"
                                        className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.address_line ? "ring-2 ring-red-400" : ""}`}
                                    />
                                    {errors.address_line && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">
                                            {errors.address_line}
                                        </p>
                                    )}
                                </div>

                                {/* City + State */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.city}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, city: e.target.value }))
                                            }
                                            placeholder="Durgapur"
                                            className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.city ? "ring-2 ring-red-400" : ""}`}
                                        />
                                        {errors.city && (
                                            <p className="text-xs text-red-500 font-semibold mt-1">
                                                {errors.city}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.state}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, state: e.target.value }))
                                            }
                                            placeholder="West Bengal"
                                            className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.state ? "ring-2 ring-red-400" : ""}`}
                                        />
                                        {errors.state && (
                                            <p className="text-xs text-red-500 font-semibold mt-1">
                                                {errors.state}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 block">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={form.pincode}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                pincode: e.target.value.replace(/\D/g, ""),
                                            }))
                                        }
                                        placeholder="713201"
                                        className={`w-full bg-gray-50 rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.pincode ? "ring-2 ring-red-400" : ""}`}
                                    />
                                    {errors.pincode && (
                                        <p className="text-xs text-red-500 font-semibold mt-1">
                                            {errors.pincode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 pb-6 space-y-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        <>
                                            Save & Start Shopping
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full text-xs text-gray-400 font-semibold hover:text-gray-600 transition py-1"
                                >
                                    Skip for now — I'll add it at checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
