import React, { useState, useEffect } from "react";
import { X, Tag, ArrowRight, Sparkles } from "lucide-react";

const DISMISS_KEY = "infofix_guest_promo_dismissed";

interface GuestPromoBannerProps {
    onSignup: () => void;
}

export const GuestPromoBanner: React.FC<GuestPromoBannerProps> = ({ onSignup }) => {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Show only if not already dismissed this session
        if (!sessionStorage.getItem(DISMISS_KEY)) {
            const t = setTimeout(() => setVisible(true), 1800); // 1.8s delay on load
            return () => clearTimeout(t);
        }
    }, []);

    const dismiss = () => {
        setExiting(true);
        sessionStorage.setItem(DISMISS_KEY, "1");
        setTimeout(() => setVisible(false), 420);
    };

    const copyCode = () => {
        navigator.clipboard.writeText("INFOFIXFIRST").then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
        @keyframes bannerSlideDown {
          from { opacity: 0; transform: translateY(-110%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerSlideUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-110%); }
        }
        @keyframes shimmerPromo {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes sparkle {
          0%,100% { transform: scale(1) rotate(0deg); opacity:1; }
          50%      { transform: scale(1.3) rotate(15deg); opacity:0.7; }
        }
        .promo-banner-in  { animation: bannerSlideDown 0.48s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .promo-banner-out { animation: bannerSlideUp  0.38s cubic-bezier(0.4,0,1,1) forwards; }
        .promo-shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #fde68a 40%, #fff 60%, #fde68a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerPromo 2.8s linear infinite;
        }
        .promo-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .promo-code-pill {
          cursor: pointer;
          transition: all 0.18s;
        }
        .promo-code-pill:hover { transform: scale(1.04); }
        .promo-code-pill:active { transform: scale(0.97); }
      `}</style>

            {/* ── STICKY TOP BANNER ── */}
            <div
                className={`fixed top-0 left-0 right-0 z-9999 ${exiting ? "promo-banner-out" : "promo-banner-in"}`}
                style={{
                    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #1e1b4b 100%)",
                    backgroundSize: "200% 100%",
                }}
            >
                {/* Subtle grid overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">

                    {/* LEFT: badge + message */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Gift badge */}
                        <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-amber-300 promo-sparkle" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3 min-w-0">
                            {/* Main text */}
                            <span className="text-[11px] md:text-xs font-black uppercase tracking-[0.15em] text-indigo-200 whitespace-nowrap shrink-0">
                                🎉 New User Offer
                            </span>
                            <span className="hidden md:block w-px h-3.5 bg-indigo-500/50 shrink-0" />
                            <p className="text-xs md:text-sm font-bold text-white leading-tight truncate">
                                Create account & get{" "}
                                <span className="promo-shimmer-text font-black">₹4,000 OFF</span>
                                {" "}your first order
                            </p>
                        </div>
                    </div>

                    {/* CENTER: coupon code pill */}
                    <div
                        className="promo-code-pill shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-400/10"
                        onClick={copyCode}
                        title="Click to copy"
                    >
                        <Tag className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="text-amber-200 font-black text-xs tracking-[0.2em] uppercase">
                            INFOFIXFIRST
                        </span>
                        <span
                            className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md transition-all ${copied
                                    ? "bg-emerald-500 text-white"
                                    : "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
                                }`}
                        >
                            {copied ? "✓ Copied" : "Copy"}
                        </span>
                    </div>

                    {/* RIGHT: CTA + dismiss */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => { dismiss(); onSignup(); }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-black text-xs uppercase tracking-wider transition-all"
                            style={{ boxShadow: "0 4px 14px rgba(251,191,36,0.4)" }}
                        >
                            Claim Now <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                            onClick={dismiss}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Spacer so header doesn't go under banner */}
            <div className="h-12.5" />
        </>
    );
};