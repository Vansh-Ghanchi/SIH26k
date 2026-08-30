import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { users } from "../data/users";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        localStorage.setItem("infrawatch_user", JSON.stringify(found));
        onLogin(found);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8602A] mb-4 shadow-lg">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1C1917]">InfraWatch</h1>
          <p className="text-sm text-[#E8602A] font-medium mt-1">AI Risk Monitoring System</p>
          <p className="text-xs text-[#78716C] mt-2 leading-relaxed">Government Infrastructure Project Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E7E5E4] p-8">
          <h2 className="text-lg font-semibold text-[#1C1917] mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#44403C] mb-1.5">Email / User ID</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@infrawatch.gov.in"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder:text-[#D6D3D1] focus:outline-none focus:border-[#E8602A] focus:ring-2 focus:ring-[#FEF0E7] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#44403C] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#E7E5E4] text-sm text-[#1C1917] placeholder:text-[#D6D3D1] focus:outline-none focus:border-[#E8602A] focus:ring-2 focus:ring-[#FEF0E7] transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D6D3D1] accent-[#E8602A]"
                />
                <span className="text-sm text-[#78716C]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#E8602A] hover:text-[#C45320] font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3.5 bg-[#F5F5F4] rounded-xl">
            <p className="text-xs font-medium text-[#78716C] mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-[#A8A29E]">
              <p><span className="font-medium text-[#78716C]">Officer:</span> officer@infrawatch.gov.in / Officer@123</p>
              <p><span className="font-medium text-[#78716C]">Admin:</span> admin@infrawatch.gov.in / Admin@123</p>
              <p><span className="font-medium text-[#78716C]">Analyst:</span> analyst@infrawatch.gov.in / Analyst@123</p>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-[#A8A29E]">
          <Shield size={12} />
          <span>Secure Government Access · 256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
