import React from "react";
import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  Shield,
  Lock,
  LogOut,
  Plus,
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export const Profile: React.FC = () => {
  const { setCurrentPage } = useStore();

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* PAGE HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-linear-to-br from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              My Account
            </span>
          </h1>
          <p className="text-gray-500 mt-3 font-medium text-lg">
            Manage your personal information, addresses, and shopping activity
            in one place.
          </p>
        </div>

        {/* PROFILE OVERVIEW */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <h2 className="text-2xl font-black mb-8">Profile Overview</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Full Name
              </label>
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl">
                <UserIcon className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">John Doe</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">
                  johndoe@email.com
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Phone Number
              </label>
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl">
                <Phone className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-gray-800">
                  +91 9876543210
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Member Since
              </label>
              <div className="px-5 py-4 bg-gray-50 rounded-2xl font-semibold text-gray-800">
                January 2025
              </div>
            </div>
          </div>

          <button className="mt-8 px-8 py-3 cursor-pointer bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100">
            Edit Profile
          </button>
        </div>

        {/* ADDRESS MANAGEMENT */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <h2 className="text-2xl font-black mb-6">Saved Addresses</h2>

          <div className="bg-indigo-50 p-6 rounded-2xl flex items-start gap-4">
            <MapPin className="w-6 h-6 text-indigo-600 mt-1" />
            <div>
              <p className="font-bold text-indigo-900">
                Default Shipping Address
              </p>
              <p className="text-gray-600 mt-1">
                123 Main Road, Benachity
                <br />
                Durgapur – 713213
                <br />
                West Bengal, India
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6 flex-wrap">
            <button className="flex items-center gap-2 px-6 py-3 cursor-pointer bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition">
              <Plus className="w-4 h-4" />
              Add New Address
            </button>

            <button className="px-6 py-3 bg-gray-100 rounded-2xl cursor-pointer font-semibold hover:bg-gray-200 transition">
              Edit Address
            </button>

            <button className="px-6 py-3 bg-red-50 text-red-600 cursor-pointer rounded-2xl font-semibold hover:bg-red-100 transition">
              Remove Address
            </button>
          </div>
        </div>

        {/* RECENT ORDERS PREVIEW */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <h2 className="text-2xl font-black mb-6">Recent Orders</h2>

          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <Package className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-gray-800">Order #INF12345</p>
                <p className="text-sm text-gray-500">
                  Delivered on 12 Feb 2026
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage("orders")}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              View All Orders
            </button>
          </div>
        </div>

        {/* ACCOUNT SECURITY */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10">
          <h2 className="text-2xl font-black mb-6">Account Security</h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-indigo-600" />
              <button className="font-semibold hover:text-indigo-600 transition cursor-pointer">
                Change Password
              </button>
            </div>

            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-red-500" />
              <button className="font-semibold text-red-600 hover:text-red-500 transition cursor-pointer">
                Logout from All Devices
              </button>
            </div>
          </div>

          <div className="mt-6 bg-indigo-50 p-4 rounded-xl text-sm text-indigo-900 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5" />
            For your safety, always use a strong password and avoid sharing your
            login details.
          </div>
        </div>
      </div>
    </div>
  );
};
