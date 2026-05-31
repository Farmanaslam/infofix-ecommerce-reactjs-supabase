import React, { useState, useEffect, useCallback } from "react";
import {
    Briefcase, MapPin, Clock, Plus, Edit3, Trash2, Eye, EyeOff, X,
    ChevronDown, ChevronUp, Users, CheckCircle, AlertCircle, Search,
    TrendingUp, Star, DollarSign, BookOpen, Zap, Award, Target,
    ToggleLeft, ToggleRight, Save, ArrowLeft, Hash, Calendar,
    FileText, Layers, Mail, Phone, Download, UserCheck, Inbox,
    IndianRupee,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Job } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Application {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    preferred_role: string | null;
    job_id: string | null;
    cv_url: string | null;
    submitted_at: string;
}

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship", "Remote", "Hybrid"];
const DEPARTMENTS = ["Engineering", "Sales", "HR", "Marketing", "Operations", "Support", "Finance", "Design", "Management"];
const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Lead", "Manager"];

const EMPTY_JOB: Partial<Job> = {
    title: "", type: "Full-Time", location: "Durgapur, WB", department: "Engineering",
    description: "", qualifications: "", responsibilities: "", benefits: "",
    salary_range: "", experience_level: "Mid Level", skills_required: [],
    is_active: true, is_featured: false, openings_count: 1, deadline: null,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sub?: string; accent: string; bg: string }> =
    ({ icon, label, value, sub, accent, bg }) => (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-200">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <div style={{ color: accent }}>{icon}</div>
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                {sub && <p className="text-[10px] font-medium mt-0.5" style={{ color: accent }}>{sub}</p>}
            </div>
        </div>
    );

// ─── Application Card ─────────────────────────────────────────────────────────
const ApplicationCard: React.FC<{ app: Application }> = ({ app }) => {
    const timeAgo = (() => {
        const diff = Date.now() - new Date(app.submitted_at).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return "Today";
        if (days === 1) return "Yesterday";
        return `${days}d ago`;
    })();

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-150">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 font-black text-sm">
                {app.full_name.charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{app.full_name}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                    {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>}
                    <span>{timeAgo}</span>
                </div>
            </div>
            {/* CV link */}
            {app.cv_url ? (
                <a href={app.cv_url} target="_blank" rel="noreferrer"
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
                    <Download className="w-3.5 h-3.5" /> CV
                </a>
            ) : (
                <span className="shrink-0 px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold border border-slate-100">No CV</span>
            )}
        </div>
    );
};

// ─── Skill Tag Input ──────────────────────────────────────────────────────────
const SkillTagInput: React.FC<{ value: string[]; onChange: (tags: string[]) => void }> = ({ value, onChange }) => {
    const [input, setInput] = useState("");
    const add = () => {
        const t = input.trim();
        if (t && !value.includes(t)) onChange([...value, t]);
        setInput("");
    };
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2 min-h-9">
                {value.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {tag}
                        <button type="button" onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
                    placeholder="Add skill & press Enter…"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50" />
                <button type="button" onClick={add} className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">Add</button>
            </div>
        </div>
    );
};

// ─── Rich Textarea ────────────────────────────────────────────────────────────
const RichTextarea: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; icon?: React.ReactNode }> =
    ({ label, value, onChange, placeholder, hint, icon }) => (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1.5">
                {icon && <span className="text-indigo-500">{icon}</span>}{label}
            </label>
            <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={5}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50 resize-none leading-relaxed" />
            {hint && <p className="text-[10px] text-slate-400 mt-1 font-medium">{hint}</p>}
        </div>
    );

// ─── Job Form ─────────────────────────────────────────────────────────────────
const JobForm: React.FC<{ initial?: Partial<Job>; onSave: (data: Partial<Job>) => Promise<void>; onCancel: () => void; saving: boolean }> =
    ({ initial = EMPTY_JOB, onSave, onCancel, saving }) => {
        const [form, setForm] = useState<Partial<Job>>(initial);
        const set = (key: keyof Job, val: any) => setForm(p => ({ ...p, [key]: val }));

        return (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(99,102,241,0.08)" }}>
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#f8f7ff,#eef2ff)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            {initial.id ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900">{initial.id ? "Edit Job Posting" : "Create New Job Posting"}</h2>
                            <p className="text-xs text-slate-400 font-medium">{initial.id ? "Update existing position details" : "Add a new open position to careers page"}</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Basic Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center"><Hash className="w-3 h-3 text-white" /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Basic Information</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Job Title *</label>
                                <input required value={form.title ?? ""} onChange={e => set("title", e.target.value)}
                                    placeholder="e.g. Senior Sales Executive, Hardware Technician…"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold bg-slate-50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Department</label>
                                <select value={form.department ?? ""} onChange={e => set("department", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50 appearance-none cursor-pointer">
                                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Job Type</label>
                                <select value={form.type ?? ""} onChange={e => set("type", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50 appearance-none cursor-pointer">
                                    {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input value={form.location ?? ""} onChange={e => set("location", e.target.value)} placeholder="Durgapur, WB / Remote"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Experience Level</label>
                                <select value={form.experience_level ?? ""} onChange={e => set("experience_level", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50 appearance-none cursor-pointer">
                                    {EXPERIENCE_LEVELS.map(e => <option key={e}>{e}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Salary Range</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input value={form.salary_range ?? ""} onChange={e => set("salary_range", e.target.value)}
                                        placeholder="₹2.5L – ₹5L / yr  (leave blank = negotiable)"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">No. of Openings</label>
                                <input type="number" min={1} value={form.openings_count ?? 1} onChange={e => set("openings_count", parseInt(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Application Deadline</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="date" value={form.deadline ?? ""} onChange={e => set("deadline", e.target.value || null)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-wrap gap-4">
                        {[
                            { key: "is_active" as keyof Job, label: "Active (Visible on Careers page)", icon: <Eye className="w-4 h-4" />, color: "indigo" },
                            { key: "is_featured" as keyof Job, label: "Featured (Highlighted on top)", icon: <Star className="w-4 h-4" />, color: "amber" },
                        ].map(({ key, label, icon, color }) => {
                            const active = !!form[key];
                            return (
                                <button key={key} type="button" onClick={() => set(key, !active)}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-150 ${active
                                        ? color === "indigo" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-amber-50 border-amber-300 text-amber-700"
                                        : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                                    {active ? <ToggleRight className={`w-5 h-5 ${color === "indigo" ? "text-indigo-600" : "text-amber-500"}`} /> : <ToggleLeft className="w-5 h-5" />}
                                    {icon} {label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center"><FileText className="w-3 h-3 text-white" /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Job Content</h3>
                        </div>
                        <div className="space-y-5">
                            <RichTextarea label="Job Description *" value={form.description ?? ""} onChange={v => set("description", v)}
                                placeholder="Describe the role, team culture, day-to-day activities…" hint="First thing candidates read. Make it compelling."
                                icon={<Briefcase className="w-3.5 h-3.5" />} />
                            <RichTextarea label="Responsibilities" value={form.responsibilities ?? ""} onChange={v => set("responsibilities", v)}
                                placeholder={"• Manage client accounts\n• Collaborate with technical team\n• Drive monthly targets…"}
                                hint="Use bullet points (•) for readability." icon={<Target className="w-3.5 h-3.5" />} />
                            <RichTextarea label="Qualifications & Requirements" value={form.qualifications ?? ""} onChange={v => set("qualifications", v)}
                                placeholder={"• Bachelor's degree\n• 2+ years experience\n• Strong communication skills…"}
                                hint="List must-have and nice-to-have qualifications separately." icon={<BookOpen className="w-3.5 h-3.5" />} />
                            <RichTextarea label="Benefits & Perks" value={form.benefits ?? ""} onChange={v => set("benefits", v)}
                                placeholder={"• Competitive salary + bonus\n• Health insurance\n• Flexible working hours…"}
                                hint="Great benefits attract great talent." icon={<Award className="w-3.5 h-3.5" />} />
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center"><Zap className="w-3 h-3 text-white" /></div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Skills Required</h3>
                        </div>
                        <SkillTagInput value={form.skills_required ?? []} onChange={tags => set("skills_required", tags)} />
                    </div>
                </div>

                <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/60">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.title?.trim()}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? "Saving…" : initial.id ? "Update Posting" : "Publish Posting"}
                    </button>
                </div>
            </div>
        );
    };

// ─── Job Card with inline applications ───────────────────────────────────────
const JobCard: React.FC<{
    job: Job;
    applications: Application[];
    onEdit: () => void;
    onDelete: () => void;
    onToggleActive: () => void;
    onToggleFeatured: () => void;
    expanded: boolean;
    onToggleExpand: () => void;
}> = ({ job, applications, onEdit, onDelete, onToggleActive, onToggleFeatured, expanded, onToggleExpand }) => {
    const [showApps, setShowApps] = useState(false);
    const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
    const isExpired = job.deadline && new Date(job.deadline) < new Date();
    const appCount = applications.length;

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg ${job.is_active ? "border-slate-200" : "border-slate-100 opacity-70"} ${job.is_featured ? "ring-2 ring-amber-300 ring-offset-1" : ""}`}>
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${job.is_active ? "bg-indigo-50" : "bg-slate-100"}`}>
                        <Briefcase className={`w-6 h-6 ${job.is_active ? "text-indigo-600" : "text-slate-400"}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-black text-slate-900 truncate">{job.title}</h3>
                            {job.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                                    <Star className="w-2.5 h-2.5" /> Featured
                                </span>
                            )}
                            {isExpired && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider">
                                    <AlertCircle className="w-2.5 h-2.5" /> Expired
                                </span>
                            )}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${job.is_active ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-slate-100 border border-slate-200 text-slate-500"}`}>
                                {job.is_active ? <CheckCircle className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                                {job.is_active ? "Active" : "Hidden"}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {job.department}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.openings_count} opening{job.openings_count !== 1 ? "s" : ""}</span>
                            {job.salary_range && <span className="flex items-center gap-1 text-indigo-600 font-bold"><IndianRupee className="w-3 h-3" /> {job.salary_range}</span>}
                            <span className="text-slate-400">{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
                        </div>

                        {job.skills_required?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {job.skills_required.slice(0, 5).map(s => (
                                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">{s}</span>
                                ))}
                                {job.skills_required.length > 5 && (
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[10px] font-bold">+{job.skills_required.length - 5} more</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={onToggleFeatured} title={job.is_featured ? "Unfeature" : "Feature"}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${job.is_featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                            <Star className="w-4 h-4" />
                        </button>
                        <button onClick={onToggleActive}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${job.is_active ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                            {job.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={onEdit} className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition-colors">
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={onDelete} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={onToggleExpand} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Applications toggle button */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button onClick={() => setShowApps(s => !s)}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${appCount > 0 ? "text-indigo-600 hover:text-indigo-800" : "text-slate-400 cursor-default"}`}
                        disabled={appCount === 0}>
                        <UserCheck className="w-4 h-4" />
                        {appCount} Application{appCount !== 1 ? "s" : ""}
                        {appCount > 0 && (showApps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                    </button>

                    {showApps && appCount > 0 && (
                        <div className="mt-3 space-y-2">
                            {applications.map(app => <ApplicationCard key={app.id} app={app} />)}
                        </div>
                    )}
                </div>

                {/* Expanded job details */}
                {expanded && (
                    <div className="mt-5 pt-5 border-t border-slate-100 grid md:grid-cols-2 gap-5">
                        {[
                            { label: "Description", value: job.description, icon: <FileText className="w-3.5 h-3.5" /> },
                            { label: "Responsibilities", value: job.responsibilities, icon: <Target className="w-3.5 h-3.5" /> },
                            { label: "Qualifications", value: job.qualifications, icon: <BookOpen className="w-3.5 h-3.5" /> },
                            { label: "Benefits", value: job.benefits, icon: <Award className="w-3.5 h-3.5" /> },
                        ].filter(s => s.value).map(({ label, value, icon }) => (
                            <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-indigo-600 uppercase tracking-wider">{icon} {label}</div>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{value}</p>
                            </div>
                        ))}
                        {job.deadline && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Deadline</p>
                                    <p className={`text-sm font-bold ${isExpired ? "text-red-500" : "text-slate-700"}`}>
                                        {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {job.experience_level && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Experience</p>
                                    <p className="text-sm font-bold text-slate-700">{job.experience_level}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const CareerPortal: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "form">("list");
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [filterDept, setFilterDept] = useState<string>("All");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [activeTab, setActiveTab] = useState<"jobs" | "general">("jobs");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        const [{ data: jobsData }, { data: appsData }] = await Promise.all([
            supabase.from("careers").select("*").order("created_at", { ascending: false }),
            supabase.from("career_applications").select("*").order("submitted_at", { ascending: false }),
        ]);
        if (jobsData) setJobs(jobsData as Job[]);
        if (appsData) setApplications(appsData as Application[]);
        setLoading(false);
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    // Derived
    const totalActive = jobs.filter(j => j.is_active).length;
    const totalFeatured = jobs.filter(j => j.is_featured).length;
    const totalOpenings = jobs.filter(j => j.is_active).reduce((s, j) => s + (j.openings_count ?? 1), 0);
    const totalApps = applications.length;
    const generalApps = applications.filter(a => !a.job_id);

    const getJobApps = (jobId: string) => applications.filter(a => a.job_id === jobId);

    const handleSave = async (formData: Partial<Job>) => {
        if (!formData.title?.trim()) return;
        setSaving(true);
        try {
            const payload = { ...formData, updated_at: new Date().toISOString() };
            if (editingJob?.id) {
                const { error } = await supabase.from("careers").update(payload).eq("id", editingJob.id);
                if (error) throw error;
                showToast("Job posting updated successfully!");
            } else {
                const { error } = await supabase.from("careers").insert([{ ...payload, created_at: new Date().toISOString() }]);
                if (error) throw error;
                showToast("Job posting published successfully!");
            }
            await fetchJobs();
            setView("list");
            setEditingJob(null);
        } catch (err: any) {
            showToast(err?.message ?? "Something went wrong.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (job: Job) => {
        if (!window.confirm(`Delete "${job.title}"? This is permanent.`)) return;
        const { error } = await supabase.from("careers").delete().eq("id", job.id);
        if (error) { showToast(error.message, "error"); return; }
        setJobs(prev => prev.filter(j => j.id !== job.id));
        showToast("Job posting deleted.");
    };

    const toggle = async (job: Job, key: "is_active" | "is_featured") => {
        const newVal = !job[key];
        await supabase.from("careers").update({ [key]: newVal }).eq("id", job.id);
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, [key]: newVal } : j));
        showToast(key === "is_active" ? (newVal ? "Job set to Active" : "Job hidden from public") : (newVal ? "Job marked as Featured" : "Featured removed"));
    };

    const filtered = jobs.filter(j => {
        const q = search.toLowerCase();
        const matchSearch = !q || j.title.toLowerCase().includes(q) || j.department?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
        const matchStatus = filterStatus === "all" || (filterStatus === "active" ? j.is_active : !j.is_active);
        const matchDept = filterDept === "All" || j.department === filterDept;
        return matchSearch && matchStatus && matchDept;
    });

    if (view === "form") {
        return (
            <div>
                <button onClick={() => { setView("list"); setEditingJob(null); }}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Job Listings
                </button>
                <JobForm initial={editingJob ?? EMPTY_JOB} onSave={handleSave} onCancel={() => { setView("list"); setEditingJob(null); }} saving={saving} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-bold transition-all duration-300 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
                    style={{ boxShadow: toast.type === "success" ? "0 8px 30px rgba(5,150,105,0.4)" : "0 8px 30px rgba(239,68,68,0.4)" }}>
                    {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Careers Portal</h1>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">Manage job postings, visibility & applications</p>
                </div>
                <button onClick={() => { setEditingJob(null); setView("form"); }}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 self-start md:self-auto">
                    <Plus className="w-4 h-4" /> New Job Posting
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Briefcase className="w-5 h-5" />} label="Total Postings" value={jobs.length} sub="All time" accent="#6366f1" bg="#eef2ff" />
                <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Jobs" value={totalActive} sub="Visible to public" accent="#059669" bg="#f0fdf4" />
                <StatCard icon={<UserCheck className="w-5 h-5" />} label="Total Applications" value={totalApps} sub="All submissions" accent="#7c3aed" bg="#f5f3ff" />
                <StatCard icon={<Inbox className="w-5 h-5" />} label="General CVs" value={generalApps.length} sub="Future opportunities" accent="#d97706" bg="#fffbeb" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {[
                    { id: "jobs" as const, label: "Job Postings", count: jobs.length },
                    { id: "general" as const, label: "General Applications", count: generalApps.length },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {tab.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {activeTab === "jobs" ? (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-48 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search postings…"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Hidden Only</option>
                        </select>
                        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
                            <option>All</option>
                            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                        {(search || filterStatus !== "all" || filterDept !== "All") && (
                            <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDept("All"); }}
                                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                        <span className="text-xs font-bold text-slate-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Job List */}
                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-semibold text-slate-400">Loading…</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map(job => (
                                <JobCard key={job.id} job={job} applications={getJobApps(job.id)}
                                    onEdit={() => { setEditingJob(job); setView("form"); }}
                                    onDelete={() => handleDelete(job)}
                                    onToggleActive={() => toggle(job, "is_active")}
                                    onToggleFeatured={() => toggle(job, "is_featured")}
                                    expanded={expandedId === job.id}
                                    onToggleExpand={() => setExpandedId(expandedId === job.id ? null : job.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-700 mb-2">
                                {search || filterStatus !== "all" || filterDept !== "All" ? "No Results Found" : "No Job Postings Yet"}
                            </h3>
                            <p className="text-sm text-slate-400 mb-6">
                                {search || filterStatus !== "all" || filterDept !== "All" ? "Try adjusting your filters." : "Create your first job posting to start attracting talent."}
                            </p>
                            {!(search || filterStatus !== "all" || filterDept !== "All") && (
                                <button onClick={() => { setEditingJob(null); setView("form"); }}
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-100">
                                    <Plus className="w-4 h-4" /> Create First Posting
                                </button>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* General Applications Tab */
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Inbox className="w-5 h-5 text-amber-500" />
                        <h2 className="text-base font-black text-slate-800">General / Future Opportunity Applications</h2>
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black">{generalApps.length}</span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-semibold text-slate-400">Loading…</p>
                        </div>
                    ) : generalApps.length > 0 ? (
                        <div className="space-y-2">
                            {generalApps.map(app => (
                                <div key={app.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-150">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600 font-black text-sm">
                                        {app.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{app.full_name}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium mt-0.5">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.email}</span>
                                            {app.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>}
                                            {app.preferred_role && (
                                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-bold text-[10px] border border-indigo-100">
                                                    {app.preferred_role}
                                                </span>
                                            )}
                                            <span>{new Date(app.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                    {app.cv_url ? (
                                        <a href={app.cv_url} target="_blank" rel="noreferrer"
                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
                                            <Download className="w-3.5 h-3.5" /> CV
                                        </a>
                                    ) : (
                                        <span className="shrink-0 px-3 py-2 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold border border-slate-100">No CV</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Inbox className="w-8 h-8 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-700 mb-2">No General Applications Yet</h3>
                            <p className="text-sm text-slate-400">When candidates submit CVs for future opportunities, they'll appear here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
