import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles,
  ArrowRight, ShieldCheck, CheckCircle2, HelpCircle, PhoneCall,
  FileSpreadsheet, LockKeyhole, Building2
} from "lucide-react";
import { users } from "../data/users";
import GovtHeaderBanner from "../components/GovtHeaderBanner";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState("");
  const navigate = useNavigate();

  const handleQuickFill = (demoEmail, demoPw, personaKey) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setActivePersona(personaKey);
    setError("");
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
        setError("Invalid credentials. Please check your official email and password.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col justify-between selection:bg-[#E8602A] selection:text-white font-inter relative overflow-hidden">
      {/* 1. Official Top Government Banner */}
      <GovtHeaderBanner />

      {/* 2. Main Content Section with Subtle Flowing Wave Background */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-14 py-8 lg:py-14 relative">
        
        {/* Subtle Light Blue Vector Waves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />

          <svg
            className="absolute w-full h-full inset-0 opacity-35"
            viewBox="0 0 1440 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M-80 350 C 350 150, 700 650, 1150 280 C 1320 150, 1500 240, 1600 270"
              stroke="url(#waveGradClean1)"
              strokeWidth="32"
              strokeLinecap="round"
            />
            <path
              d="M-40 420 C 380 220, 750 720, 1200 350 C 1360 210, 1540 300, 1640 330"
              stroke="url(#waveGradClean2)"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="waveGradClean1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="waveGradClean2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Clean, Purposeful Split Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10 relative">
          
          {/* Left Column: Official Portal Information & Login Relevance */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Division Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-sky-200 text-xs font-bold text-[#E8602A] shadow-2xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#E8602A] animate-pulse" />
              <span>Government of India · MoSPI · Central IPMD</span>
            </div>

            {/* Portal Title & Clear Purpose */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0F172A] leading-tight">
                DRISHTI <span className="text-[#E8602A]">AI 2.0</span>
              </h1>
              <p className="text-base sm:text-lg font-bold text-[#334155] mt-2">
                Central Sector Infrastructure Projects Monitoring Platform
              </p>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mt-2.5 max-w-lg">
                Secure access gateway for Central Ministries, Implementing Agencies, and Nodal Review Officers to monitor and audit projects costing ₹150 Crore & above.
              </p>
            </div>

            {/* Relevant Portal Guidelines & Access Notice */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] shadow-xs">
                <div className="p-2 rounded-xl bg-[#FEF0E7] text-[#E8602A] shrink-0 mt-0.5">
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-xs">Monthly CUF Progress Submission</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    Authorized agency officers are required to submit monthly physical progress and expenditure updates before the monthly cutoff.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E2E8F0] shadow-xs">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                  <LockKeyhole size={16} />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A] text-xs">Role-Based Access Governance</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                    Access is strictly permissioned for Government Officers, Nodal Reviewers, and Ministry Administrators.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Ultra-Refined Sign-In Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgb(14,116,144,0.08)] border border-[#E2E8F0] p-7 sm:p-8 relative">
              
              {/* Card Header */}
              <div className="mb-5 pb-4 border-b border-[#F1F5F9]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Official Portal Access</h2>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" /> 256-Bit SSL
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">Sign in with official credentials or choose a demo persona</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">Official Email / User ID</label>
                  <div className="relative group">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E8602A] transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setActivePersona("");
                      }}
                      placeholder="officer@infrawatch.gov.in"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#E8602A] focus:ring-2 focus:ring-[#FEF0E7] bg-[#F8FAFC] font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1.5">Security Password</label>
                  <div className="relative group">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#E8602A] transition-colors" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        setActivePersona("");
                      }}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#E8602A] focus:ring-2 focus:ring-[#FEF0E7] bg-[#F8FAFC] font-medium transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] cursor-pointer transition-colors">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#64748B] select-none hover:text-[#334155]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={e => setRemember(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#CBD5E1] accent-[#E8602A] cursor-pointer"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-[#E8602A] hover:underline font-semibold cursor-pointer">
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
                  className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-[#E8602A] text-white font-bold text-xs transition-all duration-200 disabled:opacity-60 shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2 group"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying Security Token...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to DRISHTI Portal</span>
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* 3-Role Demo Personas Selector */}
              <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#E8602A]" />
                    <p className="text-xs font-bold text-[#0F172A]">Select Demo Persona (1-Click Fill):</p>
                  </div>
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">SIH Mode</span>
                </div>

                <div className="space-y-2">
                  {/* Persona 1: Government Officer */}
                  <button
                    type="button"
                    onClick={() => handleQuickFill("officer@infrawatch.gov.in", "Officer@123", "officer")}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activePersona === "officer"
                        ? "bg-[#FEF0E7]/80 border-[#E8602A] shadow-xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#E8602A] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                        👮‍♂️
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] text-xs truncate">Government Officer</p>
                        <p className="text-[10px] text-[#64748B] truncate">Project Monitoring & Executive Notices</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0 ml-2 font-mono">
                      officer@...
                    </span>
                  </button>

                  {/* Persona 2: Reviewer Officer */}
                  <button
                    type="button"
                    onClick={() => handleQuickFill("reviewer@infrawatch.gov.in", "Reviewer@123", "reviewer")}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activePersona === "reviewer"
                        ? "bg-[#FEF0E7]/80 border-[#E8602A] shadow-xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#E8602A] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                        📋
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] text-xs truncate">Reviewer / Monitoring Officer</p>
                        <p className="text-[10px] text-[#64748B] truncate">Pending Registrations & CUF Diff Audit</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0 ml-2 font-mono">
                      reviewer@...
                    </span>
                  </button>

                  {/* Persona 3: Project Administrator */}
                  <button
                    type="button"
                    onClick={() => handleQuickFill("admin@infrawatch.gov.in", "Admin@123", "admin")}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activePersona === "admin"
                        ? "bg-[#FEF0E7]/80 border-[#E8602A] shadow-xs"
                        : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#E8602A] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-bold shrink-0">
                        🛡️
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0F172A] text-xs truncate">Project Administrator (Admin)</p>
                        <p className="text-[10px] text-[#64748B] truncate">System Access & Ministry Ingestion</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md shrink-0 ml-2 font-mono">
                      admin@...
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. Clean Copyright Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] px-4 md:px-8 py-3 text-[11px] text-[#64748B] text-center z-10 relative">
        <span>© 2026 Ministry of Statistics and Programme Implementation (MoSPI) · Government of India</span>
      </footer>
    </div>
  );
}
