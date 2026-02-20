import React, { useState } from "react";
import { X } from "lucide-react";

export const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // 👉 You can later fetch this from Supabase
  const jobs = [
    {
      title: "Sales Executive",
      type: "Full Time",
      location: "Durgapur",
      description:
        "Handle walk-in customers, generate leads and achieve sales targets.",
    },
    {
      title: "Data Entry Operator",
      type: "Full Time",
      location: "Durgapur",
      description: "Maintain records, billing entries and manage Excel sheets.",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* HERO */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-black bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Careers at Infofix Computers
          </h1>
          <p className="text-gray-500 mt-6 text-lg max-w-2xl mx-auto">
            Join our growing team and build your future with Infofix Computers.
          </p>
        </div>

        {/* JOB SECTION */}
        <div className="mb-24">
          <h2 className="text-2xl font-black text-gray-900 mb-8">
            Current Openings
          </h2>

          {jobs.length > 0 ? (
            <div className="space-y-6">
              {jobs.map((job, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all bg-gray-50 hover:bg-white"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>

                      <p className="text-sm text-indigo-600 font-semibold mt-1">
                        {job.type} • {job.location}
                      </p>

                      <p className="text-sm text-gray-600 mt-3 max-w-2xl">
                        {job.description}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
              <h3 className="text-xl font-bold text-gray-900">
                No Current Openings
              </h3>
              <p className="text-gray-500 mt-3">
                There are currently no open positions. Please check back later
                or submit your CV for future opportunities below.
              </p>
            </div>
          )}
        </div>

        {/* GENERAL APPLICATION FORM */}
        <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Submit Your CV (Future Opportunities)
          </h2>

          <form className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600">Email</label>
              <input
                type="email"
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600">Phone</label>
              <input
                type="tel"
                required
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
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600">
                Upload CV
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                required
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* APPLY MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 relative">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500"
            >
              <X />
            </button>

            <h2 className="text-2xl font-black text-gray-900">
              Apply for {selectedJob.title}
            </h2>

            <form className="space-y-4 mt-6">
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="file"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
