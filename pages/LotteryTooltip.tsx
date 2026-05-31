import React, { useState, useEffect, useRef } from "react";
import { Trophy, X, Zap, Clock, Gift } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { Lottery, LotteryTooltipProps } from "@/types";


export const LotteryTooltip: React.FC<LotteryTooltipProps> = ({
    onOpenLottery,
    storeSection = "infofix",
}) => {
    const [lotteries, setLotteries] = useState<Lottery[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [current, setCurrent] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");
    const [entryCount, setEntryCount] = useState(5244);
    const lottery = lotteries[current];
    const GOAL = 10000;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchLotteries();
    }, [storeSection]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!lotteries[current]?.ends_at) return;
        const tick = () => {
            const diff = new Date(lotteries[current].ends_at!).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Ends soon"); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`);
        };
        tick();
        const t = setInterval(tick, 60000);
        return () => clearInterval(t);
    }, [lotteries, current]);

    useEffect(() => {
        if (lotteries.length < 2) return;
        const t = setInterval(() => setCurrent(p => (p + 1) % lotteries.length), 4000);
        return () => clearInterval(t);
    }, [lotteries.length]);

    const fetchLotteries = async () => {
        const { data } = await supabase
            .from("lotteries")
            .select("id, name, prize, ends_at, store_section")
            .eq("status", "active")
            .or(`store_section.eq.${storeSection},store_section.eq.all`)
            .order("created_at", { ascending: false })
            .limit(5);
        if (data?.length) setLotteries(data as Lottery[]);
    };
    useEffect(() => {
        if (!lottery?.id) return;
        const fetchCount = async () => {
            const { count } = await supabase
                .from("lottery_entries")
                .select("id", { count: "exact", head: true })
                .eq("lottery_id", lottery.id);
            setEntryCount(5245 + (count ?? 0));
        };
        fetchCount();
        const t = setInterval(fetchCount, 30000);
        return () => clearInterval(t);
    }, [lottery?.id]);
    if (!lotteries.length || dismissed) return null;



    return (
        <>
            <style>{`
        @keyframes lotteryBadgeIn {
          from { opacity:0; transform:translateY(-8px) scale(0.92); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes lotteryTooltipIn {
          from { opacity:0; transform:translateY(8px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes liveRing {
          0%   { transform:scale(1); opacity:0.8; }
          100% { transform:scale(2.2); opacity:0; }
        }
        @keyframes shimmerBadge {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        .lottery-badge-anim { animation: lotteryBadgeIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .lottery-tooltip-anim { animation: lotteryTooltipIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .live-ring {
          position:absolute; inset:-3px; border-radius:50%;
          border:2px solid rgba(251,191,36,0.7);
          animation: liveRing 1.8s ease-out infinite;
        }
        .prize-shimmer-sm {
          background: linear-gradient(90deg,#f59e0b 0%,#fde68a 40%,#f59e0b 60%,#fde68a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerBadge 2.5s linear infinite;
        }
        .lottery-enter-btn {
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        .lottery-enter-btn:hover { transform:scale(1.04); }
        .lottery-enter-btn:active { transform:scale(0.97); }
      `}</style>

            <div ref={ref} className="relative" style={{ zIndex: 51 }}>
                {/* Trigger badge */}
                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="lottery-badge-anim flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all hover:scale-105"
                    style={{
                        background: "linear-gradient(135deg,#1e1b4b,#312e81)",
                        border: "1.5px solid rgba(167,139,250,0.4)",
                        boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                    }}
                >
                    {/* Live dot */}
                    <div className="relative flex items-center justify-center shrink-0" style={{ width: 10, height: 10 }}>
                        <div className="live-ring" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    <Trophy size={13} color="#fbbf24" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#e0e7ff", whiteSpace: "nowrap" }}>
                        Live Lottery
                    </span>
                    <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                        background: "rgba(251,191,36,0.2)", color: "#fde68a",
                        padding: "2px 6px", borderRadius: 6, textTransform: "uppercase",
                    }}>
                        {lotteries.length} Active
                    </span>
                </button>

                {/* Tooltip panel */}
                {isOpen && (
                    <div
                        className="lottery-tooltip-anim absolute right-0 mt-3 w-80"
                        style={{
                            background: "linear-gradient(160deg,#0f0c29 0%,#1a1060 50%,#1e1b4b 100%)",
                            border: "1px solid rgba(167,139,250,0.2)",
                            borderRadius: 20,
                            boxShadow: "0 20px 60px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
                            overflow: "hidden",
                        }}
                    >
                        {/* Top accent */}
                        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#a78bfa,#fbbf24,transparent)" }} />

                        <div className="p-4">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Gift size={15} color="#fbbf24" />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#e0e7ff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                        Active Giveaways
                                    </span>
                                </div>
                                <button onClick={() => { setIsOpen(false); setDismissed(true); }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-white/30 hover:text-white/70 transition-all">
                                    <X size={12} />
                                </button>
                            </div>

                            {/* Lottery cards */}
                            <div className="space-y-2 mb-3">
                                {lotteries.map((l, i) => (
                                    <div key={l.id}
                                        className={`rounded-2xl p-3 transition-all ${i === current ? "border-amber-400/40" : "border-white/5"}`}
                                        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${i === current ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#e0e7ff", marginBottom: 2 }}>{l.name}</div>
                                        <div className="prize-shimmer-sm" style={{ fontSize: 11, fontWeight: 700 }}>{l.prize}</div>
                                        {l.ends_at && i === current && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Clock size={9} color="#a5b4fc" />
                                                <span style={{ fontSize: 9, color: "#a5b4fc", fontWeight: 700 }}>{timeLeft}</span>
                                            </div>
                                        )}
                                        {i === current && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>🎟 Entries</span>
                                                    <span style={{ fontSize: 9, fontWeight: 800, color: "#fbbf24" }}>{entryCount.toLocaleString()} / {GOAL.toLocaleString()}</span>
                                                </div>
                                                <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                                    <div style={{
                                                        height: "100%",
                                                        width: `${Math.min((entryCount / GOAL) * 100, 100)}%`,
                                                        borderRadius: 99,
                                                        background: "linear-gradient(90deg,#6366f1,#a78bfa,#fbbf24)",
                                                        transition: "width 1s ease",
                                                    }} />
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => { setIsOpen(false); onOpenLottery(); }}
                                className="lottery-enter-btn w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1e1b4b" }}
                            >
                                <Zap size={14} />
                                Enter Free — Win Prizes!
                            </button>

                            <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>
                                Free to enter · No purchase required
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
