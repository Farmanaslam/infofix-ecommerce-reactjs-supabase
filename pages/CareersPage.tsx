import React, { useState, useEffect } from "react";
import { X, MapPin, Briefcase, Clock, Upload, CheckCircle, Star, Users, ChevronDown, ChevronUp, Award, Target, BookOpen, IndianRupee } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Job } from "@/types";

export const CareersPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const [generalForm, setGeneralForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_role: "",
    cv_file: null as File | null,
  });

  const [applyForm, setApplyForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cv_file: null as File | null,
  });

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      if (!error) setJobs(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const uploadCV = async (file: File, applicantName: string): Promise<string | null> => {
    const sanitizedName = applicantName.replace(/\s+/g, "_").toLowerCase();
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filePath = `cvs/${sanitizedName}_${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from("career-applications")
      .upload(filePath, file, { upsert: false });

    if (error) { console.error("CV upload error:", error.message); return null; }

    const { data } = supabase.storage.from("career-applications").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const submitApplication = async (
    formData: { full_name: string; email: string; phone?: string; preferred_role?: string; cv_file: File | null },
    jobId?: string,
    jobTitle?: string,
  ): Promise<boolean> => {
    setUploading(true);
    try {
      let cvUrl: string | null = null;
      if (formData.cv_file) {
        cvUrl = await uploadCV(formData.cv_file, formData.full_name);
      }

      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        preferred_role: jobTitle || formData.preferred_role || null,
        job_id: jobId || null,
        cv_url: cvUrl,
        submitted_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("career_applications").insert([payload]);
      if (error) { alert("Something went wrong. Please try again."); return false; }
      return true;
    } catch (err) {
      console.error(err);
      alert("Submission failed. Try again.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitApplication(generalForm);
    if (ok) {
      setSubmitted(true);
      setGeneralForm({ full_name: "", email: "", phone: "", preferred_role: "", cv_file: null });
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    const ok = await submitApplication(applyForm, selectedJob.id, selectedJob.title);
    if (ok) {
      setModalSubmitted(true);
      setTimeout(() => {
        setSelectedJob(null);
        setModalSubmitted(false);
        setApplyForm({ full_name: "", email: "", phone: "", cv_file: null });
      }, 2500);
    }
  };

  const featuredJobs = jobs.filter(j => j.is_featured);
  const regularJobs = jobs.filter(j => !j.is_featured);

  return (
    <div className="min-h-screen bg-white py-8 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HERO */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-5xl font-black bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Careers at Infofix Computers
          </h1>
          <p className="text-gray-500 mt-6 text-lg max-w-2xl mx-auto">
            Join our growing team and build your future with Infofix Computers.
          </p>
        </div>

        {/* JOB LISTINGS */}
        <div className="mb-24">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Current Openings</h2>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading openings…</div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {[...featuredJobs, ...regularJobs].map((job) => {
                const isExpanded = expandedJob === job.id;
                const isExpired = job.deadline && new Date(job.deadline) < new Date();
                return (
                  <div
                    key={job.id}
                    className={`border rounded-2xl transition-all bg-gray-50 hover:bg-white hover:shadow-xl ${job.is_featured ? "border-amber-200 ring-2 ring-amber-100" : "border-gray-200"}`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                            {job.is_featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase">
                                <Star className="w-2.5 h-2.5" /> Featured
                              </span>
                            )}
                            {isExpired && (
                              <span className="px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[10px] font-black uppercase">Deadline Passed</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-600 font-semibold mt-1">
                            <span className="flex items-center gap-1"><Briefcase size={13} /> {job.type}</span>
                            <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
                            {job.department && <span className="text-slate-500">{job.department}</span>}
                            {job.experience_level && <span className="text-slate-500">{job.experience_level}</span>}
                            {job.openings_count > 0 && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Users size={13} /> {job.openings_count} opening{job.openings_count !== 1 ? "s" : ""}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                <IndianRupee size={13} /> {job.salary_range}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mt-3 max-w-2xl leading-relaxed">{job.description}</p>

                          {/* Skills */}
                          {job.skills_required?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {job.skills_required.map(s => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">{s}</span>
                              ))}
                            </div>
                          )}

                          {/* Deadline */}
                          {job.deadline && (
                            <p className={`text-xs font-semibold mt-2 ${isExpired ? "text-red-500" : "text-slate-400"}`}>
                              Apply by: {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Expand details */}
                          {(job.responsibilities || job.qualifications || job.benefits) && (
                            <button
                              onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-1"
                            >
                              Details {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedJob(job)}
                            disabled={!!isExpired}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-gray-100 grid md:grid-cols-3 gap-4">
                          {[
                            { label: "Responsibilities", value: job.responsibilities, icon: <Target className="w-3.5 h-3.5" /> },
                            { label: "Requirements", value: job.qualifications, icon: <BookOpen className="w-3.5 h-3.5" /> },
                            { label: "Benefits", value: job.benefits, icon: <Award className="w-3.5 h-3.5" /> },
                          ].filter(s => s.value).map(({ label, value, icon }) => (
                            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-indigo-600 uppercase tracking-wider">{icon} {label}</div>
                              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-10 text-center">
              <h3 className="text-xl font-bold text-gray-900">No Current Openings</h3>
              <p className="text-gray-500 mt-3">No open positions right now. Submit your CV below for future opportunities.</p>
            </div>
          )}
        </div>

        {/* GENERAL CV FORM */}
        <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-1">Submit Your CV</h2>
          <p className="text-sm text-gray-500 mb-6">No open role that fits? Drop your CV — we'll reach out when something matches.</p>

          {submitted ? (
            <div className="flex flex-col items-center py-10 gap-4 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
              <p className="text-gray-500 text-sm">We've received your details and will be in touch soon.</p>
              <button onClick={() => setSubmitted(false)} className="mt-2 px-5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleGeneralSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-600">Full Name *</label>
                <input type="text" required value={generalForm.full_name}
                  onChange={(e) => setGeneralForm({ ...generalForm, full_name: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Email *</label>
                <input type="email" required value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Phone</label>
                <input type="tel" value={generalForm.phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Preferred Role</label>
                <input type="text" placeholder="Sales / HR / Technician / etc" value={generalForm.preferred_role}
                  onChange={(e) => setGeneralForm({ ...generalForm, preferred_role: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-600">Upload CV *</label>
                <label className="mt-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-white cursor-pointer hover:border-indigo-400 transition-all text-sm text-gray-500">
                  <Upload size={16} className="text-indigo-500" />
                  {generalForm.cv_file ? generalForm.cv_file.name : "Click to upload PDF / DOC / DOCX"}
                  <input type="file" accept=".pdf,.doc,.docx" required className="hidden"
                    onChange={(e) => setGeneralForm({ ...generalForm, cv_file: e.target.files?.[0] || null })} />
                </label>
              </div>
              <div className="md:col-span-2">
                <button type="submit" disabled={uploading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed">
                  {uploading ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 relative">
            <button onClick={() => { setSelectedJob(null); setModalSubmitted(false); }}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500"><X /></button>

            {modalSubmitted ? (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <CheckCircle size={48} className="text-green-500" />
                <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
                <p className="text-gray-500 text-sm">
                  Thank you for applying for <strong>{selectedJob.title}</strong>. We'll be in touch!
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900">Apply for {selectedJob.title}</h2>
                <p className="text-sm text-indigo-600 font-semibold mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Briefcase size={13} /> {selectedJob.type}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {selectedJob.location}</span>
                </p>

                <form onSubmit={handleApplySubmit} className="space-y-4 mt-6">
                  <div>
                    <label className="text-xs font-bold text-gray-600">Full Name *</label>
                    <input type="text" placeholder="Your full name" required value={applyForm.full_name}
                      onChange={(e) => setApplyForm({ ...applyForm, full_name: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Email *</label>
                    <input type="email" placeholder="you@example.com" required value={applyForm.email}
                      onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Phone</label>
                    <input type="tel" placeholder="+91 XXXXX XXXXX" value={applyForm.phone}
                      onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Upload CV *</label>
                    <label className="mt-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-indigo-400 transition-all text-sm text-gray-500">
                      <Upload size={16} className="text-indigo-500" />
                      {applyForm.cv_file ? applyForm.cv_file.name : "Click to upload PDF / DOC / DOCX"}
                      <input type="file" accept=".pdf,.doc,.docx" required className="hidden"
                        onChange={(e) => setApplyForm({ ...applyForm, cv_file: e.target.files?.[0] || null })} />
                    </label>
                  </div>
                  <button type="submit" disabled={uploading}
                    className="w-full cursor-pointer py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {uploading ? "Submitting…" : "Submit Application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
