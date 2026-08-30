import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, TrendingUp, ExternalLink, Info } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import { projects } from "../data/projects";
import { shapFactors } from "../data/analytics";

export default function AIPrediction({ user }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState("1");
  const [animated, setAnimated] = useState(false);

  const project = projects.find(p => p.id === parseInt(selectedId)) || projects[0];

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [selectedId]);

  const costProb = project.costRisk;
  const timeProb = project.timeRisk;
  const overallScore = project.overallRisk;
  const riskLabel = overallScore >= 75 ? "HIGH RISK" : overallScore >= 50 ? "MEDIUM RISK" : "LOW RISK";
  const riskColor = overallScore >= 75 ? "text-red-600" : overallScore >= 50 ? "text-amber-600" : "text-green-600";
  const riskBg = overallScore >= 75 ? "bg-red-50 border-red-200" : overallScore >= 50 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  const shapData = shapFactors.filter(f => f.direction === "positive").map(f => ({
    ...f,
    value: Math.round(f.contribution * overallScore / 95),
  }));

  return (
    <Layout user={user} title="AI Risk Prediction Engine" subtitle="AI-powered prediction of cost and schedule risks across infrastructure projects.">
      {/* Project selector */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-5">
        <div className="flex items-center gap-3">
          <Brain size={16} className="text-[#E8602A] flex-shrink-0" />
          <label className="text-sm font-medium text-[#44403C]">Select Project:</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="flex-1 max-w-md text-sm border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#1C1917]"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Prediction cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Cost Overrun */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#78716C]">Cost Overrun Probability</p>
              <p className="text-xs text-[#A8A29E] mt-0.5">Based on financial trajectory</p>
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <TrendingUp size={17} className="text-red-500" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold text-red-600">{costProb}%</span>
            {costProb >= 75 && <span className="text-sm font-medium text-red-500 mb-1.5">Very High</span>}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#78716C]">
              <span>Prediction Confidence</span>
              <span className="font-medium">92.3%</span>
            </div>
            <div className="h-3 bg-[#F5F5F4] rounded-full overflow-hidden">
              {animated && (
                <div
                  className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full fill-animate"
                  style={{ "--bar-width": `${costProb}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] text-[#A8A29E]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Time Delay */}
        <div className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#78716C]">Time Delay Probability</p>
              <p className="text-xs text-[#A8A29E] mt-0.5">Based on schedule trajectory</p>
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Brain size={17} className="text-red-500" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-bold text-red-600">{timeProb}%</span>
            {timeProb >= 75 && <span className="text-sm font-medium text-red-500 mb-1.5">Very High</span>}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#78716C]">
              <span>Prediction Confidence</span>
              <span className="font-medium">94.1%</span>
            </div>
            <div className="h-3 bg-[#F5F5F4] rounded-full overflow-hidden">
              {animated && (
                <div
                  className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full fill-animate"
                  style={{ "--bar-width": `${timeProb}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] text-[#A8A29E]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall risk + model info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className={`lg:col-span-1 rounded-2xl p-6 border shadow-sm ${riskBg}`}>
          <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Overall Assessment</p>
          <p className={`text-3xl font-bold mb-1 ${riskColor}`}>{riskLabel}</p>
          <p className={`text-5xl font-black ${riskColor} mb-3`}>{overallScore}<span className="text-xl font-medium text-[#78716C]">/100</span></p>
          <div className="space-y-2 pt-3 border-t border-[#E7E5E4]">
            <div className="flex justify-between text-xs">
              <span className="text-[#78716C]">Confidence Score</span>
              <span className="font-semibold text-[#1C1917]">92.3%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#78716C]">Data Points Used</span>
              <span className="font-semibold text-[#1C1917]">847</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#78716C]">Last Updated</span>
              <span className="font-semibold text-[#1C1917]">2 min ago</span>
            </div>
          </div>
          <div className="mt-4 p-2.5 bg-white/60 rounded-xl">
            <p className="text-[10px] text-[#78716C] font-medium">Model</p>
            <p className="text-xs text-[#44403C] mt-0.5">Gradient Boosting + LSTM Neural Network</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1C1917]">Top Contributing Factors</h3>
            <Info size={14} className="text-[#A8A29E]" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={shapData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="factor" tick={{ fontSize: 10, fill: "#44403C" }} axisLine={false} tickLine={false} width={140} />
              <Tooltip formatter={(v) => [`+${v}% risk contribution`]} />
              <Bar dataKey="value" name="Risk Contribution" radius={[0, 4, 4, 0]}>
                {shapData.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? "#DC2626" : i === 1 ? "#EF4444" : i === 2 ? "#F97316" : "#FB923C"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-[#F5F5F4]">
            <button
              onClick={() => navigate("/explainable-ai")}
              className="flex items-center gap-2 w-full justify-center text-sm font-semibold text-[#E8602A] bg-[#FEF0E7] hover:bg-[#FDDFCC] py-2.5 rounded-xl transition-colors"
            >
              View Full AI Explanation <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
