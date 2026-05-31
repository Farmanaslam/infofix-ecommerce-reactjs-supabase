import React, { useState, useEffect } from "react";
import {
    Trophy, Plus, Eye, Users, Clock, CheckCircle2, XCircle,
    Trash2, ChevronRight, Gift, Zap, X, Crown, Image as ImageIcon, ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Lottery, Entry } from "@/types";

type View = "list" | "entries" | "create" | "edit";
export const Campaigns: React.FC = () => {
    const [view, setView] = useState<View>("list");
    const [lotteries, setLotteries] = useState<Lottery[]>([]);
    const [selectedLottery, setSelectedLottery] = useState<Lottery | null>(null);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [entriesLoading, setEntriesLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [winner, setWinner] = useState<Entry | null>(null);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "", description: "", prize: "",
        store_section: "infofix", ends_at: "", status: "active",
    });

    useEffect(() => { fetchLotteries(); }, []);

    const fetchLotteries = async () => {
        setLoading(true);
        const { data: lots } = await supabase
            .from("lotteries").select("*").order("created_at", { ascending: false });
        if (lots) {
            const withCounts = await Promise.all(
                lots.map(async (l) => {
                    const { count } = await supabase
                        .from("lottery_entries")
                        .select("id", { count: "exact", head: true })
                        .eq("lottery_id", l.id);
                    return { ...l, entry_count: count ?? 0 };
                })
            );
            setLotteries(withCounts);
        }
        setLoading(false);
    };

    const fetchEntries = async (lottery: Lottery) => {
        setSelectedLottery(lottery);
        setView("entries");
        setEntriesLoading(true);
        const { data } = await supabase
            .from("lottery_entries")
            .select("*")
            .eq("lottery_id", lottery.id)
            .order("created_at", { ascending: false });
        setEntries(data ?? []);
        setEntriesLoading(false);
    };

    const pickWinner = () => {
        if (!entries.length) return;
        const w = entries[Math.floor(Math.random() * entries.length)];
        setWinner(w);
        setShowWinnerModal(true);
    };

    const confirmWinner = async () => {
        if (!winner || !selectedLottery) return;
        await supabase.from("lotteries")
            .update({ winner_id: winner.id, status: "ended" })
            .eq("id", selectedLottery.id);
        setShowWinnerModal(false);
        fetchLotteries();
        setView("list");
    };

    const toggleStatus = async (l: Lottery) => {
        const next = l.status === "active" ? "ended" : "active";
        await supabase.from("lotteries").update({ status: next }).eq("id", l.id);
        fetchLotteries();
    };

    const deleteLottery = async (id: string) => {
        if (!window.confirm("Delete this lottery? All entries will be lost.")) return;
        await supabase.from("lotteries").delete().eq("id", id);
        fetchLotteries();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.prize.trim()) return;
        setCreateLoading(true);
        await supabase.from("lotteries").insert({
            name: form.name.trim(), description: form.description.trim(),
            prize: form.prize.trim(), store_section: form.store_section,
            ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
            status: form.status,
        });
        setCreateLoading(false);
        setForm({ name: "", description: "", prize: "", store_section: "infofix", ends_at: "", status: "active" });
        setView("list");
        fetchLotteries();
    };

    const exportCSV = () => {
        const csv = [
            "Name,Email,WhatsApp,Location,Screenshot,Registered At",
            ...entries.map(e =>
                `"${e.name}","${e.email}","${e.whatsapp}","${e.location}","${e.screenshot_url ?? ""}","${new Date(e.created_at).toLocaleString("en-IN")}"`)
        ].join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `${selectedLottery?.name}-entries.csv`;
        a.click();
    };

    const sectionColors: Record<string, string> = {
        infofix: "#6366f1", refurbished: "#059669", wholesale: "#db2777"
    };

    const statusBadge = (s: string) => {
        const map: Record<string, any> = {
            active: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Live", dot: true },
            ended: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Ended" },
            draft: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", label: "Draft" },
        };
        const m = map[s] ?? map.draft;
        return (
            <span style={{
                background: m.bg, color: m.color, fontSize: 10, fontWeight: 800,
                padding: "2px 10px", borderRadius: 20, textTransform: "uppercase" as const, letterSpacing: "0.08em",
                display: "inline-flex", alignItems: "center", gap: 4
            }}>
                {m.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, animation: "pulse 2s infinite", display: "inline-block" }} />}
                {m.label}
            </span>
        );
    };

    return (
        <div style={{ fontFamily: "inherit" }}>
            <style>{`
        @keyframes winnerPop {
          0%{transform:scale(0.85) translateY(20px);opacity:0;}
          70%{transform:scale(1.04);}
          100%{transform:scale(1) translateY(0);opacity:1;}
        }
        @keyframes confettiFall {
          0%{transform:translateY(-20px) rotate(0);opacity:1;}
          100%{transform:translateY(80px) rotate(720deg);opacity:0;}
        }
        .winner-modal-anim { animation: winnerPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .camp-card {
          background:#fff; border:0.5px solid rgba(0,0,0,0.08);
          border-radius:16px; padding:20px;
          transition:all 0.2s ease;
        }
        .camp-card:hover { box-shadow:0 8px 32px rgba(99,102,241,0.1); transform:translateY(-2px); }
        .input-field {
          width:100%; padding:10px 14px; border-radius:10px;
          border:0.5px solid rgba(0,0,0,0.15); font-size:14px;
          outline:none; box-sizing:border-box; background:#fff; color:#0f172a;
          transition:border-color 0.2s; font-family:inherit;
        }
        .input-field:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        .input-label { font-size:11px; font-weight:700; color:#64748b;
          text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:5px; }
        .act-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:8px 16px; border-radius:10px; font-size:12px; font-weight:700;
          cursor:pointer; transition:all 0.15s ease; border:none;
        }
        .act-btn:active { transform:scale(0.97); }
        .confetti-piece { position:absolute; width:7px; height:7px; border-radius:2px; animation:confettiFall 1.5s ease forwards; }
        .screenshot-thumb {
          width:52px; height:52px; border-radius:8px; object-fit:cover;
          border:1.5px solid rgba(99,102,241,0.3); cursor:pointer;
          transition:transform 0.2s;
        }
        .screenshot-thumb:hover { transform:scale(1.08); }
        tr:hover { background:#f8faff; }
      `}</style>

            {/* Header */}
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {view !== "list" && (
                        <button onClick={() => { setView("list"); setSelectedLottery(null); setWinner(null); }}
                            className="act-btn" style={{ background: "#f1f5f9", color: "#475569" }}>
                            ← Back
                        </button>
                    )}
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                            {view === "list" ? "Campaigns & Lotteries" : view === "create" ? "Create Lottery" : selectedLottery?.name}
                        </h1>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                            {view === "entries" ? `${entries.length} registrations · verify screenshots then add to WhatsApp group` :
                                view === "create" ? "Set up a new customer giveaway" : "Manage giveaways · view registrations · pick winners"}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {view === "list" && (
                        <button onClick={() => setView("create")} className="act-btn"
                            style={{ background: "#6366f1", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13 }}>
                            <Plus size={15} /> New Lottery
                        </button>
                    )}
                    {view === "entries" && entries.length > 0 && (
                        <>
                            <button onClick={exportCSV} className="act-btn" style={{ background: "#f1f5f9", color: "#475569" }}>
                                ↓ Export CSV
                            </button>
                            <button onClick={pickWinner} className="act-btn"
                                style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1e1b4b", padding: "10px 20px", borderRadius: 12, fontSize: 13 }}>
                                <Crown size={15} /> Pick Winner
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            {view === "list" && !loading && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Total", value: lotteries.length, color: "#6366f1" },
                        { label: "Active", value: lotteries.filter(l => l.status === "active").length, color: "#10b981" },
                        { label: "Total Entries", value: lotteries.reduce((a, l) => a + (l.entry_count ?? 0), 0), color: "#f59e0b" },
                        { label: "Ended", value: lotteries.filter(l => l.status === "ended").length, color: "#94a3b8" },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* LIST */}
            {view === "list" && (
                loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    </div>
                ) : lotteries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                        <Trophy size={40} style={{ margin: "0 auto 12px" }} />
                        <p style={{ fontWeight: 700, color: "#475569", fontSize: 16 }}>No lotteries yet</p>
                        <button onClick={() => setView("create")} className="act-btn"
                            style={{ background: "#6366f1", color: "#fff", padding: "10px 20px", borderRadius: 12, marginTop: 16 }}>
                            <Plus size={14} /> Create First Lottery
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
                        {lotteries.map((l) => (
                            <div key={l.id} className="camp-card">
                                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                                            {statusBadge(l.status)}
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                                                background: (sectionColors[l.store_section as string] || "#6366f1") + "18",
                                                color: sectionColors[l.store_section as string] || "#6366f1",
                                                textTransform: "uppercase" as const, letterSpacing: "0.08em"
                                            }}>
                                                {l.store_section}
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>{l.name}</h3>
                                    </div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button onClick={() => toggleStatus(l)}
                                            style={{
                                                width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                                color: l.status === "active" ? "#ef4444" : "#10b981"
                                            }}>
                                            {l.status === "active" ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                                        </button>
                                        <button onClick={() => deleteLottery(l.id)}
                                            style={{
                                                width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent",
                                                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#f87171"
                                            }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{
                                    background: "rgba(251,191,36,0.07)", border: "1px dashed rgba(251,191,36,0.4)",
                                    borderRadius: 10, padding: "8px 12px", marginBottom: 12
                                }}>
                                    <div style={{ fontSize: 9, color: "rgba(180,130,0,0.7)", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 2 }}>Prize</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>{l.prize}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 11, color: "#64748b" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Users size={12} color="#6366f1" />
                                        <span style={{ fontWeight: 700, color: "#6366f1" }}>{(l.entry_count ?? 0).toLocaleString()}</span>
                                        <span>entries</span>
                                    </div>
                                    {l.ends_at && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <Clock size={12} />
                                            <span>{new Date(l.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => fetchEntries(l)} className="act-btn"
                                    style={{ background: "#6366f1", color: "#fff", borderRadius: 10, width: "100%", justifyContent: "center" }}>
                                    <Eye size={13} /> View {(l.entry_count ?? 0).toLocaleString()} Entries <ChevronRight size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* ENTRIES */}
            {view === "entries" && (
                entriesLoading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent" }} />
                    </div>
                ) : entries.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                        <Users size={40} style={{ margin: "0 auto 12px" }} />
                        <p style={{ fontWeight: 700, color: "#475569" }}>No entries yet — share the lottery!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto", borderRadius: 16, border: "0.5px solid rgba(0,0,0,0.08)" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    {["#", "Name", "WhatsApp", "Location", "Screenshot", "Registered"].map((h, i) => (
                                        <th key={i} style={{
                                            padding: "12px 14px", textAlign: "left", fontSize: 10, fontWeight: 800,
                                            color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em",
                                            whiteSpace: "nowrap", borderBottom: "0.5px solid rgba(0,0,0,0.06)"
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((e, i) => (
                                    <tr key={e.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}>
                                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#818cf8)",
                                                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0
                                                }}>
                                                    {e.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{e.name}</div>
                                                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{e.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 14px" }}>
                                            <a href={`https://api.whatsapp.com/send?phone=91${e.whatsapp}&text=${encodeURIComponent(`Hello ${e.name}! 🎉 Congratulations from Infofix Computers! You have been selected for the lottery. Please join our announcement group.`)}`}
                                                target="_blank" rel="noreferrer"
                                                style={{
                                                    color: "#059669", fontWeight: 700, fontSize: 12, textDecoration: "none",
                                                    display: "flex", alignItems: "center", gap: 5
                                                }}>
                                                <span className="bi bi-whatsapp" style={{ fontSize: 14 }} />
                                                {e.whatsapp}
                                                <ExternalLink size={10} />
                                            </a>
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: 12, color: "#475569" }}>{e.location}</td>
                                        <td style={{ padding: "12px 14px" }}>
                                            {e.screenshot_url ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <img
                                                        src={e.screenshot_url}
                                                        alt="Follow proof"
                                                        className="screenshot-thumb"
                                                        onClick={() => e.screenshot_url && setLightboxImg(e.screenshot_url)}
                                                    />
                                                    <a href={e.screenshot_url} target="_blank" rel="noreferrer"
                                                        style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
                                                        View
                                                    </a>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: 10, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <ImageIcon size={12} /> No screenshot
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 14px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                                            {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* CREATE */}
            {view === "create" && (
                <div style={{ maxWidth: 520 }}>
                    <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label className="input-label">Lottery Name *</label>
                                <input className="input-field" placeholder='e.g. "Diwali Mega Giveaway"'
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="input-label">Description (shown to customers)</label>
                                <textarea className="input-field" style={{ resize: "none", minHeight: 70 }}
                                    placeholder="Tell customers how to enter — follow on Instagram & YouTube, attach screenshot..."
                                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div>
                                <label className="input-label">Prize *</label>
                                <input className="input-field" placeholder='e.g. "Free Gaming Mouse + ₹500 OFF coupon"'
                                    value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} required />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label className="input-label">Store Section</label>
                                    <select className="input-field" value={form.store_section} onChange={e => setForm(f => ({ ...f, store_section: e.target.value }))}>
                                        <option value="all">All Stores</option>
                                        <option value="infofix">Infofix</option>
                                        <option value="refurbished">Refurbished</option>
                                        <option value="wholesale">Wholesale</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Status</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                        <option value="active">Active (Live)</option>
                                        <option value="draft">Draft (Hidden)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="input-label">End Date & Time (optional)</label>
                                <input type="datetime-local" className="input-field"
                                    value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 12 }}>
                            <button type="submit" disabled={createLoading} className="act-btn"
                                style={{ background: "#6366f1", color: "#fff", padding: "12px 28px", borderRadius: 12, fontSize: 14, flex: 1, justifyContent: "center", opacity: createLoading ? 0.7 : 1 }}>
                                {createLoading ? "Creating..." : <><Plus size={15} /> Create Lottery</>}
                            </button>
                            <button type="button" onClick={() => setView("list")} className="act-btn"
                                style={{ background: "#f1f5f9", color: "#475569", padding: "12px 20px", borderRadius: 12, fontSize: 14 }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* WINNER MODAL */}
            {showWinnerModal && winner && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)"
                }}>
                    <div className="winner-modal-anim" style={{
                        position: "relative", width: "100%", maxWidth: 380,
                        background: "linear-gradient(160deg,#0f0c29 0%,#1a1060 50%,#1e1b4b 100%)",
                        borderRadius: 28, padding: 32, textAlign: "center",
                        boxShadow: "0 24px 80px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
                    }}>
                        {["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#fbbf24", "#818cf8", "#ef4444"].map((c, i) => (
                            <div key={i} className="confetti-piece" style={{ background: c, left: `${10 + i * 12}%`, top: "5%", animationDelay: `${i * 0.1}s` }} />
                        ))}
                        <button onClick={() => setShowWinnerModal(false)}
                            style={{
                                position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: "50%",
                                background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)"
                            }}>
                            <X size={14} />
                        </button>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
                        <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 12 }}>
                            Winner Selected!
                        </div>
                        <div style={{
                            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 16, padding: "16px 20px", marginBottom: 16
                        }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{winner.name}</div>
                            <div style={{ fontSize: 12, color: "#a5b4fc", marginBottom: 6 }}>{winner.email}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{winner.location}</div>
                            {/* WhatsApp add to group button */}
                            <a href={`https://api.whatsapp.com/send?phone=91${winner.whatsapp}&text=${encodeURIComponent(`🎉 Congratulations ${winner.name}! You have won the Infofix lottery! 🏆\n\nPrize: ${selectedLottery?.prize}\n\nPlease join our announcement group to claim your prize. — Infofix Computers Team`)}`}
                                target="_blank" rel="noreferrer"
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    background: "#25d366", color: "#fff", borderRadius: 12, padding: "10px 16px",
                                    fontWeight: 800, fontSize: 13, textDecoration: "none", marginBottom: 8
                                }}>
                                <span className="bi bi-whatsapp text-base" />
                                Message {winner.name} on WhatsApp
                            </a>
                            {winner.screenshot_url && (
                                <a href={winner.screenshot_url} target="_blank" rel="noreferrer"
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                        color: "#a5b4fc", fontSize: 11, fontWeight: 700, textDecoration: "none"
                                    }}>
                                    <ImageIcon size={12} /> View follow proof screenshot
                                </a>
                            )}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={confirmWinner}
                                className="act-btn" style={{
                                    background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1e1b4b",
                                    padding: "12px", borderRadius: 12, fontSize: 13, flex: 1, justifyContent: "center"
                                }}>
                                <Crown size={14} /> Confirm & End Lottery
                            </button>
                            <button onClick={() => { setWinner(null); setTimeout(pickWinner, 100); }}
                                className="act-btn" style={{
                                    background: "rgba(255,255,255,0.08)", color: "#e0e7ff",
                                    padding: "12px 16px", borderRadius: 12
                                }}>
                                Reroll
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Screenshot lightbox */}
            {lightboxImg && (
                <div onClick={() => setLightboxImg(null)}
                    style={{
                        position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.9)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 24, cursor: "pointer"
                    }}>
                    <img src={lightboxImg} alt="Screenshot" style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 16, objectFit: "contain" }} />
                    <button style={{
                        position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none",
                        borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#fff"
                    }}>
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};
