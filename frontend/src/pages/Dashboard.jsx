import { useNavigate } from "react-router-dom";
import {
  FolderOpen, AlertTriangle, Clock, TrendingUp, IndianRupee,
  ArrowUpRight, Eye
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
    title: "Total Projects", value: "1,981", subtitle: "Under monitoring",
    icon: FolderOpen, accentColor: "orange", change: "+12", changeType: "up"
  },
  {
    title: "High Risk Projects", value: "245", subtitle: "Immediate attention",
    icon: AlertTriangle, accentColor: "red", change: "+18", changeType: "up"
  },
  {
    title: "Delayed Projects", value: "320", subtitle: "Behind schedule",
    icon: Clock, accentColor: "red", change: "+24", changeType: "up"
  },
  {
    title: "Cost Overrun Projects", value: "180", subtitle: "Exceeding budget",
    icon: TrendingUp, accentColor: "red", change: "+7", changeType: "up"
  },
  {
    title: "Total Project Value", value: "₹4.2L Cr", subtitle: "Aggregate portfolio",
    icon: IndianRupee, accentColor: "green", change: "FY 2024–25", changeType: "neutral"
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
  const recentAlerts = alerts.slice(0, 4);

  return (
    <Layout user={user} title="Analytics Overview" subtitle="Real-time intelligence into government infrastructure project performance." showDateRange onExport={() => {}}>
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
              <p className="text-xs text-[#A8A29E] mt-1.5">
                {i === 0 ? "72% on-track" : i === 1 ? "12.4% of portfolio" : i === 2 ? "16.2% of portfolio" : i === 3 ? "9.1% of portfolio" : "Across 8 ministries"}
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
              <h3 className="font-semibold text-[#1C1917]">Risk Trend</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Last 6 months</p>
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
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Line type="monotone" dataKey="high" name="High Risk" stroke="#DC2626" strokeWidth={2} dot={{ r: 3, fill: "#DC2626" }} />
              <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#D97706" strokeWidth={2} dot={{ r: 3, fill: "#D97706" }} />
              <Line type="monotone" dataKey="low" name="Low Risk" stroke="#16A34A" strokeWidth={2} dot={{ r: 3, fill: "#16A34A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sector-wise */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Sector-wise Projects</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Distribution by sector</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
              <XAxis dataKey="sector" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Projects" fill="#E8602A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="risk" name="Avg Risk" fill="#FDDFCC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic by location style — project distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-2 bg-[#FEF0E7] rounded-2xl p-5 border border-[#FDDFCC] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1C1917]">Projects by Ministry</h3>
          </div>
          {[
            { name: "Road Transport", count: 312, pct: 85 },
            { name: "Jal Shakti", count: 405, pct: 100 },
            { name: "Urban Development", count: 400, pct: 99 },
            { name: "Power & Energy", count: 218, pct: 54 },
            { name: "Health", count: 280, pct: 69 },
            { name: "Education", count: 366, pct: 90 },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-3 mb-3">
              <span className="text-xs text-[#44403C] w-36 truncate">{m.name}</span>
              <div className="flex-1 bg-[#FDDFCC] rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-[#E8602A]" style={{ width: `${m.pct}%` }} />
              </div>
              <span className="text-xs font-semibold text-[#1C1917] w-12 text-right">{m.count.toLocaleString()}</span>
            </div>
          ))}
          <button className="w-full mt-2 text-sm text-[#E8602A] font-medium py-2 hover:bg-[#FDDFCC] rounded-xl transition-colors" onClick={() => navigate("/projects")}>
            View All Projects →
          </button>
        </div>

        {/* System health */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917]">Portfolio Health</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Current monitoring period</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Live
            </div>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-4xl font-bold text-[#1C1917]">72.6%</span>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium mb-1.5">
              <ArrowUpRight size={14} /> +3.2%
            </div>
          </div>
          <p className="text-xs text-[#78716C] mb-5">Projects on-track or near-completion</p>
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
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1C1917]">Recent Alerts</h3>
          <button onClick={() => navigate("/alerts")} className="text-sm text-[#E8602A] font-medium hover:text-[#C45320]">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentAlerts.map(alert => (
            <div key={alert.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${alert.priority === "Critical" ? "border-l-4 border-l-red-500 border-[#E7E5E4] pulse-red" : "border-[#E7E5E4]"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#1C1917] truncate">{alert.projectName}</span>
                    <RiskBadge level={alert.priority} size="sm" />
                  </div>
                  <p className="text-xs text-[#78716C] mb-2 line-clamp-2">{alert.reason}</p>
                  <span className="text-xs text-[#A8A29E]">{alert.timestamp}</span>
                </div>
                <button
                  onClick={() => navigate(`/projects/${alert.projectId}`)}
                  className="flex-shrink-0 text-xs font-medium text-[#E8602A] bg-[#FEF0E7] hover:bg-[#FDDFCC] px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye size={11} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
