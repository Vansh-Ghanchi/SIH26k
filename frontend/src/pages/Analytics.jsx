import { useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import Layout from "../components/Layout";
import { ministryComparisonData, sectorRadarData, costOverrunTrendData, keyInsights } from "../data/analytics";

const TIME_FILTERS = ["Last 3M", "Last 6M", "Last 1Y"];

const InsightIcon = { TrendingUp, AlertTriangle, CheckCircle, BarChart2 };

export default function Analytics({ user }) {
  const [timeFilter, setTimeFilter] = useState("Last 6M");

  const insightColors = {
    danger: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-500" },
    warning: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-500" },
    success: { bg: "bg-green-50", border: "border-green-100", icon: "text-green-600" },
    accent: { bg: "bg-[#FEF0E7]", border: "border-[#FDDFCC]", icon: "text-[#E8602A]" },
  };

  return (
    <Layout user={user} title="Analytics & Benchmarking" subtitle="Compare infrastructure performance across ministries and sectors.">
      {/* Time filter */}
      <div className="flex justify-end mb-5">
        <div className="flex gap-1 bg-[#F5F5F4] rounded-xl p-1 border border-[#E7E5E4]">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all
                ${timeFilter === f ? "bg-white shadow-sm text-[#1C1917]" : "text-[#78716C] hover:text-[#44403C]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ministry vs Ministry */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="mb-4">
          <h3 className="font-semibold text-[#1C1917]">Ministry vs Ministry</h3>
          <p className="text-xs text-[#A8A29E] mt-0.5">Comparative risk, project count and delays</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ministryComparisonData} margin={{ left: -15, right: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
            <XAxis dataKey="ministry" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
            <Bar dataKey="avgRisk" name="Avg Risk Score" fill="#E8602A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="delayed" name="Delayed Projects" fill="#FDDFCC" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sector radar + Cost overrun */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-[#1C1917]">Sector vs Sector</h3>
            <p className="text-xs text-[#A8A29E] mt-0.5">Multi-dimensional sector comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={sectorRadarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="#F5F5F4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#78716C" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#A8A29E" }} />
              <Radar name="Transport" dataKey="Transport" stroke="#E8602A" fill="#E8602A" fillOpacity={0.15} />
              <Radar name="Energy" dataKey="Energy" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} />
              <Radar name="Water" dataKey="Water" stroke="#2563EB" fill="#2563EB" fillOpacity={0.12} />
              <Radar name="Health" dataKey="Health" stroke="#9333EA" fill="#9333EA" fillOpacity={0.12} />
              <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" iconSize={7} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-[#1C1917]">Cost Overrun Trends</h3>
            <p className="text-xs text-[#A8A29E] mt-0.5">12-month average overrun percentage</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={costOverrunTrendData} margin={{ left: -15, right: 5 }}>
              <defs>
                <linearGradient id="overrunGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8602A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#E8602A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                formatter={(v) => [`${v}%`, "Cost Overrun"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="overrun" name="Overrun %" stroke="#E8602A" strokeWidth={2} fill="url(#overrunGrad)" dot={{ r: 3, fill: "#E8602A" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key insights */}
      <div>
        <h3 className="font-semibold text-[#1C1917] mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {keyInsights.map(insight => {
            const Icon = InsightIcon[insight.icon] || TrendingUp;
            const c = insightColors[insight.color] || insightColors.accent;
            return (
              <div key={insight.id} className={`rounded-2xl p-4 border shadow-sm ${c.bg} ${c.border}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 bg-white`}>
                  <Icon size={16} className={c.icon} />
                </div>
                <p className="text-sm font-semibold text-[#1C1917] mb-1">{insight.title}</p>
                <p className="text-xs text-[#78716C] leading-relaxed">{insight.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
