import { useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, BarChart2, Calendar, Filter } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import Layout from "../components/Layout";
import { keyInsights } from "../data/analytics";

const TIME_FILTERS = [
  { id: "Last 3M", label: "Last 3M", period: "Q4 FY25-26 (Jan – Mar 2026)" },
  { id: "Last 6M", label: "Last 6M", period: "H2 FY25-26 (Oct 2025 – Mar 2026)" },
  { id: "Last 1Y", label: "Last 1Y", period: "Full Annual Cycle (Apr 2025 – Mar 2026)" },
];

const datasetsByTime = {
  "Last 3M": {
    costTrend: [
      { month: "Jan 2026", overrun: 18.2, benchmark: 12.0 },
      { month: "Feb 2026", overrun: 18.9, benchmark: 12.0 },
      { month: "Mar 2026", overrun: 19.5, benchmark: 12.0 },
    ],
    ministryData: [
      { ministry: "Civil Aviation", avgRisk: 62, projects: 94, delayed: 22 },
      { ministry: "Road Transport & Highways", avgRisk: 58, projects: 312, delayed: 98 },
      { ministry: "Railways", avgRisk: 54, projects: 405, delayed: 142 },
      { ministry: "Petroleum & Natural Gas", avgRisk: 46, projects: 218, delayed: 46 },
      { ministry: "Power & New Energy", avgRisk: 42, projects: 366, delayed: 84 },
      { ministry: "Water Resources & Jal Shakti", avgRisk: 49, projects: 280, delayed: 112 },
      { ministry: "Housing & Urban Affairs", avgRisk: 51, projects: 120, delayed: 34 },
      { ministry: "Ports & Shipping", avgRisk: 38, projects: 88, delayed: 18 }
    ],
    radarData: [
      { subject: "Risk Level", Transport: 64, Energy: 40, Petroleum: 44, Water: 52, Aviation: 62 },
      { subject: "Schedule Adherence", Transport: 52, Energy: 74, Petroleum: 70, Water: 56, Aviation: 50 },
      { subject: "Budget Discipline", Transport: 55, Energy: 80, Petroleum: 76, Water: 60, Aviation: 56 },
      { subject: "Milestone Velocity", Transport: 48, Energy: 71, Petroleum: 67, Water: 53, Aviation: 47 },
      { subject: "Clearance Speed", Transport: 46, Energy: 66, Petroleum: 64, Water: 50, Aviation: 68 },
    ]
  },
  "Last 6M": {
    costTrend: [
      { month: "Oct 2025", overrun: 16.1, benchmark: 12.0 },
      { month: "Nov 2025", overrun: 16.8, benchmark: 12.0 },
      { month: "Dec 2025", overrun: 17.5, benchmark: 12.0 },
      { month: "Jan 2026", overrun: 18.2, benchmark: 12.0 },
      { month: "Feb 2026", overrun: 18.9, benchmark: 12.0 },
      { month: "Mar 2026", overrun: 19.5, benchmark: 12.0 },
    ],
    ministryData: [
      { ministry: "Civil Aviation", avgRisk: 60, projects: 94, delayed: 24 },
      { ministry: "Road Transport & Highways", avgRisk: 56, projects: 312, delayed: 104 },
      { ministry: "Railways", avgRisk: 52, projects: 405, delayed: 138 },
      { ministry: "Petroleum & Natural Gas", avgRisk: 44, projects: 218, delayed: 44 },
      { ministry: "Power & New Energy", avgRisk: 40, projects: 366, delayed: 80 },
      { ministry: "Water Resources & Jal Shakti", avgRisk: 47, projects: 280, delayed: 108 },
      { ministry: "Housing & Urban Affairs", avgRisk: 49, projects: 120, delayed: 32 },
      { ministry: "Ports & Shipping", avgRisk: 36, projects: 88, delayed: 16 }
    ],
    radarData: [
      { subject: "Risk Level", Transport: 62, Energy: 42, Petroleum: 46, Water: 49, Aviation: 60 },
      { subject: "Schedule Adherence", Transport: 54, Energy: 72, Petroleum: 68, Water: 58, Aviation: 52 },
      { subject: "Budget Discipline", Transport: 56, Energy: 78, Petroleum: 74, Water: 62, Aviation: 58 },
      { subject: "Milestone Velocity", Transport: 50, Energy: 69, Petroleum: 65, Water: 55, Aviation: 49 },
      { subject: "Clearance Speed", Transport: 48, Energy: 64, Petroleum: 62, Water: 52, Aviation: 65 },
    ]
  },
  "Last 1Y": {
    costTrend: [
      { month: "Apr 2025", overrun: 13.5, benchmark: 12.0 },
      { month: "May 2025", overrun: 13.9, benchmark: 12.0 },
      { month: "Jun 2025", overrun: 14.1, benchmark: 12.0 },
      { month: "Jul 2025", overrun: 14.2, benchmark: 12.0 },
      { month: "Aug 2025", overrun: 14.8, benchmark: 12.0 },
      { month: "Sep 2025", overrun: 15.6, benchmark: 12.0 },
      { month: "Oct 2025", overrun: 16.1, benchmark: 12.0 },
      { month: "Nov 2025", overrun: 16.8, benchmark: 12.0 },
      { month: "Dec 2025", overrun: 17.5, benchmark: 12.0 },
      { month: "Jan 2026", overrun: 18.2, benchmark: 12.0 },
      { month: "Feb 2026", overrun: 18.9, benchmark: 12.0 },
      { month: "Mar 2026", overrun: 19.5, benchmark: 12.0 },
    ],
    ministryData: [
      { ministry: "Civil Aviation", avgRisk: 58, projects: 94, delayed: 26 },
      { ministry: "Road Transport & Highways", avgRisk: 55, projects: 312, delayed: 112 },
      { ministry: "Railways", avgRisk: 50, projects: 405, delayed: 146 },
      { ministry: "Petroleum & Natural Gas", avgRisk: 42, projects: 218, delayed: 48 },
      { ministry: "Power & New Energy", avgRisk: 38, projects: 366, delayed: 76 },
      { ministry: "Water Resources & Jal Shakti", avgRisk: 45, projects: 280, delayed: 104 },
      { ministry: "Housing & Urban Affairs", avgRisk: 47, projects: 120, delayed: 30 },
      { ministry: "Ports & Shipping", avgRisk: 34, projects: 88, delayed: 14 }
    ],
    radarData: [
      { subject: "Risk Level", Transport: 60, Energy: 44, Petroleum: 48, Water: 47, Aviation: 58 },
      { subject: "Schedule Adherence", Transport: 56, Energy: 70, Petroleum: 66, Water: 60, Aviation: 54 },
      { subject: "Budget Discipline", Transport: 58, Energy: 76, Petroleum: 72, Water: 64, Aviation: 60 },
      { subject: "Milestone Velocity", Transport: 52, Energy: 67, Petroleum: 63, Water: 57, Aviation: 51 },
      { subject: "Clearance Speed", Transport: 50, Energy: 62, Petroleum: 60, Water: 54, Aviation: 63 },
    ]
  }
};

const InsightIcon = { TrendingUp, AlertTriangle, CheckCircle, BarChart2 };

export default function Analytics({ user }) {
  const [timeFilter, setTimeFilter] = useState("Last 6M");

  const currentDataset = datasetsByTime[timeFilter] || datasetsByTime["Last 6M"];
  const activePeriodInfo = TIME_FILTERS.find(f => f.id === timeFilter)?.period || "Reporting Period";

  const insightColors = {
    danger: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-500" },
    warning: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-500" },
    success: { bg: "bg-green-50", border: "border-green-100", icon: "text-green-600" },
    accent: { bg: "bg-[#FEF0E7]", border: "border-[#FDDFCC]", icon: "text-[#E8602A]" },
  };

  return (
    <Layout user={user} title="Analytics & Benchmarking" subtitle="Compare infrastructure performance across ministries and sectors.">
      {/* Time filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white p-3.5 rounded-2xl border border-[#E7E5E4] shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[#78716C]">
          <Calendar size={14} className="text-[#E8602A]" />
          <span>Active Timeline Window:</span>
          <strong className="text-[#1C1917] font-semibold">{activePeriodInfo}</strong>
        </div>

        <div className="flex items-center gap-1.5 bg-[#FAF7F4] rounded-xl p-1 border border-[#E7E5E4]">
          <span className="text-[11px] font-medium text-[#A8A29E] px-2 flex items-center gap-1">
            <Filter size={11} /> Filter:
          </span>
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeFilter === f.id
                  ? "bg-[#E8602A] text-white shadow-xs"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-white/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ministry vs Ministry */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-[#1C1917] text-sm">Ministry vs Ministry Cross-Evaluation</h3>
            <p className="text-xs text-[#A8A29E] mt-0.5">Comparative risk score, monitored project count, and active delayed projects ({timeFilter})</p>
          </div>
          <span className="text-xs bg-[#FAF7F4] border border-[#E7E5E4] px-2.5 py-1 rounded-lg text-[#78716C] font-medium">
            {timeFilter} Aggregation
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={currentDataset.ministryData} margin={{ left: -15, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
            <XAxis dataKey="ministry" tick={{ fontSize: 10, fill: "#78716C" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Bar dataKey="avgRisk" name="Avg Risk Score (0-100)" fill="#E8602A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delayed" name="Delayed Projects Count" fill="#FDDFCC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector radar + Cost overrun */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-sm">Sector vs Sector Performance Radar</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">Multi-dimensional operational efficiency metrics ({timeFilter})</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={currentDataset.radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="#F5F5F4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#78716C" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#A8A29E" }} />
              <Radar name="Transport" dataKey="Transport" stroke="#E8602A" fill="#E8602A" fillOpacity={0.18} />
              <Radar name="Energy" dataKey="Energy" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} />
              <Radar name="Water" dataKey="Water" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} />
              <Radar name="Petroleum" dataKey="Petroleum" stroke="#D97706" fill="#D97706" fillOpacity={0.12} />
              <Radar name="Aviation" dataKey="Aviation" stroke="#9333EA" fill="#9333EA" fillOpacity={0.12} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={7} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-sm">Cost Overrun Trends</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">{timeFilter} average portfolio overrun percentage</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#E8602A] bg-[#FEF0E7] px-2 py-0.5 rounded-md">
              Latest: +19.5%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={currentDataset.costTrend} margin={{ left: -15, right: 5 }}>
              <defs>
                <linearGradient id="overrunGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8602A" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#E8602A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#78716C" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                formatter={(v, name) => [`${v}%`, name === "overrun" ? "Cost Overrun" : "National Threshold"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="overrun" name="Overrun %" stroke="#E8602A" strokeWidth={2.5} fill="url(#overrunGrad)" dot={{ r: 3, fill: "#E8602A" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key insights */}
      <div>
        <h3 className="font-semibold text-[#1C1917] mb-4 text-sm">Key Analytical Insights ({timeFilter})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {keyInsights.map(insight => {
            const Icon = InsightIcon[insight.icon] || TrendingUp;
            const c = insightColors[insight.color] || insightColors.accent;
            return (
              <div key={insight.id} className={`rounded-2xl p-4 border shadow-sm ${c.bg} ${c.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={c.icon} />
                  <h4 className="text-xs font-bold text-[#1C1917] truncate">{insight.title}</h4>
                </div>
                <p className="text-[11px] text-[#78716C] leading-relaxed">{insight.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
