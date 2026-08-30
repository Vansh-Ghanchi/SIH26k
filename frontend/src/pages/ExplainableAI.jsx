import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import Layout from "../components/Layout";
import { shapFactors } from "../data/analytics";

const recommendations = [
  {
    id: 1,
    title: "Immediate Site Inspection",
    urgency: "Immediate",
    icon: AlertTriangle,
    color: "red",
    desc: "Deploy field verification team to NH-48 sites within 48 hours. Verify actual construction status vs. contractor-reported progress.",
    action: "Initiate Inspection",
  },
  {
    id: 2,
    title: "Budget Review Meeting",
    urgency: "Within 1 week",
    icon: Lightbulb,
    color: "amber",
    desc: "Conduct emergency budget review with contractor (L&T Infrastructure) and Ministry of Road Transport to assess cost overrun risk.",
    action: "Schedule Meeting",
  },
  {
    id: 3,
    title: "Ministry Escalation",
    urgency: "Within 72 hours",
    icon: CheckCircle,
    color: "orange",
    desc: "Escalate project status report to Ministry Secretary level for intervention and resource reallocation.",
    action: "Send Report",
  },
];

export default function ExplainableAI({ user }) {
  const navigate = useNavigate();

  const chartData = shapFactors.map(f => ({
    factor: f.factor,
    contribution: f.direction === "negative" ? -f.contribution : f.contribution,
    fill: f.direction === "negative" ? "#16A34A" : f.contribution >= 25 ? "#DC2626" : f.contribution >= 15 ? "#EF4444" : "#F97316",
  }));

  return (
    <Layout user={user} title="AI Explanation" subtitle="Why is this project classified as HIGH RISK?">
      <button onClick={() => navigate("/ai-prediction")} className="flex items-center gap-2 text-sm text-[#78716C] hover:text-[#1C1917] mb-5 transition-colors">
        <ArrowLeft size={14} /> Back to AI Prediction
      </button>

      {/* Selected project */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-5 flex items-center gap-3">
        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightbulb size={17} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1C1917]">NH-48 Highway Expansion</p>
          <p className="text-xs text-[#78716C]">Ministry of Road Transport · Gujarat</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          HIGH RISK — 89/100
        </div>
      </div>

      {/* SHAP chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="mb-4">
          <h3 className="font-semibold text-[#1C1917]">Feature Contribution (SHAP Analysis)</h3>
          <p className="text-xs text-[#A8A29E] mt-0.5">Each factor's contribution to the overall risk score — red bars increase risk, green bars reduce it</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 15, right: 40, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} unit="%" />
            <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: "#44403C" }} axisLine={false} tickLine={false} width={160} />
            <ReferenceLine x={0} stroke="#E7E5E4" strokeWidth={1.5} />
            <Tooltip
              formatter={(v) => [`${v > 0 ? "+" : ""}${v}% risk contribution`]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12 }}
            />
            <Bar dataKey="contribution" radius={4}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F5F5F4]">
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <span className="w-3 h-3 rounded bg-red-500" /> Risk-increasing factors
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <span className="w-3 h-3 rounded bg-green-500" /> Risk-reducing factors
          </div>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <h3 className="font-semibold text-[#1C1917] mb-4">Contribution Breakdown</h3>
        <div className="space-y-3">
          {shapFactors.map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-[#44403C] w-48 flex-shrink-0">{f.factor}</span>
              <div className="flex-1 h-2 bg-[#F5F5F4] rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full ${f.direction === "negative" ? "bg-green-500" : "bg-[#E8602A]"}`}
                  style={{ width: `${(f.contribution / 35) * 100}%` }}
                />
              </div>
              <span className={`text-sm font-semibold w-16 text-right flex-shrink-0 ${f.direction === "negative" ? "text-green-600" : "text-red-600"}`}>
                {f.direction === "negative" ? "-" : "+"}{f.contribution}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Plain English */}
      <div className="bg-[#FEF0E7] border border-[#FDDFCC] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-[#E8602A] rounded-xl flex items-center justify-center">
            <Lightbulb size={15} className="text-white" />
          </div>
          <h3 className="font-semibold text-[#1C1917]">Plain English Explanation</h3>
        </div>
        <blockquote className="text-[#1C1917] text-sm leading-relaxed italic border-l-3 border-[#E8602A] pl-4">
          "This project is flagged HIGH RISK because physical work is 32% behind the planned schedule, combined with 3 missed milestones and 2 cost revisions totaling ₹240 Cr. The AI model has detected a strong historical correlation between similar progress gaps in the Transport sector and final project delays of 12–18 months."
        </blockquote>
      </div>

      {/* Recommendations */}
      <h3 className="font-semibold text-[#1C1917] mb-4">AI Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map(r => {
          const Icon = r.icon;
          const c = {
            red: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-500", iconBg: "bg-red-100", btn: "bg-red-500 hover:bg-red-600" },
            amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", iconBg: "bg-amber-100", btn: "bg-amber-500 hover:bg-amber-600" },
            orange: { bg: "bg-[#FEF0E7]", border: "border-[#FDDFCC]", icon: "text-[#E8602A]", iconBg: "bg-[#FDDFCC]", btn: "bg-[#E8602A] hover:bg-[#C45320]" },
          }[r.color];
          return (
            <div key={r.id} className={`rounded-2xl p-5 border shadow-sm ${c.bg} ${c.border}`}>
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>
                <Icon size={17} className={c.icon} />
              </div>
              <p className="text-sm font-bold text-[#1C1917] mb-1">{r.title}</p>
              <div className="flex items-center gap-1.5 mb-3">
                <Clock size={11} className="text-[#78716C]" />
                <span className="text-xs text-[#78716C] font-medium">{r.urgency}</span>
              </div>
              <p className="text-xs text-[#44403C] leading-relaxed mb-4">{r.desc}</p>
              <button className={`w-full py-2 text-xs font-semibold text-white rounded-xl transition-colors ${c.btn}`}>
                {r.action}
              </button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
