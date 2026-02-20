import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import {
  Settings as SettingsIcon,
  User,
  Store,
  Bell,
  Shield,
  Globe,
  Cpu,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Database,
  Cloud,
  ChevronRight,
  MoreVertical,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  X,
  Clock,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";
import { OPERATORS } from "../constants";
import { Branch } from "../types";

export const Settings: React.FC = () => {
  const { currentUser, branches, addBranch, updateBranch, deleteBranch } =
    useStore();
  const [activeTab, setActiveTab] = useState<
    "General" | "Security" | "AI" | "Staff" | "Branches"
  >("General");
  const [isSaving, setIsSaving] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [branchFormData, setBranchFormData] = useState<Partial<Branch>>({
    title: "",
    address: "",
    city: "Durgapur",
    hours: "11:00 AM - 8:30 PM",
    days: "Monday - Sunday",
    phone: "",
    mapsUrl: "",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2070",
    details: "",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const handleOpenBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchFormData(branch);
    } else {
      setEditingBranch(null);
      setBranchFormData({
        title: "",
        address: "",
        city: "Durgapur",
        hours: "11:00 AM - 8:30 PM",
        days: "Monday - Sunday",
        phone: "",
        mapsUrl: "",
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2070",
        details: "",
      });
    }
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch({ ...editingBranch, ...branchFormData } as Branch);
    } else {
      addBranch({
        ...branchFormData,
        id: `br-${Date.now()}`,
      } as Branch);
    }
    setIsBranchModalOpen(false);
  };

  const menuItems = [
    { id: "General", icon: Store, label: "Store Profile" },
    { id: "Branches", icon: MapPin, label: "Our Branches" },
    { id: "AI", icon: Cpu, label: "AI Intelligence" },
    { id: "Staff", icon: User, label: "Staff Management" },
    { id: "Security", icon: Shield, label: "Security & Access" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
            System Settings
          </h2>
          <p className="text-gray-500 font-medium">
            Configure global parameters and administrative permissions.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? "Synchronizing..." : "Save Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all group ${
                activeTab === item.id
                  ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`}
              />
              {item.label}
              {activeTab === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === "General" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-8">
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Public Business Identity
                    </h3>
                    <p className="text-sm text-gray-400">
                      This information will be displayed across the customer
                      storefront.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Legal Trading Name
                    </label>
                    <input
                      type="text"
                      defaultValue="INFOFIX COMPUTER"
                      className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Support Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="infofixcomputers1@gmail.com"
                      className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Main Office Address
                    </label>
                    <textarea
                      rows={2}
                      defaultValue="Ananda Gopal Mukherjee Sarani Rd, near BINA GAS, Kamalpur Plot, Benacity, Durgapur, West Bengal 713213"
                      className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Customer Helpline
                    </label>
                    <input
                      type="text"
                      defaultValue="+91 8293295257"
                      className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Currency Unit
                    </label>
                    <select className="w-full bg-gray-50 border-none rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium cursor-pointer">
                      <option>INR (₹) - Indian Rupee</option>
                      <option>USD ($) - US Dollar</option>
                      <option>EUR (€) - Euro</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Branches" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Regional Branch Network</h3>
                  <p className="text-sm text-gray-400">
                    Manage physical store locations and contact points.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenBranchModal()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Branch
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <img
                        src={branch.image}
                        alt=""
                        className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {branch.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {branch.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {branch.hours}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenBranchModal(branch)}
                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteBranch(branch.id)}
                        className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "AI" && (
            <div className="space-y-6">
              <div className="bg-indigo-900 p-10 rounded-[40px] text-white relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <RefreshCw className="w-3 h-3" /> Core System Online
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter">
                    Gemini Intelligence Hub
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md">
                      <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">
                        Active Model
                      </p>
                      <p className="text-lg font-bold">
                        gemini-3-flash-preview
                      </p>
                    </div>
                    <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md">
                      <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">
                        API Status
                      </p>
                      <div className="flex items-center gap-2 text-green-400 font-bold">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                        Authorized
                      </div>
                    </div>
                  </div>
                </div>
                <Cpu className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-lg mb-2">Auto-Descriptions</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Automatically generate high-converting copy for new
                    inventory items.
                  </p>
                  <button className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                    <ToggleRight className="w-8 h-8" /> Active
                  </button>
                </div>
                <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-lg mb-2">Smart Insights</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    Receive daily AI recommendations on restocks and sales
                    trends.
                  </p>
                  <button className="flex items-center gap-2 text-gray-300 font-black text-xs uppercase tracking-widest">
                    <ToggleLeft className="w-8 h-8" /> Disabled
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Staff" && (
            <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Administrative Staff</h3>
                  <p className="text-sm text-gray-400">
                    Manage portal access for your team members.
                  </p>
                </div>
                <button className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                  Invite Member
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {OPERATORS.map((op) => (
                  <div
                    key={op.id}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={op.avatar}
                        className="w-12 h-12 rounded-2xl object-cover border-2 shadow-sm"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{op.name}</p>
                        <p className="text-xs text-gray-400">
                          Member since 2024
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            op.role === "MANAGER"
                              ? "bg-purple-100 text-purple-600"
                              : op.role === "INVENTORY"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {op.role}
                        </span>
                        <p className="text-[10px] font-bold text-green-500 mt-1 uppercase">
                          Logged In
                        </p>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-6">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xl">Access Credentials</h4>
                <div className="space-y-4">
                  <button className="w-full bg-gray-50 hover:bg-gray-100 py-3 rounded-xl font-bold text-sm text-gray-600 transition-all">
                    Reset Root Password
                  </button>
                  <button className="w-full bg-gray-50 hover:bg-gray-100 py-3 rounded-xl font-bold text-sm text-gray-600 transition-all">
                    Enable Two-Factor (2FA)
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-6">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xl">Data Continuity</h4>
                <div className="space-y-4">
                  <button className="w-full bg-gray-50 hover:bg-gray-100 py-3 rounded-xl font-bold text-sm text-gray-600 transition-all flex items-center justify-center gap-2">
                    <Cloud className="w-4 h-4" /> Download Database Export
                  </button>
                  <button className="w-full bg-red-50 hover:bg-red-100 py-3 rounded-xl font-bold text-sm text-red-600 transition-all">
                    Wipe Temporary Cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BRANCH MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-8 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {editingBranch ? "Edit Branch" : "Add New Branch"}
                </h3>
                <p className="text-sm text-gray-500">
                  Configure regional storefront details.
                </p>
              </div>
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleBranchSubmit}
              className="p-8 space-y-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Branch Title
                  </label>
                  <input
                    required
                    type="text"
                    value={branchFormData.title}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="e.g. Asansol Central"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    City
                  </label>
                  <input
                    required
                    type="text"
                    value={branchFormData.city}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        city: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="e.g. Durgapur"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Full Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={branchFormData.address}
                  onChange={(e) =>
                    setBranchFormData({
                      ...branchFormData,
                      address: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none"
                  placeholder="Complete physical address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Operating Days
                  </label>
                  <input
                    required
                    type="text"
                    value={branchFormData.days}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        days: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="e.g. Monday - Sunday"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Operating Hours
                  </label>
                  <input
                    required
                    type="text"
                    value={branchFormData.hours}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        hours: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="e.g. 10:00 AM - 9:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Phone Number
                  </label>
                  <input
                    required
                    type="tel"
                    value={branchFormData.phone}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="+91..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Google Maps URL
                  </label>
                  <input
                    required
                    type="url"
                    value={branchFormData.mapsUrl}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        mapsUrl: e.target.value,
                      })
                    }
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                    placeholder="https://google.com/maps/..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Branch Image URL
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={branchFormData.image}
                    onChange={(e) =>
                      setBranchFormData({
                        ...branchFormData,
                        image: e.target.value,
                      })
                    }
                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  />
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border">
                    <img
                      src={branchFormData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={branchFormData.details}
                  onChange={(e) =>
                    setBranchFormData({
                      ...branchFormData,
                      details: e.target.value,
                    })
                  }
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-600 font-medium resize-none"
                  placeholder="Specialities or notes about this location..."
                />
              </div>

              <div className="flex gap-4 pt-4 pb-4">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                >
                  {editingBranch ? "Update Location" : "Confirm Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
