import React from "react";
import { UserIcon, Mail, Phone } from "lucide-react";

export const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-500 font-medium">
            Manage your personal information and account details.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Full Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">John Doe</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">
                  johndoe@email.com
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Phone Number
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <Phone className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">
                  +91 9876543210
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 cursor-pointer">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
