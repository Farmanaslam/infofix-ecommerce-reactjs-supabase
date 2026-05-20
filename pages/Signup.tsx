import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Headphones,
  Star,
} from "lucide-react";
import { SECTION_ACCENT } from "@/lib/sectionTheme";
import { Link } from "react-router-dom";
const STEPS = ["Account", "Address", "Confirm"];

// ── OUTSIDE Signup ──────────────────────────────────────────
const Field = ({
  icon: Icon, label, name, type = "text", placeholder,
  required = false, readOnly = false, value, rightEl, onChange, accent,
}: any) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: accent ?? '#6366f1' }}>
        <Icon size={16} />
      </div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
        className={`w-full pl-11 ${rightEl ? "pr-11" : "pr-4"} py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white  outline-none text-sm font-medium transition-all ${readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
        onFocus={e => { e.target.style.borderColor = accent ?? '#6366f1'; e.target.style.boxShadow = `0 0 0 2px ${accent ?? '#6366f1'}22`; }}
        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = ''; }}
      />
      {rightEl && (
        <button
          type="button"
          onClick={rightEl.onClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors"
          onMouseEnter={e => e.currentTarget.style.color = accent ?? '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}        >
          {rightEl.icon}
        </button>
      )}
    </div>
  </div>
);

// ── Signup component starts here ────────────────────────────
export const Signup = () => {
  const { setCurrentUser, setCurrentPage, selectedStoreSection } = useStore();
  const theme = SECTION_ACCENT[selectedStoreSection];
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    acceptTerms: false,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const validateStep0 = () => {
    if (!formData.fullName.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!formData.phone.trim()) return "Please enter your phone number";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return "";
  };

  const validateStep1 = () => {
    if (!formData.address1.trim()) return "Please enter your address";
    if (!formData.city.trim()) return "Please enter your city";
    if (!formData.state.trim()) return "Please enter your state";
    if (!formData.pincode.trim()) return "Please enter your pincode";
    return "";
  };

  const handleNext = () => {
    if (step === 0) {
      const err = validateStep0();
      if (err) return setError(err);
    }
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms)
      return setError("Please accept Terms & Conditions");

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("customers").insert({
      id: user.id,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address1: formData.address1,
      address2: formData.address2,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: formData.country,
      role: "CUSTOMER",
    });

    setLoading(false);
    if (profileError) return setError(profileError.message);

    setCurrentUser({
      id: user.id,
      name: formData.fullName,
      email: formData.email,
      role: "CUSTOMER",
      avatar: `https://i.pravatar.cc/150?u=${user.id}`,
    });

    const redirect = localStorage.getItem("pendingRedirect") as any ?? "home";
    localStorage.removeItem("pendingRedirect");
    setCurrentPage(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-6 md:py-24 app-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-24 items-center text-center lg:text-left">
        {/* LEFT SIDE — matches Login exactly */}
        <div className="space-y-6 flex flex-col items-center lg:items-start lg:sticky lg:top-32">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            JOIN THE <span style={{ color: theme.accent }}>INFOFIX</span> FAMILY
          </h1>

          <p className="text-gray-500 text-xl font-medium leading-relaxed">
            Create your account and get access to exclusive deals, order
            tracking, and expert technical support.
          </p>

          <div className="p-8 rounded-4xl space-y-4" style={{ background: theme.accentLight }}>
            {[
              { icon: Zap, text: "Fast checkout with saved addresses" },
              { icon: ShieldCheck, text: "Secure payments & order protection" },
              { icon: Headphones, text: "Priority customer support" },
              { icon: Star, text: "Exclusive member-only offers" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl  flex items-center justify-center shrink-0" style={{ background: `${theme.accent}22` }}>
                  <Icon size={15} style={{ color: theme.accent }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: theme.accentText }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm font-semibold" style={{ color: theme.accentText, background: `${theme.accent}14`, padding: "1rem", borderRadius: "1rem" }}>
            Secure authentication powered by modern encryption standards.
          </p>
        </div>

        {/* RIGHT SIDE CARD — matches Login card style */}
        <div className="bg-white border border-gray-100 p-1 md:p-10 rounded-[48px] shadow-2xl shadow-gray-200/50">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div
                    style={i === step ? { background: theme.accent } : i < step ? { background: '#22c55e' } : {}}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < step ? 'text-white' : i === step ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:block ${i === step
                      ? ""
                      : i < step
                        ? "text-green-600"
                        : "text-gray-400"
                      }`}
                    style={i === step ? { color: theme.accent } : {}}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px ${i < step ? "bg-green-400" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <div className="space-y-5 animate-fadein">
              <Field
                icon={User}
                label="Full Name"
                name="fullName"
                placeholder="Krishna Sharma"
                required
                value={formData.fullName}
                onChange={handleChange}
                accent={theme.accent}
              />
              <Field
                icon={Mail}
                label="Email Address"
                name="email"
                type="email"
                placeholder="krishna@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                accent={theme.accent}
              />
              <Field
                icon={Phone}
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                required
                value={formData.phone}
                onChange={handleChange}
                accent={theme.accent}
              />
              <Field
                icon={Lock}
                label="Password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 characters"
                required
                value={formData.password}
                onChange={handleChange}
                rightEl={{
                  icon: showPass ? <EyeOff size={16} /> : <Eye size={16} />,
                  onClick: () => setShowPass(!showPass),
                }}
                accent={theme.accent}
              />
              <Field
                icon={Lock}
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                rightEl={{
                  icon: showConfirm ? <EyeOff size={16} /> : <Eye size={16} />,
                  onClick: () => setShowConfirm(!showConfirm),
                }}
                accent={theme.accent}
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                style={{ background: theme.accent }}
                onMouseEnter={e => e.currentTarget.style.background = theme.accentHover}
                onMouseLeave={e => e.currentTarget.style.background = theme.accent}
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
              <p className="p-2 md:p-0 text-sm text-gray-500 text-center font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold hover:underline"
                  style={{ color: theme.accent }}
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fadein">
              <Field
                icon={MapPin}
                label="Address Line 1"
                name="address1"
                placeholder="House/Flat No., Street"
                required
                value={formData.address1}
                onChange={handleChange}
                accent={theme.accent}
              />
              <Field
                icon={MapPin}
                label="Address Line 2 (Optional)"
                name="address2"
                placeholder="Landmark, Area"
                value={formData.address2}
                onChange={handleChange}
                accent={theme.accent}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  icon={MapPin}
                  label="City"
                  name="city"
                  placeholder="Durgapur"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  accent={theme.accent}
                />
                <Field
                  icon={MapPin}
                  label="State"
                  name="state"
                  placeholder="West Bengal"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  accent={theme.accent}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  icon={MapPin}
                  label="Pincode"
                  name="pincode"
                  placeholder="713213"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  accent={theme.accent}
                />
                <Field
                  icon={MapPin}
                  label="Country"
                  name="country"
                  value={formData.country}
                  readOnly
                  accent={theme.accent}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 py-5 border border-gray-200 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-lg"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                  style={{ background: theme.accent }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accentHover}
                  onMouseLeave={e => e.currentTarget.style.background = theme.accent}
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fadein">
              <div className="rounded-3xl p-6 space-y-3" style={{ background: theme.accentLight }}>
                <p className="text-xs font-black" style={{ color: theme.accent }}>
                  Review Your Details
                </p>
                {[
                  { label: "Name", value: formData.fullName },
                  { label: "Email", value: formData.email },
                  { label: "Phone", value: formData.phone },
                  {
                    label: "Address",
                    value: `${formData.address1}${formData.address2 ? ", " + formData.address2 : ""}`,
                  },
                  {
                    label: "City",
                    value: `${formData.city}, ${formData.state} – ${formData.pincode}`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-gray-400 font-semibold shrink-0 w-16">
                      {label}
                    </span>
                    <span className="text-gray-800 font-medium text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    style={formData.acceptTerms ? { background: theme.accent, borderColor: theme.accent } : {}}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${!formData.acceptTerms ? 'border-gray-300' : ''}`}
                  >
                    {formData.acceptTerms && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium leading-relaxed">
                  I agree to Infofix's{" "}
                  <Link
                    to="/policy"
                    className="font-bold hover:underline"
                    style={{ color: theme.accent }}
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <span className="font-bold" style={{ color: theme.accent }}>
                    Privacy Policy
                  </span>
                </span>
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 border border-gray-200 text-gray-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-lg"
                >
                  <ChevronLeft className="w-5 h-5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 disabled:opacity-60 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                  style={{ background: theme.accent }}
                  onMouseEnter={e => e.currentTarget.style.background = theme.accentHover}
                  onMouseLeave={e => e.currentTarget.style.background = theme.accent}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>{" "}
                      Creating…
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
      @keyframes fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fadein { animation: fadein 0.25s ease-out; }
    `,
        }}
      />
    </div>
  );
};
