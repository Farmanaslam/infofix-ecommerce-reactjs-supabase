import React, { useState, useEffect, useRef } from "react";
import { X, Gift, Sparkles, ArrowRight, CheckCircle2, Trophy, Clock, Zap, Upload, Instagram, Youtube, Camera, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Lottery } from "@/types";

interface LotteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeSection?: string;
    prefillName?: string;
    prefillEmail?: string;
    forcedLottery?: import("@/types").Lottery | null;
}

export const LotteryModal: React.FC<LotteryModalProps> = ({
    isOpen,
    onClose,
    storeSection = "infofix",
    prefillName = "",
    prefillEmail = "",
    forcedLottery,
}) => {
    const [lottery, setLottery] = useState<Lottery | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<"form" | "success">("form");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState("");
    const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
    const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [entryCount, setEntryCount] = useState(2010);
    const GOAL = 10000;
    const [form, setForm] = useState({
        name: prefillName,
        email: prefillEmail,
        whatsapp: "",
        location: "",
    });

    useEffect(() => {
        if (forcedLottery) setLottery(forcedLottery);
        if (!isOpen) return;
        setStep("form");
        setError("");
        setScreenshotFiles([]);
        setScreenshotPreviews([]);
        setForm({ name: prefillName, email: prefillEmail, whatsapp: "", location: "" });
        fetchActiveLottery();
    }, [isOpen, storeSection]);

    useEffect(() => {
        if (!lottery?.ends_at) return;
        const tick = () => {
            const diff = new Date(lottery.ends_at!).getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Ends soon"); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            setTimeLeft(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`);
        };
        tick();
        const t = setInterval(tick, 60000);
        return () => clearInterval(t);
    }, [lottery?.ends_at]);

    const fetchActiveLottery = async () => {
        if (forcedLottery) {
            setLottery(forcedLottery);
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data } = await supabase
            .from("lotteries")
            .select("*")
            .eq("status", "active")
            .or(`store_section.eq.${storeSection.toLowerCase()},store_section.eq.all`)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        setLottery(data);
        setLoading(false);
    };
    useEffect(() => {
        if (!lottery?.id) return;
        const fetchCount = async () => {
            const { count } = await supabase
                .from("lottery_entries")
                .select("id", { count: "exact", head: true })
                .eq("lottery_id", lottery.id);
            setEntryCount(2010 + (count ?? 0));
        };
        fetchCount();
        const t = setInterval(fetchCount, 30000);
        return () => clearInterval(t);
    }, [lottery?.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        const remaining = 3 - screenshotFiles.length;
        const toAdd = files.slice(0, remaining);
        const oversized = toAdd.find(f => f.size > 5 * 1024 * 1024);
        if (oversized) { setError("Each screenshot must be under 5MB."); return; }
        setScreenshotFiles(prev => [...prev, ...toAdd]);
        setScreenshotPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
        setError("");
        // reset input so same file can be re-added after removal
        if (fileRef.current) fileRef.current.value = "";
    };

    const uploadScreenshots = async (): Promise<string[]> => {
        const urls: string[] = [];
        for (const file of screenshotFiles) {
            const ext = file.name.split(".").pop();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { data, error: upErr } = await supabase.storage
                .from("lottery-screenshots")
                .upload(path, file, { cacheControl: "3600", upsert: false });
            if (!upErr && data) {
                const { data: urlData } = supabase.storage
                    .from("lottery-screenshots")
                    .getPublicUrl(data.path);
                if (urlData?.publicUrl) urls.push(urlData.publicUrl);
            }
        }
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lottery) return;
        if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim() || !form.location.trim()) {
            setError("All fields are required.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError("Enter a valid email address.");
            return;
        }
        if (!/^\d{10}$/.test(form.whatsapp.replace(/\s/g, ""))) {
            setError("Enter a valid 10-digit WhatsApp number.");
            return;
        }
        if (screenshotFiles.length === 0) {
            setError("Please attach at least one follow screenshot to be eligible.");
            return;
        }
        setSubmitting(true);
        setUploadProgress(true);
        setError("");

        const screenshotUrls = await uploadScreenshots();
        setUploadProgress(false);

        const { error: err } = await supabase.from("lottery_entries").insert({
            lottery_id: lottery.id,
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            whatsapp: form.whatsapp.trim(),
            location: form.location.trim(),
            screenshot_url: screenshotUrls[0] ?? null,
            screenshot_urls: screenshotUrls,
        }); setSubmitting(false);

        if (err) {
            // AFTER
            if (err.code === "23505") {
                if (err.message?.includes("whatsapp")) {
                    setError("This WhatsApp number already has an entry. One entry per person.");
                } else {
                    setError("You've already entered this lottery with this email.");
                }
            }
            return;
        }
        if (!err) {
            // fire email — no await, don't block UI
            supabase.functions.invoke("send-lottery-email", {
                body: {
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    whatsapp: form.whatsapp.trim(),
                    location: form.location.trim(),
                    lottery_name: lottery.name,
                    prize: lottery.prize,
                    screenshot_urls: screenshotUrls,
                },
            });
            setStep("success");
        }
        setStep("success");
        const { count: newC } = await supabase
            .from("lottery_entries")
            .select("id", { count: "exact", head: true })
            .eq("lottery_id", lottery.id);
        setEntryCount(2010 + (newC ?? 0));
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
        @keyframes lotteryIn {
          from { opacity:0; transform:scale(0.93) translateY(24px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes shimmerLottery {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes floatBadge {
          0%,100% { transform:translateY(0) rotate(-2deg); }
          50%     { transform:translateY(-6px) rotate(2deg); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(251,191,36,0.5); }
          50%     { box-shadow:0 0 0 8px rgba(251,191,36,0); }
        }
        @keyframes confettiFall {
          0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
          100% { transform:translateY(60px) rotate(720deg); opacity:0; }
        }
        .lottery-modal-card { animation: lotteryIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .lottery-badge-float { animation: floatBadge 3s ease-in-out infinite; }
        .lottery-prize-shimmer {
          background: linear-gradient(90deg,#f59e0b 0%,#fde68a 40%,#f59e0b 60%,#fde68a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmerLottery 2.2s linear infinite;
        }
        .lottery-cta-btn {
          animation: pulseGlow 2.5s ease-in-out infinite;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .lottery-cta-btn:hover  { transform:scale(1.02); }
        .lottery-cta-btn:active { transform:scale(0.97); }
        .lottery-input {
          width: 100%; padding: 10px 14px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.07); color: #fff;
          font-size: 13px; font-weight: 500; outline: none;
          transition: border-color 0.2s; box-sizing: border-box; font-family: inherit;
        }
        .lottery-input::placeholder { color: rgba(255,255,255,0.35); }
        .lottery-input:focus { border-color: #fbbf24; }
        .confetti-dot {
          position:absolute; width:6px; height:6px; border-radius:50%;
          animation: confettiFall 1.2s ease forwards;
        }
        .social-step {
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.08);
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        .social-icon-box {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .upload-zone {
          border: 2px dashed rgba(251,191,36,0.4);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(251,191,36,0.04);
        }
        .upload-zone:hover { border-color: #fbbf24; background: rgba(251,191,36,0.08); }
        .upload-zone.has-file { border-color: #34d399; background: rgba(16,185,129,0.06); }
      `}</style>

            <div
                className="fixed inset-0 z-9998 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div
                    className="lottery-modal-card relative w-full max-w-md overflow-hidden"
                    style={{
                        background: "linear-gradient(160deg,#0f0c29 0%,#1a1060 40%,#24243e 80%,#0f0c29 100%)",
                        borderRadius: 28,
                        boxShadow: "0 24px 80px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
                        maxHeight: "92vh",
                        overflowY: "auto",
                    }}
                >
                    {/* Grid texture */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
                        backgroundSize: "24px 24px",
                    }} />
                    {/* Top glow */}
                    <div style={{
                        position: "absolute", top: 0, left: "8%", right: "8%", height: 2,
                        background: "linear-gradient(90deg,transparent,#a78bfa,#fbbf24,#a78bfa,transparent)", borderRadius: 2
                    }} />
                    {/* Close */}
                    <button onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <X size={16} />
                    </button>

                    <div className="relative p-6 pt-8">
                        {loading ? (
                            <div className="flex flex-col items-center py-12 gap-4">
                                <div className="w-10 h-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                                <p className="text-white/50 text-sm">Loading offer...</p>
                            </div>
                        ) : !lottery ? (
                            <div className="flex flex-col items-center py-12 gap-3 text-center">
                                <Trophy size={40} className="text-amber-400" />
                                <p className="text-white font-black text-lg">No active lottery right now</p>
                                <p className="text-white/50 text-sm">Check back soon — big prizes coming!</p>
                                <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm">
                                    Browse Deals Instead →
                                </button>
                            </div>
                        ) : step === "success" ? (
                            <SuccessView lottery={lottery} onClose={onClose} />
                        ) : (
                            <FormView
                                lottery={lottery}
                                form={form}
                                setForm={setForm}
                                error={error}
                                submitting={submitting}
                                uploadProgress={uploadProgress}
                                timeLeft={timeLeft}
                                screenshotFiles={screenshotFiles}
                                entryCount={entryCount}
                                goal={GOAL}
                                screenshotPreviews={screenshotPreviews}
                                fileRef={fileRef}
                                onFileChange={handleFileChange}
                                onRemoveScreenshot={(i: number) => {
                                    setScreenshotFiles(prev => prev.filter((_, idx) => idx !== i));
                                    setScreenshotPreviews(prev => prev.filter((_, idx) => idx !== i));
                                }}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
const FormView = ({
    lottery, form, setForm, error, submitting, uploadProgress,
    timeLeft, screenshotFiles, screenshotPreviews, fileRef, onFileChange, onRemoveScreenshot, onSubmit, entryCount, goal,
}: any) => (
    <div>
        {/* Badge */}
        <div className="flex justify-center mb-4">
            <div className="lottery-badge-float inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)" }}>
                <Sparkles size={12} color="#fbbf24" />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "#fde68a", textTransform: "uppercase" }}>
                    Free Entry · Win Big
                </span>
            </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.25)" }}>
                <Gift size={26} color="#fbbf24" />
            </div>
            <h2 className="text-white font-black text-xl leading-tight tracking-tight mb-1">{lottery.name}</h2>
            {lottery.description && (
                <p className="text-white/50 text-xs leading-relaxed">{lottery.description}</p>
            )}
        </div>

        {/* Prize */}
        <div className="rounded-2xl p-3 mb-3 text-center"
            style={{ background: "rgba(251,191,36,0.08)", border: "1.5px dashed rgba(251,191,36,0.4)" }}>
            <div style={{ fontSize: 9, color: "rgba(251,191,36,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>🏆 Prize</div>
            <div className="lottery-prize-shimmer font-black text-sm leading-snug">{lottery.prize}</div>
        </div>

        {timeLeft && (
            <div className="flex items-center justify-center gap-2 mb-4">
                <Clock size={12} color="#818cf8" />
                <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700 }}>{timeLeft}</span>
            </div>
        )}
        {entryCount !== undefined && (
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        🎟 Entries
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24" }}>
                        {entryCount.toLocaleString()} / {goal.toLocaleString()}
                    </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{
                        height: "100%",
                        width: `${Math.min((entryCount / goal) * 100, 100)}%`,
                        borderRadius: 99,
                        background: "linear-gradient(90deg,#6366f1,#a78bfa,#fbbf24)",
                        transition: "width 1s ease",
                    }} />
                </div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: "center" }}>
                    {goal - entryCount > 0 ? `${(goal - entryCount).toLocaleString()} spots left` : "Slots full — entries still accepted!"}
                </p>
            </div>
        )}

        {/* ── SOCIAL FOLLOW STEPS ── */}
        <div className="mb-4 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
                📋 How to qualify — 2 steps
            </p>

            {/* Step 1 Instagram */}
            <div className="social-step">
                <div className="social-icon-box" style={{ background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)" }}>
                    <Instagram size={18} color="#fff" />
                </div>
                <div className="flex-1">
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Follow on Instagram</div>
                    <a href="https://www.instagram.com/infofixcomputers11" target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: "#c084fc", fontWeight: 700, textDecoration: "none" }}>
                        @infofixcomputers11 →
                    </a>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Tap the link, follow our page</div>
                </div>
            </div>

            {/* Step 2 YouTube */}
            <div className="social-step">
                <div className="social-icon-box" style={{ background: "#ff0000" }}>
                    <Youtube size={18} color="#fff" />
                </div>
                <div className="flex-1">
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Subscribe on YouTube</div>
                    <a href="https://www.youtube.com/@infofixcomputers" target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: "#f87171", fontWeight: 700, textDecoration: "none" }}>
                        @infofixcomputers →
                    </a>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Subscribe + hit the bell 🔔</div>
                </div>
            </div>

            {/* Screenshot upload */}
            <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    📸 Attach screenshot as proof *
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: "none" }} />

                {screenshotPreviews.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        {screenshotPreviews.map((src: string, i: number) => (
                            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                                <img src={src} alt={`Screenshot ${i + 1}`}
                                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(52,211,153,0.5)" }} />
                                <button type="button"
                                    onClick={() => onRemoveScreenshot(i)}
                                    style={{
                                        position: "absolute", top: -6, right: -6, width: 18, height: 18,
                                        borderRadius: "50%", background: "#ef4444", border: "none",
                                        color: "#fff", fontSize: 10, cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
                {screenshotFiles.length < 3 && (
                    <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                        <Camera size={22} color="rgba(251,191,36,0.6)" style={{ margin: "0 auto 6px" }} />
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                            {screenshotFiles.length === 0
                                ? "Tap to upload follow screenshots"
                                : `Add more (${screenshotFiles.length}/3)`}
                        </p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>JPG, PNG · Max 5MB each · Up to 3</p>
                    </div>
                )}
            </div>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
            <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    Full Name
                </label>
                <input className="lottery-input" placeholder="Your full name"
                    value={form.name} onChange={(e: any) => setForm((f: any) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    Email Address
                </label>
                <input className="lottery-input" type="email" placeholder="your@email.com"
                    value={form.email} onChange={(e: any) => setForm((f: any) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    WhatsApp Number
                </label>
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600 }}>+91</span>
                    <input className="lottery-input" style={{ paddingLeft: 42 }} placeholder="10-digit number" maxLength={10}
                        value={form.whatsapp} onChange={(e: any) => setForm((f: any) => ({ ...f, whatsapp: e.target.value.replace(/\D/g, "") }))} />
                </div>
            </div>
            <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    City / Location
                </label>
                <input className="lottery-input" placeholder="e.g. Durgapur, Asansol, Kolkata..."
                    value={form.location} onChange={(e: any) => setForm((f: any) => ({ ...f, location: e.target.value }))} />
            </div>
        </div>

        {error && (
            <div className="rounded-xl px-4 py-3 mb-3 flex items-center gap-2"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <AlertCircle size={14} color="#f87171" />
                <p style={{ color: "#fca5a5", fontSize: 12, fontWeight: 600 }}>{error}</p>
            </div>
        )}

        <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="lottery-cta-btn w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", color: "#1e1b4b", opacity: submitting ? 0.7 : 1, border: "none", cursor: "pointer", width: "100%" }}
        >
            {submitting ? (
                <>
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-900 border-t-transparent animate-spin" />
                    {uploadProgress ? "Uploading screenshot..." : "Submitting..."}
                </>
            ) : (
                <>
                    <Zap size={16} />
                    Submit Entry — Win This Prize!
                    <ArrowRight size={16} />
                </>
            )}
        </button>

        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
            🔒 Your info is private. Winners contacted via WhatsApp only.
        </p>
    </div>
);

const SuccessView = ({ lottery, onClose }: any) => (
    <div className="flex flex-col items-center text-center py-6 gap-4">
        {["#f59e0b", "#6366f1", "#10b981", "#ec4899", "#fbbf24", "#818cf8"].map((c, i) => (
            <div key={i} className="confetti-dot" style={{
                background: c, left: `${15 + i * 13}%`, top: `${10 + i * 5}%`, animationDelay: `${i * 0.12}s`
            }} />
        ))}
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)" }}>
            <CheckCircle2 size={40} color="#34d399" />
        </div>
        <div>
            <h2 className="text-white font-black text-2xl mb-1">Entry submitted! 🎉</h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                You've entered <span className="text-amber-300 font-bold">{lottery.name}</span>. We'll add verified participants to our <span className="text-green-400 font-bold">WhatsApp announcement group</span>!
            </p>
        </div>
        <div className="rounded-2xl p-3 w-full"
            style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div style={{ fontSize: 10, color: "#6ee7b7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                📱 What happens next
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, textAlign: "left" }}>
                1. Our team reviews your screenshot<br />
                2. Verified participants added to WhatsApp group<br />
                3. Winner announced live in the group 🏆
            </div>
        </div>
        <div className="w-full space-y-2">
            <button
                onClick={() => {
                    const text = `🎰 I just entered the *${lottery.name}* giveaway by Infofix Computers!\n\n✅ Follow them on Instagram & YouTube to enter free:\n📸 instagram.com/infofixcomputers11\n▶️ youtube.com/@infofixcomputers\n\nPrize: ${lottery.prize} 🏆`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                }}
                className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", border: "none", cursor: "pointer" }}
            >
                <span className="bi bi-whatsapp text-base" />
                Share — Help Friends Enter Too
            </button>
            <button onClick={onClose}
                className="w-full py-3 rounded-2xl font-black text-sm transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", background: "transparent", cursor: "pointer" }}>
                Continue Shopping
            </button>
        </div>
    </div>
);
