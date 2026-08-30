import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { users } from "../data/users";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickFill = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        localStorage.setItem("infrawatch_user", JSON.stringify(found));
        onLogin(found);

        // 3-Role Direct Redirection
        if (found.role === "Reviewer / Monitoring Officer") {
          navigate("/reviewer-dashboard");
        } else if (found.role === "Project Administrator") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Government Emblem & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8602A] mb-3 shadow-lg">
            <Shield size={26} className="text-white" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-[11px] font-bold text-[#E8602A] tracking-wider uppercase bg-[#FEF0E7] px-2.5 py-0.5 rounded-full border border-[#FDDFCC]">
              Government of India · MoSPI
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1C1917] tracking-tight">PAIMANA 2.0 AI</h1>
          <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
            Central Sector Infrastructure Projects Predictive Monitoring Platform (₹150 Cr+)
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E7E5E4] p-7">
          <h2 className="text-base font-bold text-[#1C1917] mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">Official Email / User ID</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@infrawatch.gov.in"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] text-xs text-[#1C1917] placeholder:text-[#D6D3D1] focus:outline-none focus:border-[#E8602A] bg-[#FAF7F4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E7E5E4] text-xs text-[#1C1917] placeholder:text-[#D6D3D1] focus:outline-none focus:border-[#E8602A] bg-[#FAF7F4]"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#78716C]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#D6D3D1] accent-[#E8602A]"
                />
                Remember me
              </label>
              <button type="button" className="text-[#E8602A] hover:underline font-semibold">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold text-xs transition-all duration-200 disabled:opacity-60 shadow-xs cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Security Token...
                </span>
              ) : "Sign In to Portal"}
            </button>
          </form>

          {/* 3-Role Quick Autofill Tabs */}
          <div className="mt-5 p-3.5 bg-[#F5F5F4] rounded-2xl border border-[#E7E5E4]">
            <div className="flex items-center gap-1 mb-2.5">
              <Sparkles size={13} className="text-[#E8602A]" />
              <p className="text-xs font-bold text-[#1C1917]">Select Demo Role (1-Click Autofill):</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill("officer@infrawatch.gov.in", "Officer@123")}
                className="w-full text-left p-2 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#E8602A] hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#1C1917] text-xs">👮‍♂️ Government Officer</p>
                  <p className="text-[10px] text-[#78716C]">Project Monitoring & Executive Governance</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  officer@...
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("reviewer@infrawatch.gov.in", "Reviewer@123")}
                className="w-full text-left p-2 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#E8602A] hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#1C1917] text-xs">📋 Reviewer / Monitoring Officer</p>
                  <p className="text-[10px] text-[#78716C]">Pending Registrations & CUF Verifications</p>
                </div>
                <span className="text-[10px] text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                  reviewer@...
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("admin@infrawatch.gov.in", "Admin@123")}
                className="w-full text-left p-2 rounded-xl bg-white border border-[#E7E5E4] hover:border-[#E8602A] hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#1C1917] text-xs">🛡️ Project Administrator (Admin)</p>
                  <p className="text-[10px] text-[#78716C]">System, User Access & Ministry Ingestion</p>
                </div>
                <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded-md">
                  admin@...
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-[11px] text-[#A8A29E]">
          <span>Protected under National Critical Information Infrastructure Protection Centre (NCIIPC)</span>
        </div>
      </div>
    </div>
  );
}
