import React, { useState, useEffect } from "react";
import { X, Tag, ArrowRight, Sparkles, Gift, Zap } from "lucide-react";

const DISMISS_KEY = "infofix_guest_promo_dismissed";

interface GuestPromoBannerProps {
    onSignup: () => void;
}

export const GuestPromoBanner: React.FC<GuestPromoBannerProps> = ({ onSignup }) => {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        if (!sessionStorage.getItem(DISMISS_KEY)) {
            const t = setTimeout(() => setVisible(true), 1800);
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
            setTimeout(() => setCopied(false), 2200);
        });
    };

    if (!visible) return null;

    return (
        <>
            <style>{`
        /* ── SHARED ── */
        @keyframes shimmerPromo {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes sparkle {
          0%,100% { transform: scale(1) rotate(0deg); opacity:1; }
          50%      { transform: scale(1.35) rotate(18deg); opacity:0.7; }
        }
        @keyframes floatOrb {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity:0.6; }
          100% { transform: scale(1.6); opacity:0; }
        }
        @keyframes countdownPulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.5; }
        }

        /* ── DESKTOP BANNER ── */
        @keyframes bannerSlideDown {
          from { opacity: 0; transform: translateY(-110%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bannerSlideUp {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-110%); }
        }
        .promo-banner-in  { animation: bannerSlideDown 0.48s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .promo-banner-out { animation: bannerSlideUp  0.38s cubic-bezier(0.4,0,1,1) forwards; }

        /* ── MOBILE MODAL ── */
        @keyframes mobileCardUp {
          from { opacity: 0; transform: translateY(100%) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mobileCardDown {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(100%) scale(0.96); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes backdropOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .mobile-card-in   { animation: mobileCardUp   0.52s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        .mobile-card-out  { animation: mobileCardDown 0.38s cubic-bezier(0.4,0,1,1) forwards; }
        .backdrop-in  { animation: backdropIn  0.3s ease forwards; }
        .backdrop-out { animation: backdropOut 0.38s ease forwards; }

        .promo-shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #fde68a 40%, #fff 60%, #fde68a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerPromo 2.8s linear infinite;
        }
        .promo-shimmer-gold {
          background: linear-gradient(90deg, #f59e0b 0%, #fde68a 40%, #f59e0b 60%, #fde68a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerPromo 2.2s linear infinite;
        }
        .promo-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .float-orb     { animation: floatOrb 3.5s ease-in-out infinite; }

        .promo-code-pill {
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          user-select: none;
        }
        .promo-code-pill:hover  { transform: scale(1.04); }
        .promo-code-pill:active { transform: scale(0.97); }

        .mobile-promo-code-pill {
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
          user-select: none;
        }
        .mobile-promo-code-pill:active { transform: scale(0.95); }

        .cta-btn {
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.18s;
        }
        .cta-btn:hover::after { opacity: 1; }
        .cta-btn:active { transform: scale(0.97); }

        .pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(251,191,36,0.6);
          animation: pulseRing 2s ease-out infinite;
        }

        .discount-badge {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

            {/* ═══════════════════════════════════════
          MOBILE: PREMIUM FLOATING MODAL CARD
      ═══════════════════════════════════════ */}
            {isMobile && (
                <>
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 z-9998 ${exiting ? "backdrop-out" : "backdrop-in"}`}
                        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
                        onClick={dismiss}
                    />

                    {/* Card */}
                    <div
                        className={`fixed bottom-0 left-0 right-0 z-9999 ${exiting ? "mobile-card-out" : "mobile-card-in"}`}
                        style={{
                            background: "linear-gradient(160deg, #0f0c29 0%, #1a1060 35%, #24243e 70%, #0f0c29 100%)",
                            borderRadius: "28px 28px 0 0",
                            padding: "0 0 env(safe-area-inset-bottom,16px) 0",
                            boxShadow: "0 -20px 80px rgba(99,102,241,0.35), 0 -4px 24px rgba(0,0,0,0.5)",
                        }}
                    >
                        {/* Decorative top border glow */}
                        <div style={{
                            position: "absolute",
                            top: 0, left: "10%", right: "10%", height: "2px",
                            background: "linear-gradient(90deg, transparent, #a78bfa, #fbbf24, #a78bfa, transparent)",
                            borderRadius: "2px",
                        }} />

                        {/* Subtle grid texture */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)",
                            backgroundSize: "24px 24px",
                            borderRadius: "28px 28px 0 0",
                        }} />

                        {/* Floating orbs decoration */}
                        <div className="absolute top-4 right-8 float-orb pointer-events-none" style={{
                            width: 80, height: 80,
                            background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
                            borderRadius: "50%",
                        }} />
                        <div className="absolute top-8 left-6 float-orb pointer-events-none" style={{
                            width: 60, height: 60,
                            background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
                            borderRadius: "50%",
                            animationDelay: "1.2s",
                        }} />

                        <div className="relative px-5 pt-5 pb-6">

                            {/* Drag pill + dismiss row */}
                            <div className="flex items-center justify-between mb-4">
                                <div style={{
                                    width: 40, height: 4,
                                    background: "rgba(255,255,255,0.2)",
                                    borderRadius: 4,
                                    marginLeft: "auto", marginRight: "auto",
                                    position: "absolute", left: "50%", transform: "translateX(-50%)", top: 12,
                                }} />
                                <div /> {/* spacer */}
                                <button
                                    onClick={dismiss}
                                    style={{
                                        width: 32, height: 32,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "rgba(255,255,255,0.5)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        marginLeft: "auto",
                                    }}
                                    aria-label="Dismiss"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Hero section */}
                            <div className="text-center mb-5">
                                {/* Icon with pulse ring */}
                                <div className="relative inline-flex items-center justify-center mb-3" style={{ marginTop: 8 }}>
                                    <div className="pulse-ring" />
                                    <div style={{
                                        width: 56, height: 56,
                                        borderRadius: 18,
                                        background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(167,139,250,0.25))",
                                        border: "1px solid rgba(251,191,36,0.3)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        backdropFilter: "blur(8px)",
                                    }}>
                                        <Gift size={26} color="#fbbf24" className="promo-sparkle" />
                                    </div>
                                </div>

                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2" style={{
                                    background: "rgba(167,139,250,0.15)",
                                    border: "1px solid rgba(167,139,250,0.3)",
                                }}>
                                    <Zap size={10} color="#a78bfa" />
                                    <span style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
                                        textTransform: "uppercase", color: "#c4b5fd",
                                    }}>
                                        Exclusive New User Offer
                                    </span>
                                </div>

                                {/* Big discount number */}
                                <div style={{ marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: 52, fontWeight: 900, lineHeight: 1,
                                        letterSpacing: "-2px",
                                        display: "block",
                                    }} className="promo-shimmer-gold">
                                        ₹4,000
                                    </span>
                                    <span style={{
                                        fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.7)",
                                        letterSpacing: "0.05em", textTransform: "uppercase",
                                    }}>
                                        OFF your first order
                                    </span>
                                </div>

                                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                                    Create a free account to unlock this deal
                                </p>
                            </div>

                            {/* Coupon code */}
                            <div
                                className="mobile-promo-code-pill"
                                onClick={copyCode}
                                style={{
                                    background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.04))",
                                    border: "1.5px dashed rgba(251,191,36,0.5)",
                                    borderRadius: 16,
                                    padding: "14px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 16,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Left notch */}
                                <div style={{
                                    position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
                                    width: 16, height: 16, borderRadius: "50%",
                                    background: "linear-gradient(160deg, #0f0c29 0%, #1a1060 100%)",
                                    border: "1.5px dashed rgba(251,191,36,0.5)",
                                }} />
                                {/* Right notch */}
                                <div style={{
                                    position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                                    width: 16, height: 16, borderRadius: "50%",
                                    background: "linear-gradient(160deg, #0f0c29 0%, #1a1060 100%)",
                                    border: "1.5px dashed rgba(251,191,36,0.5)",
                                }} />

                                <div className="flex items-center gap-2.5">
                                    <Tag size={14} color="#fbbf24" />
                                    <div>
                                        <div style={{ fontSize: 9, color: "rgba(251,191,36,0.6)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 1 }}>
                                            Coupon Code
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.22em", color: "#fde68a", textTransform: "uppercase" }}>
                                            INFOFIXFIRST
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    padding: "7px 14px",
                                    borderRadius: 10,
                                    background: copied ? "rgba(16,185,129,0.2)" : "rgba(251,191,36,0.15)",
                                    border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(251,191,36,0.3)"}`,
                                    fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                                    color: copied ? "#6ee7b7" : "#fbbf24",
                                    textTransform: "uppercase",
                                    transition: "all 0.2s",
                                    whiteSpace: "nowrap",
                                }}>
                                    {copied ? "✓ Copied!" : "Tap Copy"}
                                </div>
                            </div>

                            {/* CTA button */}
                            <button
                                onClick={() => { dismiss(); onSignup(); }}
                                className="cta-btn"
                                style={{
                                    width: "100%",
                                    padding: "17px 24px",
                                    borderRadius: 18,
                                    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)",
                                    backgroundSize: "200% 100%",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    boxShadow: "0 8px 32px rgba(251,191,36,0.4), 0 2px 8px rgba(0,0,0,0.3)",
                                }}
                            >
                                <Sparkles size={16} color="#1e1b4b" />
                                <span style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                    Claim ₹4,000 OFF Now
                                </span>
                                <ArrowRight size={16} color="#1e1b4b" />
                            </button>

                            {/* Trust line */}
                            <p style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em" }}>
                                🔒 Free to join · No credit card required
                            </p>

                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════
          DESKTOP: ORIGINAL STICKY TOP BANNER
      ═══════════════════════════════════════ */}
            {!isMobile && (
                <>
                    <div
                        className={`fixed top-0 left-0 right-0 z-9999 ${exiting ? "promo-banner-out" : "promo-banner-in"}`}
                        style={{
                            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #1e1b4b 100%)",
                            backgroundSize: "200% 100%",
                        }}
                    >
                        <div
                            className="absolute inset-0 pointer-events-none opacity-10"
                            style={{
                                backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
                                backgroundSize: "32px 32px",
                            }}
                        />

                        <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">

                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-amber-300 promo-sparkle" />
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3 min-w-0">
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

                            <div
                                className="promo-code-pill shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-400/10"
                                onClick={copyCode}
                                title="Click to copy"
                            >
                                <Tag className="w-3 h-3 text-amber-300 shrink-0" />
                                <span className="text-amber-200 font-black text-xs tracking-[0.2em] uppercase">INFOFIXFIRST</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md transition-all ${copied ? "bg-emerald-500 text-white" : "bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"}`}>
                                    {copied ? "✓ Copied" : "Copy"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => { dismiss(); onSignup(); }}
                                    className="cta-btn flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase tracking-wider"
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
                    <div className="h-12" />
                </>
            )}
        </>
    );
};
