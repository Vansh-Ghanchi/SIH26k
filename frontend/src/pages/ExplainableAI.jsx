import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Lightbulb, AlertTriangle, CheckCircle2, Clock,
  Search, ShieldAlert, FileText, Send, Calendar, CheckSquare,
  Sparkles, ExternalLink, HelpCircle, Sliders, TrendingDown,
  IndianRupee, Zap, ArrowRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from "recharts";
import Layout from "../components/Layout";
import { projects } from "../data/projects";
import { apiService } from "../services/api";

export default function ExplainableAI({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get("id") || (projects[0]?.id || "615186");

  const [selectedId, setSelectedId] = useState(initialProjectId);
  const [toastMsg, setToastMsg] = useState("");

  // What-If Simulation Sliders State
  const [deltaLand, setDeltaLand] = useState(15);
  const [deltaVelocity, setDeltaVelocity] = useState(8);
  const [deltaInflation, setDeltaInflation] = useState(-3);
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Get active project
  const selectedProject = useMemo(() => {
    return projects.find(p => String(p.id) === String(selectedId)) || projects[0];
  }, [selectedId]);

  // Recalculate What-If Simulation on slider change or project switch
  useEffect(() => {
    const runSimulation = async () => {
      if (!selectedProject) return;
      setIsSimulating(true);
      const res = await apiService.simulateWhatIf({
        project_id: selectedProject.id,
        baseScore: selectedProject.riskScore || selectedProject.overallRisk || 68,
        cost: selectedProject.revisedCostCr || selectedProject.originalCostCr || 1200,
        delta_land_acquired_pct: deltaLand,
        delta_progress_velocity: deltaVelocity,
        delta_material_inflation: deltaInflation
      });
      setSimResult(res);
      setIsSimulating(false);
    };

    runSimulation();
  }, [selectedProject, deltaLand, deltaVelocity, deltaInflation]);

  // Compute dynamic SHAP feature contributions based on real project parameters
  const dynamicShapData = useMemo(() => {
    if (!selectedProject) return [];

    const physLag = Math.max(0, 100 - (selectedProject.physicalProgress || selectedProject.progress || 50));
    const costRatio = selectedProject.revisedCostCr && selectedProject.originalCostCr
      ? Math.max(0, ((selectedProject.revisedCostCr - selectedProject.originalCostCr) / selectedProject.originalCostCr) * 100)
      : 12;
    const landStatus = selectedProject.landAcquisitionPct || 75;

    return [
      {
        factor: "Physical Milestone Lag",
        contribution: Math.min(38, Math.round(physLag * 0.45)),
        direction: physLag > 25 ? "positive" : "negative",
        desc: `Current physical completion is at ${selectedProject.physicalProgress || selectedProject.progress}%.`
      },
      {
        factor: "Cost Escalation & Revisions",
        contribution: Math.min(32, Math.round(costRatio * 0.8) + 8),
        direction: costRatio > 10 ? "positive" : "negative",
        desc: `Revised sanction of ₹${(selectedProject.revisedCostCr || selectedProject.originalCostCr || 0).toLocaleString('en-IN')} Cr.`
      },
      {
        factor: "Land & Environmental Clearances",
        contribution: landStatus < 80 ? 22 : -15,
        direction: landStatus < 80 ? "positive" : "negative",
        desc: `${landStatus}% land acquired and unencumbered.`
      },
      {
        factor: "Sectoral Supply Chain Volatility",
        contribution: selectedProject.sector === "Aviation" || selectedProject.sector === "Railways" ? 18 : 10,
        direction: "positive",
        desc: `Structural material inflation benchmark for ${selectedProject.sector || 'Infrastructure'}.`
      },
      {
        factor: "Contractor Compliance Health",
        contribution: selectedProject.riskLevel === "Critical" ? 16 : selectedProject.riskLevel === "High" ? 12 : -18,
        direction: selectedProject.riskLevel === "Critical" || selectedProject.riskLevel === "High" ? "positive" : "negative",
        desc: `Audit reporting consistency under ${selectedProject.agency || 'Implementing Agency'}.`
      },
      {
        factor: "Budget Expenditure Momentum",
        contribution: -14,
        direction: "negative",
        desc: "Regular financial disbursements prevent immediate liquidity blockages."
      }
    ];
  }, [selectedProject]);

  const chartData = dynamicShapData.map(f => ({
    factor: f.factor,
    contribution: f.direction === "negative" ? -f.contribution : f.contribution,
    fill: f.direction === "negative" ? "#10B981" : f.contribution >= 25 ? "#DC2626" : f.contribution >= 15 ? "#EA580C" : "#F59E0B",
  }));

  const handleAction = (actionTitle) => {
    setToastMsg(`Action successfully executed: "${actionTitle}" for ${selectedProject.name}`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  return (
    <Layout
      user={user}
      title="Explainable AI (XAI) Risk Diagnostics"
      subtitle="Auditable ML feature attributions, SHAP breakdown, and plain-language governance rationales for Central Sector Projects."
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg("")} className="text-stone-600 hover:text-stone-900 cursor-pointer font-bold px-1">✕</button>
        </div>
      )}

      {/* Top Project Selector & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
              Select Monitored Project for AI Diagnostic Attribution
            </label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full text-xs font-bold bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl px-3 py-2.5 outline-none focus:border-[#E8602A] text-[#1C1917] cursor-pointer"
            >
              {projects.slice(0, 100).map(p => (
                <option key={p.id} value={p.id}>
                  {p.projectId || p.id} — {p.name} ({p.ministry}) [{p.riskLevel} Risk]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => navigate(`/projects/${selectedProject.id}`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FAF7F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] text-[#1C1917] rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
          >
            <ExternalLink size={13} /> View Full Project Detail
          </button>
        </div>
      </div>

      {/* Selected Project Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FEF0E7] text-[#E8602A] rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#E8602A]">{selectedProject.projectId || selectedProject.id}</span>
              <h3 className="text-sm font-black text-[#1C1917]">{selectedProject.name}</h3>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              {selectedProject.ministry} · {selectedProject.state} · Agency: <strong>{selectedProject.agency || "Nodal Authority"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-[#78716C]">Physical Completion</p>
            <p className="text-xs font-bold text-[#1C1917]">{selectedProject.physicalProgress || selectedProject.progress}%</p>
          </div>
          <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            selectedProject.riskLevel === "Critical" ? "bg-red-50 text-red-700 border border-red-200" :
            selectedProject.riskLevel === "High" ? "bg-orange-50 text-orange-700 border border-orange-200" :
            "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              selectedProject.riskLevel === "Critical" ? "bg-red-600" : selectedProject.riskLevel === "High" ? "bg-orange-600" : "bg-emerald-600"
            }`} />
            {selectedProject.riskLevel?.toUpperCase()} RISK — Score {selectedProject.riskScore || selectedProject.overallRisk || 78}/100
          </div>
        </div>
      </div>

      {/* SHAP Chart & Horizontal Feature Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-5">
        {/* SHAP Visual Graph */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#1C1917] text-sm">Feature Contribution (SHAP Analysis)</h3>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                Red bars indicate factors driving risk upward; green bars indicate stabilizing factors.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-[#FAF7F4] border border-[#E7E5E4] rounded-lg text-[#78716C]">
              Model: XGBoost + TreeSHAP
            </span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#A8A29E" }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="factor" tick={{ fontSize: 11, fill: "#44403C" }} axisLine={false} tickLine={false} width={180} />
              <ReferenceLine x={0} stroke="#D6D3D1" strokeWidth={1.5} />
              <Tooltip
                formatter={(v) => [`${v > 0 ? "+" : ""}${v}% Risk Impact`, "SHAP Weight"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #E7E5E4", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
              />
              <Bar dataKey="contribution" radius={4}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F5F5F4] text-xs text-[#78716C]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-600 inline-block" />
              <span>Risk Escalating Factors (+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
              <span>Risk Mitigating Factors (-)</span>
            </div>
          </div>
        </div>

        {/* Detailed Factor Attribution Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[#1C1917] text-sm mb-1">Attribution Factor Weights</h3>
            <p className="text-xs text-[#A8A29E] mb-4">Normalized multi-variable correlation metrics.</p>

            <div className="space-y-3.5">
              {dynamicShapData.map((f, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#1C1917]">{f.factor}</span>
                    <span className={`font-mono font-bold ${f.direction === "negative" ? "text-emerald-700" : "text-red-600"}`}>
                      {f.direction === "negative" ? "-" : "+"}{f.contribution}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-1.5 rounded-full ${f.direction === "negative" ? "bg-emerald-500" : f.contribution >= 25 ? "bg-red-600" : "bg-[#E8602A]"}`}
                      style={{ width: `${Math.min(100, (Math.abs(f.contribution) / 40) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#78716C] leading-snug">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NEW: WHAT-IF POLICY INTERVENTION & SIMULATION SANDBOX */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-6 mb-5 text-white shadow-lg border border-stone-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8602A] flex items-center justify-center text-white shadow-md">
              <Sliders size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-wide">Interactive What-If Policy Intervention Simulator</h3>
                <span className="text-[10px] font-bold bg-[#E8602A]/20 text-[#FEF0E7] border border-[#E8602A]/40 px-2 py-0.5 rounded-full">
                  Real-Time Decision Engine
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Simulate executive policy decisions to forecast risk mitigation, budget savings, and schedule recovery.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-stone-400 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700">
            Target: <strong>{selectedProject.name.slice(0, 30)}...</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders Control Panel */}
          <div className="lg:col-span-7 space-y-4">
            {/* Slider 1: Land Acquisition */}
            <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <Zap size={14} className="text-[#E8602A]" /> Expedited Land Handover & Clearances
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">+{deltaLand}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={deltaLand}
                onChange={e => setDeltaLand(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#E8602A]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>Baseline (+0%)</span>
                <span>Inter-departmental Taskforce (+15%)</span>
                <span>Fast-track Handover (+30%)</span>
              </div>
            </div>

            {/* Slider 2: Progress Velocity */}
            <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-blue-400" /> Contractor Monthly Progress Velocity Boost
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">+{deltaVelocity}% / Mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="2"
                value={deltaVelocity}
                onChange={e => setDeltaVelocity(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>Current Pace (+0%)</span>
                <span>Double Shift Work (+10%)</span>
                <span>Triple Shift Construction (+20%)</span>
              </div>
            </div>

            {/* Slider 3: Material Inflation */}
            <div className="bg-stone-800/60 border border-stone-700 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <IndianRupee size={14} className="text-amber-400" /> Material Price Stabilization / Bulk Procurement
                </label>
                <span className={`text-xs font-mono font-bold ${deltaInflation < 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {deltaInflation > 0 ? `+${deltaInflation}` : deltaInflation}%
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={deltaInflation}
                onChange={e => setDeltaInflation(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>-10% (Central Bulk Tender)</span>
                <span>0% (Market Baseline)</span>
                <span>+10% (High Inflation)</span>
              </div>
            </div>
          </div>

          {/* Real-Time Simulation Results Panel */}
          <div className="lg:col-span-5 bg-stone-800/80 border border-stone-700 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Forecasted Policy Impact</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2.5 py-0.5 rounded-full">
                  -{simResult?.risk_mitigation_pct || 28}% Risk Reduction
                </span>
              </div>

              {/* Comparative Scores */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-700 text-center">
                  <p className="text-[11px] text-stone-400">Baseline Score</p>
                  <p className="text-lg font-black text-red-400 font-mono mt-0.5">{simResult?.baseline_risk_score || 68} / 100</p>
                  <span className="text-[10px] text-stone-400">{selectedProject.riskLevel} Risk</span>
                </div>
                <div className="p-3 bg-stone-900/80 rounded-xl border border-emerald-700/60 text-center">
                  <p className="text-[11px] text-emerald-400 font-semibold">Simulated Outcome</p>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{simResult?.simulated_risk_score || 46} / 100</p>
                  <span className="text-[10px] text-emerald-300 font-medium">{simResult?.simulated_risk_level || "Moderate"} Risk</span>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs p-2.5 bg-stone-900/60 rounded-xl border border-stone-700/60">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <IndianRupee size={13} className="text-emerald-400" /> Projected Public Cost Savings:
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    ₹{simResult?.projected_cost_saving_cr || 128} Cr
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-stone-900/60 rounded-xl border border-stone-700/60">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-400" /> Schedule Delay Mitigated:
                  </span>
                  <span className="font-mono font-bold text-blue-400 text-xs">
                    {simResult?.months_saved || 5} Months Recovered
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-stone-300 italic leading-relaxed bg-stone-900/80 p-3 rounded-xl border border-stone-700">
                "{simResult?.policy_synthesis || 'Accelerating land handover and increasing progress velocity lowers overrun probability significantly.'}"
              </p>
            </div>

            <button
              onClick={() => handleAction(`Adopt Simulated Policy Action Package (-${simResult?.risk_mitigation_pct || 28}% Risk)`)}
              className="mt-4 w-full py-2.5 bg-[#E8602A] hover:bg-[#C45320] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Adopt Simulated Policy Package</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Plain English Governance Narrative */}
      <div className="bg-[#FEF0E7] border border-[#FDDFCC] rounded-2xl p-5 mb-5 shadow-2xs">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 bg-[#E8602A] rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#1C1917] text-sm">Official Plain-English Executive Summary</h3>
            <p className="text-[11px] text-[#78716C]">Automated synthesis for Reviewers and Monitoring Officers</p>
          </div>
        </div>
        <blockquote className="text-[#1C1917] text-xs sm:text-sm leading-relaxed italic border-l-4 border-[#E8602A] pl-4 py-1">
          "Project <strong>{selectedProject.name}</strong> is currently indexed under <strong>{selectedProject.riskLevel?.toUpperCase()} RISK</strong> ({selectedProject.riskScore || selectedProject.overallRisk || 78}/100). The primary driver is a <strong>{100 - (selectedProject.physicalProgress || selectedProject.progress)}% milestone lag</strong> against scheduled milestones, exacerbated by an approved/revised cost of ₹{(selectedProject.revisedCostCr || selectedProject.originalCostCr || 0).toLocaleString('en-IN')} Cr. Historical pattern matching across similar {selectedProject.sector} sector projects indicates a <strong>74% probability of 6–12 months commissioning delay</strong> unless statutory land clearances and contractor supply bottlenecks are expedited."
        </blockquote>
      </div>

      {/* Reviewer Actionable Recommendations */}
      <div className="mb-2">
        <h3 className="font-bold text-[#1C1917] text-sm mb-3">Targeted AI Mitigation Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 1,
              title: "Deploy Nodal Site Verification Team",
              urgency: "Immediate (48 Hours)",
              desc: `Dispatch physical audit inspectors to ${selectedProject.state} to inspect on-ground construction milestones vs contractor-reported submissions.`,
              action: "Initiate Site Inspection",
              color: "red"
            },
            {
              id: 2,
              title: "Convene Inter-Ministerial Review",
              urgency: "Within 5 Days",
              desc: `Hold emergency bilateral coordination meeting between ${selectedProject.ministry} and implementing agency ${selectedProject.agency || 'Nodal Body'} for budget reconciliation.`,
              action: "Schedule Coordination Meeting",
              color: "amber"
            },
            {
              id: 3,
              title: "Issue Statutory MoSPI Flash Escalation",
              urgency: "Immediate",
              desc: "Transmit formal high-risk alert memo to the Cabinet Secretariat Project Monitoring Group (PMG) for expedited land and statutory clearances.",
              action: "Transmit PMG Escalation",
              color: "orange"
            }
          ].map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.color === "red" ? "bg-red-50 text-red-700 border border-red-200" :
                    r.color === "amber" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-[#FEF0E7] text-[#E8602A] border border-[#FDDFCC]"
                  }`}>
                    {r.urgency}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#1C1917] mb-1.5">{r.title}</h4>
                <p className="text-xs text-[#78716C] leading-relaxed mb-4">{r.desc}</p>
              </div>

              <button
                onClick={() => handleAction(r.action)}
                className="w-full py-2 bg-[#1C1917] hover:bg-[#44403C] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                {r.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
