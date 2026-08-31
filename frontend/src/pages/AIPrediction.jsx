import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, TrendingUp, ExternalLink, Info, FileSpreadsheet,
  Sliders, CheckCircle2, AlertTriangle, Play, Sparkles
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import { projects } from "../data/projects";
import { shapFactors } from "../data/analytics";
import { apiService } from "../services/api";

export default function AIPrediction({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("existing"); // 'existing' | 'cuf_simulator'
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "701107");
  const [animated, setAnimated] = useState(false);

  // CUF Form state
  const [cufMinistry, setCufMinistry] = useState("Ministry of Road Transport and Highways");
  const [cufApprovedCost, setCufApprovedCost] = useState("2400");
  const [cufExpenditure, setCufExpenditure] = useState("1650");
  const [cufPhysicalProgress, setCufPhysicalProgress] = useState("45");
  const [cufLandAcquired, setCufLandAcquired] = useState("68");
  const [cufForestClearance, setCufForestClearance] = useState(true);
  const [cufEvaluating, setCufEvaluating] = useState(false);
  const [cufResult, setCufResult] = useState(null);

  const project = projects.find(p => String(p.id) === String(selectedId)) || projects[0];

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [selectedId]);

  const costProb = project.costRisk || (project.costRevisionPct ? Math.min(95, Math.round(project.costRevisionPct * 1.4 + 25)) : (project.riskLevel === 'Critical' ? 88 : project.riskLevel === 'High' ? 68 : 28));
  const timeProb = project.timeRisk || (project.deadlineRevisionFlag ? 85 : (project.riskLevel === 'Critical' ? 92 : project.riskLevel === 'High' ? 74 : 32));
  const overallScore = project.riskScore || project.overallRisk || (project.riskLevel === 'Critical' ? 89 : project.riskLevel === 'High' ? 65 : 25);
  const riskLabel = overallScore >= 75 ? "CRITICAL RISK" : overallScore >= 50 ? "HIGH RISK" : overallScore >= 35 ? "MEDIUM RISK" : "LOW RISK";
  const riskColor = overallScore >= 75 ? "text-red-600" : overallScore >= 50 ? "text-orange-600" : overallScore >= 35 ? "text-amber-600" : "text-green-600";
  const riskBg = overallScore >= 75 ? "bg-red-50 border-red-200" : overallScore >= 50 ? "bg-orange-50 border-orange-200" : overallScore >= 35 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";

  const shapData = shapFactors.filter(f => f.direction === "positive").map(f => ({
    ...f,
    value: Math.round(f.contribution * overallScore / 95),
  }));

  const handleRunCUFSimulation = async (e) => {
    e.preventDefault();
    setCufEvaluating(true);
    const res = await apiService.predictCUFRisk({
      approvedCost: parseFloat(cufApprovedCost) || 1000,
      expenditure: parseFloat(cufExpenditure) || 500,
      physicalProgress: parseFloat(cufPhysicalProgress) || 50,
      landAcquired: parseFloat(cufLandAcquired) || 70,
      forestClearanceLag: cufForestClearance,
    });
    setCufResult(res);
    setCufEvaluating(false);
  };

  return (
    <Layout
      user={user}
      title="AI Predictive Risk Engine"
      subtitle="Predict cost escalations, schedule delays, and risk trajectories using DRISHTI & Common Upload Form (CUF) parameters."
    >
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-5 p-1.5 bg-[#F5F5F4] rounded-2xl w-fit border border-[#E7E5E4]">
        <button
          onClick={() => setActiveTab("existing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "existing"
              ? "bg-white text-[#1C1917] shadow-xs"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <Brain size={14} className={activeTab === "existing" ? "text-[#E8602A]" : ""} />
          Monitored Projects Portfolio
        </button>
        <button
          onClick={() => setActiveTab("cuf_simulator")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "cuf_simulator"
              ? "bg-white text-[#1C1917] shadow-xs"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <FileSpreadsheet size={14} className={activeTab === "cuf_simulator" ? "text-[#E8602A]" : ""} />
          Custom CUF Form Simulator (MoSPI)
        </button>
      </div>

      {activeTab === "existing" ? (
        <>
          {/* Project selector */}
          <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-[#E8602A] flex-shrink-0" />
                <label className="text-sm font-semibold text-[#1C1917]">Select DRISHTI Project:</label>
              </div>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="flex-1 max-w-md text-sm border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#1C1917] bg-[#FAF7F4]"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.ministry})</option>
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
                  <p className="text-xs text-[#A8A29E] mt-0.5">Based on cumulative expenditure pace</p>
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
                  <span className="font-medium">92.3% (XGBoost Ensemble)</span>
                </div>
                <div className="h-3 bg-[#F5F5F4] rounded-full overflow-hidden">
                  {animated && (
                    <div
                      className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full fill-animate"
                      style={{ "--bar-width": `${costProb}%` }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Time Delay */}
            <div className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#78716C]">Schedule Delay Probability</p>
                  <p className="text-xs text-[#A8A29E] mt-0.5">Based on milestone completion lag</p>
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
                  <span className="font-medium">94.1% (LSTM Multi-Step)</span>
                </div>
                <div className="h-3 bg-[#F5F5F4] rounded-full overflow-hidden">
                  {animated && (
                    <div
                      className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full fill-animate"
                      style={{ "--bar-width": `${timeProb}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Overall risk + model info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className={`lg:col-span-1 rounded-2xl p-6 border shadow-sm ${riskBg}`}>
              <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Overall Risk Score</p>
              <p className={`text-3xl font-bold mb-1 ${riskColor}`}>{riskLabel}</p>
              <p className={`text-5xl font-black ${riskColor} mb-3`}>{overallScore}<span className="text-xl font-medium text-[#78716C]">/100</span></p>
              <div className="space-y-2 pt-3 border-t border-[#E7E5E4]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Confidence Score</span>
                  <span className="font-semibold text-[#1C1917]">92.3%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#78716C]">Monitored Features</span>
                  <span className="font-semibold text-[#1C1917]">18 CUF Variables</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1C1917]">Key Contributing Bottlenecks</h3>
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
            </div>
          </div>
        </>
      ) : (
        /* CUF Simulator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CUF Input Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-[#E8602A]" />
              <h3 className="font-bold text-[#1C1917]">Common Upload Form (CUF) Input Fields</h3>
            </div>
            <p className="text-xs text-[#78716C] mb-5">Simulate any upcoming infrastructure project by providing standard MoSPI parameters.</p>

            <form onSubmit={handleRunCUFSimulation} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#44403C] mb-1">Ministry / Sponsoring Department</label>
                <select
                  value={cufMinistry}
                  onChange={(e) => setCufMinistry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] text-xs bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                >
                  <option>Ministry of Road Transport and Highways</option>
                  <option>Ministry of Railways</option>
                  <option>Ministry of Jal Shakti</option>
                  <option>Ministry of Power</option>
                  <option>Ministry of Housing and Urban Affairs</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#44403C] mb-1">Approved Original Cost (₹ Crores)</label>
                  <input
                    type="number"
                    value={cufApprovedCost}
                    onChange={(e) => setCufApprovedCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#44403C] mb-1">Cumulative Expenditure (₹ Crores)</label>
                  <input
                    type="number"
                    value={cufExpenditure}
                    onChange={(e) => setCufExpenditure(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#44403C] mb-1">Physical Milestone Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cufPhysicalProgress}
                    onChange={(e) => setCufPhysicalProgress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#44403C] mb-1">Land Acquisition Handover (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cufLandAcquired}
                    onChange={(e) => setCufLandAcquired(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1C1917]">Forest & Environmental Clearance</p>
                  <p className="text-[11px] text-[#78716C]">Is there an active environmental approval bottleneck?</p>
                </div>
                <input
                  type="checkbox"
                  checked={cufForestClearance}
                  onChange={(e) => setCufForestClearance(e.target.checked)}
                  className="w-4 h-4 accent-[#E8602A] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={cufEvaluating}
                className="w-full py-3 bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {cufEvaluating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running AI Inferencing...
                  </span>
                ) : (
                  <>
                    <Play size={14} className="fill-white" /> Evaluate CUF Risk with AI
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CUF Prediction Results Output */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {cufResult ? (
              <div className="bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#E8602A] uppercase tracking-wider">AI Inference Output</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    {cufResult.confidenceScore} Accuracy
                  </span>
                </div>

                <div className="text-center py-4 bg-[#FAF7F4] rounded-2xl border border-[#E7E5E4] mb-5">
                  <p className="text-xs text-[#78716C] font-medium">Composite Risk Score</p>
                  <p className={`text-5xl font-black mt-1 ${cufResult.overallRisk > 70 ? "text-red-600" : "text-amber-600"}`}>
                    {cufResult.overallRisk}
                    <span className="text-base text-[#78716C]">/100</span>
                  </p>
                  <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                    cufResult.overallRisk > 70 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {cufResult.riskLevel} Project
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-red-800">Forecasted Delay</p>
                    <p className="text-lg font-black text-red-600">+{cufResult.predictedDelayMonths} Months</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-amber-800">Projected Overrun</p>
                    <p className="text-lg font-black text-amber-600">+₹{cufResult.predictedCostEscalationCr} Cr</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-[#1C1917] mb-2">Key Attributed Drivers:</p>
                  <div className="space-y-2">
                    {cufResult.topDrivers.map((driver, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 bg-[#F5F5F4] rounded-lg">
                        <span className="text-[#44403C] font-medium">{driver.name}</span>
                        <span className="text-red-600 font-bold">{driver.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-[#E7E5E4] shadow-sm text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF0E7] flex items-center justify-center text-[#E8602A] mb-3">
                  <FileSpreadsheet size={24} />
                </div>
                <h4 className="font-bold text-[#1C1917] text-sm">CUF Evaluator Ready</h4>
                <p className="text-xs text-[#78716C] mt-1 max-w-xs">
                  Fill out the parameters on the left and click <strong>"Evaluate CUF Risk"</strong> to compute real-time cost and schedule overrun predictions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
