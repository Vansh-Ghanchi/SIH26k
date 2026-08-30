import { useState } from "react";
import {
  Brain, TrendingUp, Sliders, AlertOctagon, BarChart2,
  FileSpreadsheet, Zap, ChevronRight, Layers, ArrowUpRight,
  RefreshCw, CheckCircle2, Cpu, LineChart as LucideLineChart
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import { sectorRadarData } from "../data/analytics";

const analystKpis = [
  {
    title: "Model Accuracy", value: "94.8%", subtitle: "XGBoost + Random Forest",
    icon: Brain, accentColor: "orange", change: "+1.4% tuned", changeType: "up"
  },
  {
    title: "Anomaly Flags", value: "38", subtitle: "Deviations detected this week",
    icon: AlertOctagon, accentColor: "red", change: "+12 vs last wk", changeType: "up"
  },
  {
    title: "Delay Correlation", value: "r = 0.84", subtitle: "Strong land clearance link",
    icon: TrendingUp, accentColor: "orange", change: "p < 0.001", changeType: "neutral"
  },
  {
    title: "Scenario Variance", value: "± ₹14.2k Cr", subtitle: "Simulated 95% CI Range",
    icon: BarChart2, accentColor: "green", change: "Monte Carlo 10k", changeType: "neutral"
  },
  {
    title: "Top SHAP Driver", value: "Contractor Score", subtitle: "34.2% feature contribution",
    icon: Layers, accentColor: "orange", change: "Rank #1", changeType: "up"
  },
];

const shapFeatures = [
  { feature: "Contractor Past Milestone Delay Rate", impact: "+34.2%", type: "Positive Driver", weight: 85, color: "danger" },
  { feature: "Environmental & Forest Clearance Lag", impact: "+26.8%", type: "Positive Driver", weight: 68, color: "danger" },
  { feature: "Material Inflation Index (Steel/Cement)", impact: "+18.4%", type: "Moderate Driver", weight: 46, color: "warning" },
  { feature: "High Treasury Fund Disbursement Pace", impact: "-22.1%", type: "Protective Factor", weight: 55, color: "success" },
  { feature: "Geotechnical Survey Quality Grade", impact: "-14.5%", type: "Protective Factor", weight: 36, color: "success" },
];

const anomalySignals = [
  { id: "ANM-401", project: "Delhi-Mumbai Expressway Package 8", metric: "Material Consumption vs Progress", deviation: "+42% excess usage", severity: "High", detectedAt: "2 hrs ago" },
  { id: "ANM-402", project: "Subansiri Hydroelectric Phase 2", metric: "Daily Work-force Inflow", deviation: "-65% attendance drop", severity: "High", detectedAt: "5 hrs ago" },
  { id: "ANM-403", project: "Chennai Metro Line 4 Tunneling", metric: "TBM Cutterhead Wear Rate", deviation: "+28% higher wear", severity: "Medium", detectedAt: "Yesterday" },
  { id: "ANM-404", project: "Smart City Sewerage Varanasi", metric: "Contractor Billing Spike", deviation: "+35% sudden surge", severity: "Medium", detectedAt: "2 days ago" },
];

export default function AnalystDashboard({ user }) {
  // Interactive Simulation state
  const [delayWeeks, setDelayWeeks] = useState(6);
  const [inflationRate, setInflationRate] = useState(8);
  const [resourceConstraint, setResourceConstraint] = useState(15);

  // Model Retraining Simulation state
  const [retraining, setRetraining] = useState(false);
  const [retrainedSuccess, setRetrainedSuccess] = useState(false);

  // Computed simulation risk score
  const computedRiskIndex = Math.min(99, Math.round(48 + (delayWeeks * 2.8) + (inflationRate * 1.5) + (resourceConstraint * 0.9)));
  const computedCostOverrun = ((inflationRate * 1.2) + (delayWeeks * 0.9)).toFixed(1);

  const handleRetrain = () => {
    setRetraining(true);
    setRetrainedSuccess(false);
    setTimeout(() => {
      setRetraining(false);
      setRetrainedSuccess(true);
      setTimeout(() => setRetrainedSuccess(false), 4000);
    }, 1800);
  };

  return (
    <Layout
      user={user}
      title="Quantitative Risk & Analytics Studio"
      subtitle="Advanced ML research workspace: SHAP attribution, sensitivity simulation, model drift calibration, and anomaly detection."
      showDateRange
    >
      {/* Top Analyst KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {analystKpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 95 : i === 1 ? 76 : i === 2 ? 84 : i === 3 ? 65 : 88}
                color={i === 1 ? "danger" : i === 3 ? "success" : "accent"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "F1-Score: 0.932" : i === 1 ? "Auto-tagged anomalies" : i === 2 ? "High correlation" : i === 3 ? "Confidence 95%" : "Top global feature"}
              </p>
            </div>
          </StatCard>
        ))}
      </div>

      {/* Interactive Scenario & Sensitivity Simulator */}
      <div className="bg-gradient-to-br from-[#1C1917] to-[#292524] rounded-2xl p-6 text-white shadow-lg mb-6 border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-700">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E8602A] text-white">
                <Sliders size={16} />
              </div>
              <h3 className="text-base font-bold tracking-tight">Interactive What-If Sensitivity Simulator</h3>
            </div>
            <p className="text-xs text-stone-400 mt-1">Adjust macroeconomic and supply parameters to test portfolio resilience in real time.</p>
          </div>

          <div className="flex items-center gap-6 bg-stone-900/80 px-4 py-2.5 rounded-xl border border-stone-700">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Projected Risk Index</p>
              <p className={`text-2xl font-black ${computedRiskIndex > 75 ? "text-red-400" : computedRiskIndex > 55 ? "text-amber-400" : "text-emerald-400"}`}>
                {computedRiskIndex}/100
              </p>
            </div>
            <div className="w-px h-8 bg-stone-700" />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Cost Overrun Est.</p>
              <p className="text-2xl font-black text-amber-400">+{computedCostOverrun}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1 */}
          <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-stone-300">Approval Delay Lag</span>
              <span className="text-[#E8602A] font-bold">{delayWeeks} Weeks</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={delayWeeks}
              onChange={(e) => setDelayWeeks(Number(e.target.value))}
              className="w-full accent-[#E8602A] cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-2">Simulates land acquisition & environmental permit wait periods.</p>
          </div>

          {/* Slider 2 */}
          <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-stone-300">Raw Material Inflation</span>
              <span className="text-[#E8602A] font-bold">+{inflationRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-[#E8602A] cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-2">Projects steel, cement, and fuel commodity escalation indices.</p>
          </div>

          {/* Slider 3 */}
          <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-stone-300">Labor / Resource Deficit</span>
              <span className="text-[#E8602A] font-bold">{resourceConstraint}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={resourceConstraint}
              onChange={(e) => setResourceConstraint(Number(e.target.value))}
              className="w-full accent-[#E8602A] cursor-pointer"
            />
            <p className="text-[11px] text-stone-400 mt-2">Calculates bottleneck impact on critical milestone milestones.</p>
          </div>
        </div>
      </div>

      {/* Model Recalibration & Sandbox Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FEF0E7] text-[#E8602A] rounded-2xl">
            <Cpu size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[#1C1917] text-sm">Active Ensemble Model: XGBoost + Random Forest (v3.2)</h4>
            <p className="text-xs text-[#78716C]">Trained on 1,981 PAIMANA Projects · Data Drift Score: 0.04 (Stable)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {retrainedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold animate-fade-in">
              <CheckCircle2 size={14} /> Hyperparameters Recalibrated (+0.8% Gain)
            </span>
          )}
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#44403C] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={13} className={retraining ? "animate-spin" : ""} />
            {retraining ? "Retraining on 1,981 Projects..." : "Retrain ML Pipeline"}
          </button>
        </div>
      </div>

      {/* Grid: SHAP Feature Attribution & Sector Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* SHAP Feature Importance */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-base">SHAP Factor Attribution (Global Drivers)</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Contribution magnitude of variables towards project delay predictions.</p>
            </div>
            <span className="text-[11px] font-bold bg-[#FEF0E7] text-[#E8602A] px-2.5 py-1 rounded-md">TreeSHAP v0.41</span>
          </div>

          <div className="space-y-3.5">
            {shapFeatures.map((f, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1917]">{f.feature}</span>
                  <span className={`font-bold ${f.color === "danger" ? "text-red-600" : f.color === "warning" ? "text-amber-600" : "text-emerald-600"}`}>
                    {f.impact}
                  </span>
                </div>
                <ProgressBar
                  value={f.weight}
                  color={f.color}
                  height="h-1.5"
                  animate
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sector Resilience Radar */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-base">Multi-Sector Performance Radar</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Evaluation across Budget, Schedule, and Milestone health.</p>
            </div>
            <span className="text-xs text-[#78716C] font-medium">5 Dimensions</span>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={sectorRadarData}>
              <PolarGrid stroke="#E7E5E4" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#78716C" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#A8A29E" }} />
              <Radar name="Transport" dataKey="Transport" stroke="#E8602A" fill="#E8602A" fillOpacity={0.25} />
              <Radar name="Energy" dataKey="Energy" stroke="#16A34A" fill="#16A34A" fillOpacity={0.2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Detection Log */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-[#1C1917] text-base">Real-time Anomaly Detection Queue</h3>
            <p className="text-xs text-[#78716C] mt-0.5">Algorithmic outlier signals flagged by continuous site sensory and expenditure monitoring.</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-[#E8602A] font-semibold border border-[#FEF0E7] bg-[#FEF0E7] hover:bg-[#FDDFCC] px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
            <FileSpreadsheet size={14} /> Export Raw Inference Data
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F5F5F4] text-[#A8A29E] font-medium">
                <th className="pb-3 pl-2">Signal ID</th>
                <th className="pb-3">Project Name</th>
                <th className="pb-3">Monitored Metric</th>
                <th className="pb-3">Detected Deviation</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3 text-right pr-2">Detected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {anomalySignals.map((sig) => (
                <tr key={sig.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                  <td className="py-3 pl-2 font-mono font-bold text-[#E8602A]">{sig.id}</td>
                  <td className="py-3 font-semibold text-[#1C1917]">{sig.project}</td>
                  <td className="py-3 text-[#44403C]">{sig.metric}</td>
                  <td className="py-3 font-bold text-red-600">{sig.deviation}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sig.severity === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {sig.severity}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 text-[#A8A29E]">{sig.detectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
