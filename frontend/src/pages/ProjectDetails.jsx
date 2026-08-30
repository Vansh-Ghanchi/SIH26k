import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Building2, IndianRupee,
  CheckCircle2, Clock, AlertTriangle, Circle, ExternalLink,
  TrendingUp, ShieldAlert, Award, FileSpreadsheet, Target
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import ProjectLocationMap from "../components/ProjectLocationMap";
import { projects } from "../data/projects";

const TABS = ["Overview", "Financial Progress", "Physical Progress", "Timeline", "Milestones", "AI Analysis"];

function MilestoneStatus({ status }) {
  if (status === "Completed") return <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium"><CheckCircle2 size={13} /> Completed</span>;
  if (status === "Delayed") return <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle size={13} /> Delayed</span>;
  if (status === "On Track" || status === "In Progress") return <span className="flex items-center gap-1 text-xs text-blue-700 font-medium"><Clock size={13} /> In Progress</span>;
  return <span className="flex items-center gap-1 text-xs text-[#A8A29E] font-medium"><Circle size={13} /> Pending</span>;
}

function TimelineMilestone({ milestone, index }) {
  if (!milestone) return null;
  const isLeft = index % 2 === 0;
  const colors = {
    Completed: { bg: "bg-emerald-500", border: "border-emerald-200", text: "text-emerald-700" },
    "On Track": { bg: "bg-blue-500", border: "border-blue-200", text: "text-blue-700" },
    "In Progress": { bg: "bg-blue-500", border: "border-blue-200", text: "text-blue-700" },
    Delayed: { bg: "bg-red-500", border: "border-red-200", text: "text-red-600" },
    Pending: { bg: "bg-[#D6D3D1]", border: "border-[#E7E5E4]", text: "text-[#A8A29E]" },
  };
  const c = colors[milestone.status] || colors.Pending;
  const borderClass = c?.border || "border-[#E7E5E4]";
  const bgClass = c?.bg || "bg-[#D6D3D1]";
  const textClass = c?.text || "text-[#A8A29E]";

  return (
    <div className={`flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
        <div className={`inline-block bg-white border ${borderClass} rounded-xl p-3.5 shadow-sm max-w-sm`}>
          <p className="text-sm font-semibold text-[#1C1917]">{milestone.name || "Project Milestone"}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#78716C]">
            <span>Planned: <strong className="text-[#44403C]">{milestone.planned || "—"}</strong></span>
            {milestone.actual && <span>· Actual: <strong className="text-emerald-700">{milestone.actual}</strong></span>}
          </div>
          {milestone.delay ? <p className={`text-xs font-semibold mt-1.5 ${textClass}`}>+{milestone.delay} days variance</p> : null}
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full ${bgClass} ring-2 ring-white shadow`} />
      </div>
      <div className="flex-1" />
    </div>
  );
}

export default function ProjectDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  // Find project by id or projectId, fallback to first project safely
  const project = projects.find(p => String(p.id) === String(id) || String(p.projectId) === String(id)) || projects[0] || {};

  const costRiskVal = project.costRisk || (project.costRevisionPct ? Math.min(95, Math.round(project.costRevisionPct * 1.5 + 25)) : (project.riskLevel === 'Critical' ? 88 : project.riskLevel === 'High' ? 68 : 28));
  const timeRiskVal = project.timeRisk || (project.deadlineRevisionFlag ? 85 : (project.riskLevel === 'Critical' ? 92 : project.riskLevel === 'High' ? 74 : 32));
  const overallRiskVal = project.riskScore || project.overallRisk || (project.riskLevel === 'Critical' ? 89 : project.riskLevel === 'High' ? 65 : 25);

  const totalCostDisplay = project.cost || `₹${project.costValue || project.originalCostCr || 0} Cr`;
  const expenditureDisplay = `₹${project.expenditureCr || 0} Cr`;
  const remainingBudgetDisplay = `₹${Math.max(0, (project.revisedCostCr || project.costValue || 100) - (project.expenditureCr || 0)).toFixed(1)} Cr`;

  const budgetChartData = (project.budgetBreakdown && project.budgetBreakdown.length > 0) ? project.budgetBreakdown : [
    { label: "Civil Works", budget: Math.round((project.costValue || 100) * 0.45), actual: Math.round((project.costValue || 100) * 0.42) },
    { label: "Land Acq.", budget: Math.round((project.costValue || 100) * 0.20), actual: Math.round((project.costValue || 100) * 0.22) },
    { label: "Equipment", budget: Math.round((project.costValue || 100) * 0.18), actual: Math.round((project.costValue || 100) * 0.19) },
    { label: "Utilities", budget: Math.round((project.costValue || 100) * 0.10), actual: Math.round((project.costValue || 100) * 0.11) },
    { label: "PM & Misc", budget: Math.round((project.costValue || 100) * 0.07), actual: Math.round((project.costValue || 100) * 0.06) },
  ];

  const physicalChartData = (project.physicalData && project.physicalData.length > 0) ? project.physicalData : [
    { month: "Jul 2025", planned: 40, actual: Math.max(10, (project.physicalProgress || 50) - 30) },
    { month: "Sep 2025", planned: 55, actual: Math.max(25, (project.physicalProgress || 50) - 20) },
    { month: "Nov 2025", planned: 70, actual: Math.max(35, (project.physicalProgress || 50) - 10) },
    { month: "Jan 2026", planned: 85, actual: Math.max(45, (project.physicalProgress || 50) - 5) },
    { month: "Mar 2026", planned: 100, actual: project.physicalProgress || 50 },
  ];

  const milestonesData = (project.milestones && project.milestones.length > 0) ? project.milestones : [
    { name: "Project Inception & CCEA Sanction", planned: project.approvalDate || "2022-01", actual: project.approvalDate || "2022-01", status: "Completed", delay: 0 },
    { name: "Tendering & Award of Contract", planned: project.startDate || "2022-06", actual: project.startDate || "2022-06", status: "Completed", delay: 0 },
    { name: "Land Acquisition & Site Handover", planned: "2023-06", actual: "2023-09", status: "Completed", delay: 92 },
    { name: "Core Structural & Civil Works", planned: project.originalDOC || "2025-12", actual: (project.physicalProgress || 0) >= 70 ? project.originalDOC : null, status: (project.physicalProgress || 0) >= 70 ? "Completed" : project.deadlineRevisionFlag ? "Delayed" : "In Progress", delay: project.deadlineRevisionFlag ? 140 : 0 },
    { name: "Utility & Equipment Erection", planned: project.revisedDOC || "2026-06", actual: (project.physicalProgress || 0) >= 95 ? project.revisedDOC : null, status: (project.physicalProgress || 0) >= 95 ? "Completed" : "In Progress", delay: project.deadlineRevisionFlag ? 120 : 0 },
    { name: "Final Commissioning & Handover", planned: project.revisedDOC || "2026-06", actual: (project.physicalProgress || 0) === 100 ? project.revisedDOC : null, status: (project.physicalProgress || 0) === 100 ? "Completed" : "Pending", delay: null }
  ];

  return (
    <Layout user={user} title={project.name || "Infrastructure Project Details"} subtitle={`${project.ministry || "MoSPI"} · ${project.sector || "Infrastructure"} · ${project.state || "National"}`}>
      {/* Back button */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm text-[#78716C] hover:text-[#1C1917] mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      {/* Project Master Header */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-[#1C1917] leading-tight">{project.name || "Central Sector Infrastructure Project"}</h2>
              <RiskBadge level={project.riskLevel || "Moderate"} score={overallRiskVal} />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full
                ${project.status === "On Track" || project.status === "Ongoing" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {(project.status || "Ongoing").toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[#78716C] mt-1.5 leading-relaxed">
              {project.description || `Central Sector Infrastructure Project under ${project.ministry || "Ministry"} (${project.agency || "Central Implementing Agency"}). MoSPI Project ID: ${project.projectId}.`}
            </p>
          </div>
          <button
            onClick={() => navigate("/ai-prediction")}
            className="flex items-center gap-2 text-sm font-medium text-white bg-[#E8602A] hover:bg-[#C45320] px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs flex-shrink-0"
          >
            View AI Prediction <ExternalLink size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F5F5F4]">
          {[
            { icon: IndianRupee, label: "Total Approved Cost", value: totalCostDisplay },
            { icon: Calendar, label: "Sanctioned DOC / Revised DOC", value: `${project.originalDOC || "2025"} → ${project.revisedDOC || project.originalDOC || "2026"}` },
            { icon: Clock, label: "Cost Revision Status", value: (project.costRevisionPct && project.costRevisionPct > 0) ? `+${project.costRevisionPct}% Escalation` : "No Escalation" },
            { icon: Building2, label: "Implementing Body", value: project.agency || "Central Agency" },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={13} className="text-[#78716C]" />
              </div>
              <div>
                <p className="text-xs text-[#A8A29E]">{item.label}</p>
                <p className="text-sm font-medium text-[#1C1917] truncate max-w-44">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[
          { label: "Cost Risk Index", value: `${costRiskVal}%`, score: costRiskVal, color: costRiskVal >= 70 ? "danger" : costRiskVal >= 40 ? "warning" : "success" },
          { label: "Schedule Delay Probability", value: `${timeRiskVal}%`, score: timeRiskVal, color: timeRiskVal >= 70 ? "danger" : timeRiskVal >= 40 ? "warning" : "success" },
          { label: "Overall Risk Score", value: `${overallRiskVal}/100`, score: overallRiskVal, color: overallRiskVal >= 70 ? "danger" : overallRiskVal >= 40 ? "warning" : "success" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
            <p className="text-sm text-[#78716C] mb-2">{card.label}</p>
            <p className={`text-3xl font-bold mb-3 ${card.score >= 70 ? "text-red-600" : card.score >= 40 ? "text-amber-600" : "text-green-600"}`}>{card.value}</p>
            <ProgressBar value={card.score} color={card.color} height="h-2" animate />
            <p className="text-xs text-[#A8A29E] mt-2">
              {card.score >= 80 ? "Critical risk — immediate ministry intervention required" : card.score >= 60 ? "High risk — escalated monthly tracking" : "Operational variance within tolerance"}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#F5F5F4] px-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer
                ${activeTab === tab
                  ? "text-[#E8602A] border-b-2 border-[#E8602A] font-bold"
                  : "text-[#78716C] hover:text-[#1C1917]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#1C1917] text-sm">Authentic MoSPI Project Specifications</h4>
                  {[
                    { label: "MoSPI Project ID", value: project.projectId },
                    { label: "Administrative Ministry", value: project.ministry || "Central Ministry" },
                    { label: "Infrastructure Sector", value: project.sector || "Infrastructure" },
                    { label: "Geographical State / UT", value: project.state || "National" },
                    { label: "Implementing Agency", value: project.agency || "Central Implementing Agency" },
                    { label: "Sanction / Approval Date", value: project.approvalDate || "N/A" },
                    { label: "Original Commissioning Target", value: project.originalDOC || "N/A" },
                    { label: "Revised Commissioning Target", value: project.revisedDOC || project.originalDOC || "N/A" },
                    { label: "Current Operational Status", value: project.status || "Ongoing" },
                    { label: "Physical Progress Realized", value: `${project.physicalProgress || 0}%` },
                    { label: "Financial Utilization Ratio", value: `${project.financialProgress || 0}%` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#F5F5F4]">
                      <span className="text-sm text-[#78716C]">{row.label}</span>
                      <span className="text-sm font-medium text-[#1C1917]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-[#1C1917] text-sm mb-3">Ground Progress Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
                        <span>Physical Progress Completed</span>
                        <span className="font-medium text-[#1C1917]">{project.physicalProgress || 0}%</span>
                      </div>
                      <ProgressBar value={project.physicalProgress || 0} color={(project.physicalProgress || 0) < 50 ? "danger" : "accent"} height="h-3" animate />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
                        <span>Cumulative Financial Expenditure</span>
                        <span className="font-medium text-[#1C1917]">{project.financialProgress || 0}%</span>
                      </div>
                      <ProgressBar value={project.financialProgress || 0} color="blue" height="h-3" animate />
                    </div>
                    <div className="mt-4">
                      <ProjectLocationMap stateName={project.state} projectName={project.name} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL PROGRESS */}
          {activeTab === "Financial Progress" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Sanctioned Cost", value: `₹${project.originalCostCr || 0} Cr` },
                  { label: "Revised Cost", value: `₹${project.revisedCostCr || project.originalCostCr || 0} Cr` },
                  { label: "Cumulative Expenditure", value: expenditureDisplay },
                ].map(k => (
                  <div key={k.label} className="bg-[#F5F5F4] rounded-xl p-4">
                    <p className="text-xs text-[#78716C] mb-1">{k.label}</p>
                    <p className="text-xl font-bold text-[#1C1917]">{k.value}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">Component-wise Budget Allocation vs Expenditure (₹Cr)</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetChartData} margin={{ left: -20, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Bar dataKey="budget" name="Sanctioned Budget (₹Cr)" fill="#E8602A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Expenditure (₹Cr)" fill="#FDDFCC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {(project.costRevisions && project.costRevisions.length > 0) ? (
                <div>
                  <h4 className="font-semibold text-[#1C1917] text-sm mb-3">Authentic Cost Revision History</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E7E5E4]">
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Reporting Cycle</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Original Sanction</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Revised Sanction</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2">Escalation Rationale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.costRevisions.map((r, i) => (
                          <tr key={i} className="border-b border-[#F5F5F4]">
                            <td className="py-2.5 pr-4 text-xs text-[#44403C] font-semibold">{r.date}</td>
                            <td className="py-2.5 pr-4 text-xs text-[#44403C]">{r.original}</td>
                            <td className="py-2.5 pr-4 text-xs font-bold text-red-600">{r.revised}</td>
                            <td className="py-2.5 text-xs text-[#78716C]">{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4] text-xs text-[#78716C] flex items-center justify-between">
                  <span>Zero sanctioned cost revisions recorded. Project expenditure is within initial financial ceiling.</span>
                  <span className="font-bold text-emerald-700">Cost Escalation: 0%</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHYSICAL PROGRESS */}
          {activeTab === "Physical Progress" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Physical Completion Realized", value: `${project.physicalProgress || 0}%`, color: (project.physicalProgress || 0) < 50 ? "text-red-600" : "text-emerald-600" },
                  { label: "Target Planned Completion", value: `${Math.min((project.physicalProgress || 0) + 14, 100)}%`, color: "text-[#1C1917]" },
                  { label: "Execution Gap Variance", value: `${Math.min(0, (project.physicalProgress || 0) - Math.min((project.physicalProgress || 0) + 14, 100))}%`, color: "text-red-600" },
                ].map(k => (
                  <div key={k.label} className="bg-[#F5F5F4] rounded-xl p-4">
                    <p className="text-xs text-[#78716C] mb-1">{k.label}</p>
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">MoSPI 9-Month Physical S-Curve Trajectory (Jul 2025 – Mar 2026)</h4>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={physicalChartData} margin={{ left: -20, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Line type="monotone" dataKey="planned" name="Planned Milestone Target %" stroke="#A8A29E" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual Physical Progress %" stroke="#E8602A" strokeWidth={2.5} dot={{ r: 3, fill: "#E8602A" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TAB 4: TIMELINE */}
          {activeTab === "Timeline" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-[#1C1917] text-sm">Project Lifecycle Execution Timeline</h4>
                <span className="text-xs text-[#78716C] bg-[#F5F5F4] px-3 py-1 rounded-lg border border-[#E7E5E4]">
                  Sanctioned DOC: <strong>{project.originalDOC || "2025"}</strong> → Expected: <strong>{project.revisedDOC || "2026"}</strong>
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#E7E5E4] -translate-x-1/2" />
                <div className="space-y-6">
                  {milestonesData.map((m, i) => (
                    <TimelineMilestone key={i} milestone={m} index={i} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MILESTONES */}
          {activeTab === "Milestones" && (
            <div>
              <h4 className="font-semibold text-[#1C1917] text-sm mb-4">Milestone Tracker & Statutory Clearances</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E7E5E4]">
                      {["Milestone Stage", "Sanctioned Planned Date", "Ground Actual Date", "Status", "Variance Indicator"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#78716C] py-2.5 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {milestonesData.map((m, i) => (
                      <tr key={i} className="border-b border-[#F5F5F4] hover:bg-[#FAFAFA]">
                        <td className="py-3 pr-4 text-sm font-medium text-[#1C1917]">{m.name}</td>
                        <td className="py-3 pr-4 text-xs text-[#78716C]">{m.planned}</td>
                        <td className="py-3 pr-4 text-xs text-[#78716C] font-medium">{m.actual || "—"}</td>
                        <td className="py-3 pr-4"><MilestoneStatus status={m.status} /></td>
                        <td className="py-3 text-xs font-medium">
                          {m.delay ? <span className="text-red-600 font-bold">+{m.delay} days lag</span> : m.delay === 0 ? <span className="text-emerald-700 font-bold">On Schedule</span> : <span className="text-[#A8A29E]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: AI ANALYSIS */}
          {activeTab === "AI Analysis" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#1C1917] text-sm">ML Risk Diagnostics & SHAP Attribution</h4>
                <button
                  onClick={() => navigate("/ai-prediction")}
                  className="text-xs font-medium text-[#E8602A] bg-[#FEF0E7] hover:bg-[#FDDFCC] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Full AI Simulation Engine →
                </button>
              </div>
              <div className={`p-4 rounded-xl border ${overallRiskVal >= 70 ? "bg-red-50 border-red-100" : overallRiskVal >= 40 ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"}`}>
                <p className={`text-sm font-semibold mb-1 ${overallRiskVal >= 70 ? "text-red-700" : overallRiskVal >= 40 ? "text-amber-800" : "text-emerald-800"}`}>
                  Overall Risk Assessment: {(project.riskLevel || "Moderate").toUpperCase()} ({overallRiskVal}/100)
                </p>
                <p className={`text-sm leading-relaxed ${overallRiskVal >= 70 ? "text-red-600" : overallRiskVal >= 40 ? "text-amber-700" : "text-emerald-700"}`}>
                  {project.riskLevel === 'Critical'
                    ? `This project is categorized as CRITICAL RISK due to severe timeline revision flags, cost escalation (+${project.costRevisionPct || 0}%), and milestone variance (${project.physicalProgress}% physical progress).`
                    : project.riskLevel === 'High'
                    ? `This project is flagged as HIGH RISK with active schedule revision flags requiring inter-ministerial coordination to prevent further deadline slip.`
                    : `This project is performing within normal operational variance parameters with steady milestone fulfillment across reporting cycles.`}
                </p>
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">Key Contributing Factors (SHAP Risk Attribution)</h4>
              {[
                { factor: "Physical vs Planned Timeline Variance", pct: (project.physicalProgress || 0) < 50 ? 34 : 12 },
                { factor: "Milestone Clearance & Land Nodal Delays", pct: project.deadlineRevisionFlag ? 28 : 10 },
                { factor: "Cost Escalation & Revised Budget Sanction", pct: project.costRevisionPct ? Math.min(30, Math.round(project.costRevisionPct * 1.2)) : 8 },
                { factor: `${project.sector} Sectoral Supply Chain Benchmark`, pct: 14 },
                { factor: `${project.state} Regional Ground Execution Index`, pct: 8 },
              ].map(f => (
                <div key={f.factor}>
                  <div className="flex justify-between text-xs text-[#78716C] mb-1">
                    <span>{f.factor}</span>
                    <span className={`font-semibold ${f.pct > 20 ? "text-red-600" : "text-amber-600"}`}>+{f.pct}%</span>
                  </div>
                  <ProgressBar value={f.pct * 3} color={f.pct > 20 ? "danger" : "warning"} height="h-1.5" animate />
                </div>
              ))}
              <h4 className="font-semibold text-[#1C1917] text-sm mt-2">AI Policy Recommendations</h4>
              {[
                { title: "Quarterly Milestone Compliance Review", desc: `Deploy specialized engineering nodal team to ${project.state} for on-ground verification of ${project.sector} works.` },
                { title: "Financial Utilization Alignment", desc: `Align cumulative expenditure (₹${project.expenditureCr || 0} Cr) with certified milestone deliverables.` },
                { title: "Inter-Ministerial Nodal Sync", desc: `Escalate project clearance bottleneck to ${project.ministry} under MoSPI Central Infrastructure Division.` },
              ].map(r => (
                <div key={r.title} className="flex items-start gap-3 p-3.5 bg-[#FEF0E7] rounded-xl border border-[#FDDFCC]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E8602A] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917]">{r.title}</p>
                    <p className="text-xs text-[#78716C] mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
