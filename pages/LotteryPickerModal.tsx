import React from "react";
import { X, Trophy, ArrowRight, Zap } from "lucide-react";
import { Lottery } from "@/types";

interface Props {
    isOpen: boolean;
    lotteries: Lottery[];
    onSelect: (lottery: Lottery) => void;
    onClose: () => void;
}

export const LotteryPickerModal: React.FC<Props> = ({ isOpen, lotteries, onSelect, onClose }) => {
    if (!isOpen || lotteries.length === 0) return null;
    if (lotteries.length === 1) { onSelect(lotteries[0]); return null; }

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={{
                background: "linear-gradient(160deg,#0f0c29 0%,#1a1060 40%,#24243e 100%)",
                borderRadius: 24, padding: 24, width: "100%", maxWidth: 380,
                boxShadow: "0 24px 80px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
                animation: "pickerIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
                <style>{`@keyframes pickerIn { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
                <button onClick={onClose} style={{
                    position: "absolute" as const, top: 16, right: 16, width: 28, height: 28,
                    borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)"
                }}><X size={14} /></button>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎰</div>
                    <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 18, margin: 0 }}>Choose a Lottery</h2>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4 }}>
                        {lotteries.length} active giveaways — pick one to enter
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {lotteries.map((l) => (
                        <button key={l.id} onClick={() => onSelect(l)}
                            style={{
                                background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)",
                                borderRadius: 16, padding: "14px 16px", textAlign: "left",
                                cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
                                color: "#fff",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(251,191,36,0.5)"; (e.currentTarget as HTMLElement).style.background = "rgba(251,191,36,0.08)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                        >
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Trophy size={18} color="#fbbf24" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 800, fontSize: 13, color: "#fff", marginBottom: 2 }}>{l.name}</div>
                                <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>🏆 {l.prize}</div>
                            </div>
                            <ArrowRight size={16} color="rgba(255,255,255,0.4)" />
                        </button>
                    ))}
                </div>

                <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 14 }}>
                    You can enter each lottery once with your email
                </p>
            </div>
        </div>
    );
};