import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen, AlertTriangle, Clock, TrendingUp, IndianRupee,
  ArrowUpRight, Eye, Send, FileCheck, CheckCircle2, ShieldAlert,
  Building2, Sparkles
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import { alerts } from "../data/alerts";
import { riskTrendData, sectorData } from "../data/projects";

const kpis = [
  {
    title: "Total Projects", value: "1,981", subtitle: "Across 17 Ministries",
    icon: FolderOpen, accentColor: "orange", change: "April 2026", changeType: "neutral"
  },
  {
    title: "High Risk Projects", value: "245", subtitle: "Immediate escalation",
    icon: AlertTriangle, accentColor: "red", change: "+18 flagged", changeType: "up"
  },
  {
    title: "Delayed Projects", value: "320", subtitle: "Milestone schedule lag",
    icon: Clock, accentColor: "red", change: "16.2% portfolio", changeType: "up"
  },
  {
    title: "Cost Overrun Projects", value: "180", subtitle: "Exceeding approved cost",
    icon: TrendingUp, accentColor: "red", change: "9.1% portfolio", changeType: "up"
  },
  {
    title: "Portfolio Cost", value: "₹42.78L Cr", subtitle: "Original: ₹37.13L Cr",
    icon: IndianRupee, accentColor: "green", change: "Cumulative Exp: ₹20.36L Cr", changeType: "neutral"
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E7E5E4] rounded-xl shadow-sm p-3 text-xs">
      <p className="font-medium text-[#1C1917] mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const recentAlerts = alerts.slice(0, 4);

  const handleAction = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  return (
    <Layout
      user={user}
      title="Government Project Monitoring Overview"
      subtitle="PAIMANA centralized intelligence portal for Central Sector Infrastructure Projects (₹150 Cr+)."
      showDateRange
      onExport={() => handleAction("Executive Portfolio Summary (April 2026) exported successfully!")}
    >
      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {actionSuccessMsg}
          </span>
          <button onClick={() => setActionSuccessMsg("")} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Top Executive Action Bar */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-4 text-white shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E8602A] rounded-xl text-white">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Executive Officer Actions (MoSPI Division)</h3>
            <p className="text-xs text-stone-400">245 Critical projects require immediate departmental intervention notices.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleAction("Emergency Ministry Escalation Notices dispatched to NHAI and RVNL!")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E8602A] hover:bg-[#C45320] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Send size={13} /> Issue Escalation Notice
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-700 hover:bg-stone-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <FileCheck size={13} /> MPR April 2026
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {kpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 72 : i === 1 ? 45 : i === 2 ? 52 : i === 3 ? 38 : 88}
                color={i === 0 ? "accent" : i === 4 ? "success" : "danger"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "72.5% On-track" : i === 1 ? "12.4% portfolio" : i === 2 ? "16.2% portfolio" : i === 3 ? "9.1% portfolio" : "Across 22 Sectors"}
              </p>
            </div>
          </StatCard>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Risk Trend */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Portfolio Risk Trajectory</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Historical 6-month trends across Central Sector Projects</p>
            </div>
            <select className="text-xs text-[#78716C] bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 outline-none">
              <option>Last 6M</option>
              <option>Last 3M</option>
              <option>Last 1Y</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Line type="monotone" dataKey="High" stroke="#DC2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Medium" stroke="#D97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Low" stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sector breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Major Sector Health</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Delayed vs Total Monitored Projects</p>
            </div>
            <button onClick={() => navigate("/analytics")} className="text-xs text-[#E8602A] font-semibold hover:underline">
              View Radar →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
              <XAxis dataKey="sector" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar dataKey="projects" name="Total Projects" fill="#E7E5E4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed Projects" fill="#E8602A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Project Status & Urgent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Status Distribution */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-[#1C1917] mb-3">Portfolio Status Split</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "On Track", value: "1,436", color: "bg-green-500", pct: 73 },
              { label: "Delayed", value: "320", color: "bg-amber-400", pct: 16 },
              { label: "Cost Overrun", value: "180", color: "bg-red-500", pct: 9 },
              { label: "Near Completion", value: "45", color: "bg-[#E8602A]", pct: 2 },
            ].map(s => (
              <div key={s.label} className="p-3.5 bg-[#F5F5F4] rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-xs text-[#78716C]">{s.label}</span>
                </div>
                <p className="text-lg font-bold text-[#1C1917]">{s.value}</p>
                <div className="mt-1.5 h-1 bg-[#E7E5E4] rounded-full">
                  <div className={`h-1 rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Urgent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1C1917]">Urgent Early Warning Signals</h3>
            <button onClick={() => navigate("/alerts")} className="text-xs text-[#E8602A] font-semibold hover:underline">
              View all alerts →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentAlerts.map(alert => (
              <div key={alert.id} className={`bg-[#FAF7F4] rounded-2xl p-3.5 border shadow-2xs ${alert.priority === "Critical" ? "border-l-4 border-l-red-500 border-[#E7E5E4]" : "border-[#E7E5E4]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#1C1917] truncate">{alert.projectName}</span>
                      <RiskBadge level={alert.priority} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#78716C] mb-2 line-clamp-2">{alert.reason}</p>
                    <span className="text-[10px] text-[#A8A29E]">{alert.timestamp}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/projects/${alert.projectId}`)}
                    className="flex-shrink-0 text-xs font-medium text-[#E8602A] bg-white border border-[#FEF0E7] hover:bg-[#FEF0E7] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={11} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
