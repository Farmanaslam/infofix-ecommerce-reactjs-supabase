import React, { useEffect, useState } from "react";
import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  Shield,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { supabase } from "../lib/supabaseClient";
import { Customer, ProfileForm, AddressForm, RecentOrder } from "../types";

const emptyAddressForm: AddressForm = {
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    Delivered: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      className: "text-green-600 bg-green-50 border-green-200",
    },
    Shipped: {
      icon: <Truck className="w-3.5 h-3.5" />,
      className: "text-blue-600 bg-blue-50 border-blue-200",
    },
    "Out for Delivery": {
      icon: <Truck className="w-3.5 h-3.5" />,
      className: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    Processing: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: "text-yellow-600 bg-yellow-50 border-yellow-200",
    },
    Cancelled: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      className: "text-red-600 bg-red-50 border-red-200",
    },
  };
  const cfg = map[status] ?? {
    icon: <Package className="w-3.5 h-3.5" />,
    className: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.className}`}
    >
      {cfg.icon} {status}
    </span>
  );
};

export const Profile: React.FC = () => {
  const { setCurrentPage, logout, setLoading, loading } = useStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone: "",
  });

  // Address editing
  const [editingAddress, setEditingAddress] = useState<
    "address1" | "address2" | null
  >(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);
  const [addingNew, setAddingNew] = useState(false);

  // Fetch customer + recent orders on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setProfileError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setProfileError("Not authenticated.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) {
        setProfileError("Failed to load profile.");
      } else if (!data) {
        setProfileError("No profile found for this account.");
      } else {
        setCustomer(data as Customer);
      }

      // Fetch recent orders (last 3)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, items")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (ordersData) setRecentOrders(ordersData as RecentOrder[]);

      setLoading(false);
    };

    fetchData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const formatAddress = (
    line1: string,
    city: string,
    state: string,
    pincode: string,
    country: string,
  ) => `${line1}\n${city} – ${pincode}\n${state}, ${country}`;

  // ── PROFILE EDITING ────────────────────────────────────────────────────────
  const handleEditProfile = () => {
    if (!customer) return;
    setProfileForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    setSaving(true);
    setError(null);
    const { data, error: updateError } = await supabase
      .from("customers")
      .update({
        full_name: profileForm.full_name,
        email: profileForm.email,
        phone: profileForm.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customer.id)
      .select()
      .maybeSingle();
    if (updateError) setError("Failed to save profile.");
    else if (data) {
      setCustomer(data as Customer);
      setEditingProfile(false);
      showSuccess("Profile updated successfully!");
    }
    setSaving(false);
  };

  // ── ADDRESS EDITING ────────────────────────────────────────────────────────
  const handleEditAddress1 = () => {
    if (!customer) return;
    setAddressForm({
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      country: customer.country,
    });
    setEditingAddress("address1");
    setAddingNew(false);
  };

  const handleEditAddress2 = () => {
    if (!customer) return;
    setAddressForm({
      address1: customer.address1,
      address2: customer.address2,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      country: customer.country,
    });
    setEditingAddress("address2");
    setAddingNew(false);
  };

  const handleAddNew = () => {
    setAddressForm({ ...emptyAddressForm });
    setEditingAddress("address2");
    setAddingNew(true);
  };

  const handleSaveAddress = async () => {
    if (!customer) return;
    setSaving(true);
    setError(null);
    const updatePayload =
      editingAddress === "address1"
        ? {
            address1: addressForm.address1,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
            country: addressForm.country,
            updated_at: new Date().toISOString(),
          }
        : {
            address2: addressForm.address2,
            updated_at: new Date().toISOString(),
          };
    const { data, error: updateError } = await supabase
      .from("customers")
      .update(updatePayload)
      .eq("id", customer.id)
      .select()
      .maybeSingle();
    if (updateError) setError("Failed to save address.");
    else if (data) {
      setCustomer(data as Customer);
      showSuccess(addingNew ? "New address added!" : "Address updated!");
    }
    setSaving(false);
    setEditingAddress(null);
    setAddingNew(false);
  };

  const handleRemoveAddress2 = async () => {
    if (!customer) return;
    const confirmed = window.confirm("Remove this address?");
    if (!confirmed) return;
    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("customers")
      .update({ address2: "", updated_at: new Date().toISOString() })
      .eq("id", customer.id)
      .select()
      .maybeSingle();
    if (updateError) setError("Failed to remove address.");
    else if (data) {
      setCustomer(data as Customer);
      showSuccess("Address removed.");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setEditingAddress(null);
    setAddingNew(false);
  };

  const hasAddress2 = Boolean(customer?.address2?.trim());

  if (loading) return null;

  if (profileError || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 font-medium">
          {profileError || "Profile not found."}
        </p>
      </div>
    );
  }

  const joinDate = new Date(customer.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-indigo-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800";
  const inputCls2 =
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800";

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

        {/* BANNERS */}
        {successMsg && (
          <div className="mb-6 px-5 py-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-6 px-5 py-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* ── PROFILE OVERVIEW ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Profile Overview</h2>
            {!editingProfile && (
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition cursor-pointer text-sm"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input
                      className={`${inputCls} pl-10`}
                      placeholder="Full Name"
                      value={profileForm.full_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          full_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input
                      className={`${inputCls} pl-10`}
                      placeholder="Email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                    <input
                      className={`${inputCls} pl-10`}
                      placeholder="Phone"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Member Since
                  </label>
                  <div className="px-5 py-3 bg-gray-50 rounded-xl font-semibold text-gray-400 border border-gray-100 text-sm">
                    {joinDate} — not editable
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}{" "}
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Full Name
                </label>
                <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-800">
                    {customer.full_name}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 rounded-2xl">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-gray-800">
                    {customer.email}
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
                    +{customer.phone}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Member Since
                </label>
                <div className="px-5 py-4 bg-gray-50 rounded-2xl font-semibold text-gray-800">
                  {joinDate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── ADDRESS MANAGEMENT ───────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <h2 className="text-2xl font-black mb-6">Saved Addresses</h2>

          {/* ADDRESS 1 */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Primary Address
            </p>
            {editingAddress === "address1" ? (
              <div className="bg-indigo-50 p-6 rounded-2xl space-y-4">
                <input
                  className={inputCls}
                  placeholder="Address Line"
                  value={addressForm.address1}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address1: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className={inputCls}
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                  />
                  <input
                    className={inputCls}
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{" "}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50 p-6 rounded-2xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-indigo-600 mt-1 shrink-0" />
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {formatAddress(
                      customer.address1,
                      customer.city,
                      customer.state,
                      customer.pincode,
                      customer.country,
                    )}
                  </p>
                </div>
                <button
                  onClick={handleEditAddress1}
                  className="flex items-center gap-1 text-indigo-600 font-semibold hover:underline cursor-pointer shrink-0"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              </div>
            )}
          </div>

          {/* ADDRESS 2 */}
          {hasAddress2 && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Secondary Address
              </p>
              {editingAddress === "address2" && !addingNew ? (
                <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-200">
                  <input
                    className={inputCls2}
                    placeholder="Address Line 2"
                    value={addressForm.address2}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address2: e.target.value,
                      })
                    }
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveAddress}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}{" "}
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl flex items-start justify-between gap-4 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-gray-500 mt-1 shrink-0" />
                    <p className="text-gray-600">{customer.address2}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={handleEditAddress2}
                      className="flex items-center gap-1 text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={handleRemoveAddress2}
                      disabled={saving}
                      className="flex items-center gap-1 text-red-500 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD NEW form */}
          {addingNew && editingAddress === "address2" && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                New Secondary Address
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-dashed border-indigo-300">
                <input
                  className={inputCls2}
                  placeholder="Address Line 2"
                  value={addressForm.address2}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address2: e.target.value })
                  }
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving || !addressForm.address2.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{" "}
                    Save Address
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-semibold hover:bg-gray-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADD NEW button */}
          {!addingNew && editingAddress !== "address2" && (
            <button
              onClick={handleAddNew}
              disabled={hasAddress2}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition ${hasAddress2 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"}`}
              title={hasAddress2 ? "Maximum of 2 addresses allowed" : ""}
            >
              <Plus className="w-4 h-4" /> Add New Address{" "}
              {hasAddress2 && (
                <span className="text-xs ml-1">(limit reached)</span>
              )}
            </button>
          )}
        </div>

        {/* ── RECENT ORDERS ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Recent Orders</h2>
            <button
              onClick={() => setCurrentPage("orders")}
              className="text-indigo-600 font-bold hover:underline cursor-pointer text-sm"
            >
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-gray-800 font-bold text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-1 mb-6">
                Your order history will appear here once you make a purchase.
              </p>
              <button
                onClick={() => setCurrentPage("shop")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-500 transition cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* First item image */}
                    {order.items?.[0]?.image ? (
                      <img
                        src={order.items[0].image}
                        alt={order.items[0].name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""} ·{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <p className="font-black text-indigo-600 text-sm whitespace-nowrap">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => setCurrentPage("orders")}
                      className="text-xs text-indigo-600 font-bold hover:underline shrink-0"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ACCOUNT SECURITY ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-gray-100 p-10">
          <h2 className="text-2xl font-black mb-6">Account Security</h2>
          <div className="flex items-center gap-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <button
              onClick={() => {
                const confirmLogout = window.confirm(
                  "Are you sure you want to logout from all devices?",
                );
                if (confirmLogout) {
                  logout();
                  setCurrentPage("home");
                }
              }}
              className="font-semibold text-red-600 hover:text-red-500 transition cursor-pointer"
            >
              Logout from All Devices
            </button>
          </div>
          <div className="mt-6 bg-indigo-50 p-4 rounded-xl text-sm text-indigo-900 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            For your safety, always use a strong password and avoid sharing your
            login details.
          </div>
        </div>
      </div>
    </div>
  );
};
