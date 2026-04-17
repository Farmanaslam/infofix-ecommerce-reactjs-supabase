import React, { useState, useEffect } from "react";
import { X, MapPin, Briefcase, Clock, Upload, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Job } from "@/types";

// ─── Component ────────────────────────────────────────────────────────────────
export const CareersPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  // General form state
  const [generalForm, setGeneralForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    preferred_role: "",
    cv_file: null as File | null,
  });

  // Modal apply form state
  const [applyForm, setApplyForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cv_file: null as File | null,
  });

  // ── Fetch active jobs from Supabase ──────────────────────────────────────
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("careers")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error.message);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // ── Upload CV to Supabase Storage ────────────────────────────────────────
  const uploadCV = async (
    file: File,
    applicantName: string,
  ): Promise<string | null> => {
    const sanitizedName = applicantName.replace(/\s+/g, "_").toLowerCase();
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filePath = `cvs/${sanitizedName}_${timestamp}.${ext}`;

    const { error } = await supabase.storage
      .from("career-applications")
      .upload(filePath, file, { upsert: false });

    if (error) {
      console.error("CV upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("career-applications")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // ── Insert application into Supabase + send mailto ────────────────────────
  const submitApplication = async (
    formData: {
      full_name: string;
      email: string;
      phone?: string;
      preferred_role?: string;
      cv_file: File | null;
    },
    jobId?: string,
    jobTitle?: string,
  ) => {
    setUploading(true);

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

    const { error } = await supabase
      .from("career_applications")
      .insert([payload]);

    if (error) {
      console.error("Submission error:", error.message);
      setUploading(false);
      alert("Something went wrong. Please try again.");
      return false;
    }

    // ── Trigger mailto to infofixcomputers1@gmail.com ────────────────────
    const subject = encodeURIComponent(
      `New Job Application: ${jobTitle || formData.preferred_role || "General"} — ${formData.full_name}`,
    );
    const body = encodeURIComponent(
      `New application received via Infofix Computers Careers Page.\n\n` +
        `Name: ${formData.full_name}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone || "N/A"}\n` +
        `Applied For: ${jobTitle || formData.preferred_role || "General Application"}\n` +
        `CV Link: ${cvUrl || "Not uploaded"}\n\n` +
        `-- Infofix Computers Careers System`,
    );

    window.location.href = `mailto:infofixcomputers1@gmail.com?subject=${subject}&body=${body}`;

    setUploading(false);
    return true;
  };

  // ── General Form Submit ───────────────────────────────────────────────────
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submitApplication(generalForm);
    if (ok) {
      setSubmitted(true);
      setGeneralForm({
        full_name: "",
        email: "",
        phone: "",
        preferred_role: "",
        cv_file: null,
      });
    }
  };

  // ── Modal Form Submit ─────────────────────────────────────────────────────
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    const ok = await submitApplication(
      applyForm,
      selectedJob.id,
      selectedJob.title,
    );
    if (ok) {
      setModalSubmitted(true);
      setTimeout(() => {
        setSelectedJob(null);
        setModalSubmitted(false);
        setApplyForm({ full_name: "", email: "", phone: "", cv_file: null });
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-5xl font-black bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Careers at Infofix Computers
          </h1>
          <p className="text-gray-500 mt-6 text-lg max-w-2xl mx-auto">
            Join our growing team and build your future with Infofix Computers.
          </p>
        </div>

        {/* ── JOB LISTINGS ─────────────────────────────────────────────────── */}
        <div className="mb-24">
          <h2 className="text-2xl font-black text-gray-900 mb-8">
            Current Openings
          </h2>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              Loading openings…
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all bg-gray-50 hover:bg-white"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-indigo-600 font-semibold mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} /> {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {job.location}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-3 max-w-2xl">
                        {job.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-6 py-3 rounded-xl bg-indigo-600 text-white cursor-pointer font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-10 text-center">
              <h3 className="text-xl font-bold text-gray-900">
                No Current Openings
              </h3>
              <p className="text-gray-500 mt-3">
                There are no open positions right now. Submit your CV below for
                future opportunities.
              </p>
            </div>
          )}
        </div>

        {/* ── GENERAL CV FORM ───────────────────────────────────────────────── */}
        <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Submit Your CV (Future Opportunities)
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center py-10 gap-4 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <h3 className="text-xl font-bold text-gray-900">
                Application Submitted!
              </h3>
              <p className="text-gray-500 text-sm">
                We've received your details and will be in touch soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 px-5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleGeneralSubmit}
              className="grid md:grid-cols-2 gap-6"
            >
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.full_name}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={generalForm.email}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, email: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Phone</label>
                <input
                  type="tel"
                  value={generalForm.phone}
                  onChange={(e) =>
                    setGeneralForm({ ...generalForm, phone: e.target.value })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">
                  Preferred Role
                </label>
                <input
                  type="text"
                  placeholder="Sales / HR / Technician / etc"
                  value={generalForm.preferred_role}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      preferred_role: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-600">
                  Upload CV *
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-white cursor-pointer hover:border-indigo-400 transition-all text-sm text-gray-500">
                    <Upload size={16} className="text-indigo-500" />
                    {generalForm.cv_file
                      ? generalForm.cv_file.name
                      : "Click to upload PDF / DOC / DOCX"}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                      className="hidden"
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          cv_file: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? "Submitting…" : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── APPLY MODAL ────────────────────────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 relative">
            <button
              onClick={() => {
                setSelectedJob(null);
                setModalSubmitted(false);
              }}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500"
            >
              <X />
            </button>

            {modalSubmitted ? (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <CheckCircle size={48} className="text-green-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  Application Submitted!
                </h3>
                <p className="text-gray-500 text-sm">
                  Thank you for applying for{" "}
                  <strong>{selectedJob.title}</strong>. We'll be in touch!
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900">
                  Apply for {selectedJob.title}
                </h2>
                <p className="text-sm text-indigo-600 font-semibold mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} /> {selectedJob.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {selectedJob.location}
                  </span>
                </p>

                <form onSubmit={handleApplySubmit} className="space-y-4 mt-6">
                  <div>
                    <label className="text-xs font-bold text-gray-600">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your full name"
                      required
                      value={applyForm.full_name}
                      onChange={(e) =>
                        setApplyForm({
                          ...applyForm,
                          full_name: e.target.value,
                        })
                      }
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={applyForm.email}
                      onChange={(e) =>
                        setApplyForm({ ...applyForm, email: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={applyForm.phone}
                      onChange={(e) =>
                        setApplyForm({ ...applyForm, phone: e.target.value })
                      }
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">
                      Upload CV *
                    </label>
                    <label className="mt-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-indigo-400 transition-all text-sm text-gray-500">
                      <Upload size={16} className="text-indigo-500" />
                      {applyForm.cv_file
                        ? applyForm.cv_file.name
                        : "Click to upload PDF / DOC / DOCX"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                        className="hidden"
                        onChange={(e) =>
                          setApplyForm({
                            ...applyForm,
                            cv_file: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full cursor-pointer py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
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
