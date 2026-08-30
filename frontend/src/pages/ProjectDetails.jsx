import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Building2, IndianRupee,
  CheckCircle2, Clock, AlertTriangle, Circle, ExternalLink
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import { projects } from "../data/projects";

const TABS = ["Overview", "Financial Progress", "Physical Progress", "Timeline", "Milestones", "AI Analysis"];

const budgetData = [
  { label: "Land Acq.", budget: 420, actual: 485 },
  { label: "Civil Works", budget: 1800, actual: 1650 },
  { label: "Bridges", budget: 640, actual: 720 },
  { label: "Utilities", budget: 280, actual: 310 },
  { label: "Misc.", budget: 660, actual: 415 },
];

function MilestoneStatus({ status }) {
  if (status === "Completed") return <span className="flex items-center gap-1 text-xs text-green-700"><CheckCircle2 size={13} /> Completed</span>;
  if (status === "Delayed") return <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle size={13} /> Delayed</span>;
  return <span className="flex items-center gap-1 text-xs text-[#A8A29E]"><Circle size={13} /> Pending</span>;
}

function TimelineMilestone({ milestone, index }) {
  const isLeft = index % 2 === 0;
  const colors = {
    Completed: { bg: "bg-green-500", border: "border-green-200", text: "text-green-700" },
    Delayed: { bg: "bg-red-500", border: "border-red-200", text: "text-red-600" },
    Pending: { bg: "bg-[#D6D3D1]", border: "border-[#E7E5E4]", text: "text-[#A8A29E]" },
  };
  const c = colors[milestone.status];

  return (
    <div className={`flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
      <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
        <div className={`inline-block bg-white border ${c.border} rounded-xl p-3.5 shadow-sm max-w-xs`}>
          <p className="text-sm font-semibold text-[#1C1917]">{milestone.name}</p>
          <p className="text-xs text-[#78716C] mt-0.5">Planned: {milestone.planned}</p>
          {milestone.actual && <p className="text-xs text-[#78716C]">Actual: {milestone.actual}</p>}
          {milestone.delay && <p className={`text-xs font-medium mt-1 ${c.text}`}>+{milestone.delay} days</p>}
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full ${c.bg} ring-2 ring-white shadow`} />
      </div>
      <div className="flex-1" />
    </div>
  );
}

export default function ProjectDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const project = projects.find(p => p.id === parseInt(id)) || projects[0];

  return (
    <Layout user={user} title={project.name} subtitle={`${project.ministry} · ${project.sector} · ${project.state}`}>
      {/* Back */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-2 text-sm text-[#78716C] hover:text-[#1C1917] mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      {/* Project header */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-[#1C1917]">{project.name}</h2>
              <RiskBadge level={project.riskLevel} />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full
                ${project.status === "On Track" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-[#78716C] mt-1.5">{project.description}</p>
          </div>
          <button
            onClick={() => navigate("/ai-prediction")}
            className="flex items-center gap-2 text-sm font-medium text-white bg-[#E8602A] hover:bg-[#C45320] px-4 py-2.5 rounded-xl transition-colors"
          >
            View AI Prediction <ExternalLink size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F5F5F4]">
          {[
            { icon: IndianRupee, label: "Total Cost", value: project.cost },
            { icon: Calendar, label: "Start Date", value: new Date(project.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
            { icon: Clock, label: "Expected Completion", value: new Date(project.expectedCompletion).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
            { icon: Building2, label: "Contractor", value: project.contractor },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon size={13} className="text-[#78716C]" />
              </div>
              <div>
                <p className="text-xs text-[#A8A29E]">{item.label}</p>
                <p className="text-sm font-medium text-[#1C1917]">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {[
          { label: "Cost Risk", value: `${project.costRisk}%`, score: project.costRisk, color: "danger" },
          { label: "Time Risk", value: `${project.timeRisk}%`, score: project.timeRisk, color: "danger" },
          { label: "Overall Risk", value: `${project.overallRisk}/100`, score: project.overallRisk, color: "danger" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
            <p className="text-sm text-[#78716C] mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-red-600 mb-3">{card.value}</p>
            <ProgressBar value={card.score} color="danger" height="h-2" animate />
            <p className="text-xs text-[#A8A29E] mt-2">
              {card.score >= 80 ? "Critical level — immediate action required" : card.score >= 60 ? "High level — close monitoring needed" : "Moderate level"}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-[#F5F5F4] px-2">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                ${activeTab === tab
                  ? "text-[#E8602A] border-b-2 border-[#E8602A]"
                  : "text-[#78716C] hover:text-[#1C1917]"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "Overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#1C1917] text-sm">Project Information</h4>
                  {[
                    { label: "Ministry", value: project.ministry },
                    { label: "Sector", value: project.sector },
                    { label: "State", value: project.state },
                    { label: "Current Status", value: project.status },
                    { label: "Physical Completion", value: `${project.physicalProgress}%` },
                    { label: "Financial Utilization", value: `${project.financialProgress}%` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#F5F5F4]">
                      <span className="text-sm text-[#78716C]">{row.label}</span>
                      <span className="text-sm font-medium text-[#1C1917]">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold text-[#1C1917] text-sm mb-3">Progress Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
                        <span>Physical Progress</span>
                        <span className="font-medium text-[#1C1917]">{project.physicalProgress}%</span>
                      </div>
                      <ProgressBar value={project.physicalProgress} color={project.physicalProgress < 50 ? "danger" : "accent"} height="h-3" animate />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
                        <span>Financial Progress</span>
                        <span className="font-medium text-[#1C1917]">{project.financialProgress}%</span>
                      </div>
                      <ProgressBar value={project.financialProgress} color="blue" height="h-3" animate />
                    </div>
                    <div className="p-3.5 bg-[#FEF0E7] rounded-xl border border-[#FDDFCC] mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={13} className="text-[#E8602A]" />
                        <span className="text-xs font-medium text-[#E8602A]">Location</span>
                      </div>
                      <div className="w-full h-32 bg-[#FDDFCC] rounded-lg flex items-center justify-center">
                        <span className="text-xs text-[#E8602A] font-medium">{project.state} — Map View</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Financial Progress" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Total Budget", value: project.cost },
                  { label: "Expenditure", value: `₹${(project.costValue * project.financialProgress / 100).toFixed(0)} Cr` },
                  { label: "Remaining", value: `₹${(project.costValue * (100 - project.financialProgress) / 100).toFixed(0)} Cr` },
                ].map(k => (
                  <div key={k.label} className="bg-[#F5F5F4] rounded-xl p-4">
                    <p className="text-xs text-[#78716C] mb-1">{k.label}</p>
                    <p className="text-xl font-bold text-[#1C1917]">{k.value}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">Budget vs Actual by Component</h4>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetData} margin={{ left: -20, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Bar dataKey="budget" name="Budgeted (₹Cr)" fill="#E8602A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (₹Cr)" fill="#FDDFCC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {project.costRevisions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-[#1C1917] text-sm mb-3">Cost Revision History</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#E7E5E4]">
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Date</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Original (₹Cr)</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2 pr-4">Revised (₹Cr)</th>
                          <th className="text-left text-xs font-medium text-[#78716C] py-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.costRevisions.map((r, i) => (
                          <tr key={i} className="border-b border-[#F5F5F4]">
                            <td className="py-2.5 pr-4 text-xs text-[#44403C]">{r.date}</td>
                            <td className="py-2.5 pr-4 text-xs text-[#44403C]">{r.original}</td>
                            <td className="py-2.5 pr-4 text-xs font-medium text-red-600">{r.revised}</td>
                            <td className="py-2.5 text-xs text-[#78716C]">{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "Physical Progress" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                {[
                  { label: "Current Completion", value: `${project.physicalProgress}%`, color: "text-red-600" },
                  { label: "Planned (Today)", value: `${Math.min(project.physicalProgress + 16, 100)}%`, color: "text-[#1C1917]" },
                  { label: "Progress Gap", value: `-16%`, color: "text-red-600" },
                ].map(k => (
                  <div key={k.label} className="bg-[#F5F5F4] rounded-xl p-4">
                    <p className="text-xs text-[#78716C] mb-1">{k.label}</p>
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">Planned vs Actual Progress</h4>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={project.physicalData.length > 0 ? project.physicalData : [
                    { month: "Jan", planned: 15, actual: 10 },
                    { month: "Feb", planned: 22, actual: 13 },
                    { month: "Mar", planned: 30, actual: 18 },
                    { month: "Apr", planned: 38, actual: 22 },
                    { month: "May", planned: 46, actual: 28 },
                    { month: "Jun", planned: 55, actual: 32 },
                  ]}
                  margin={{ left: -20, right: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#A8A29E" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                  <Line type="monotone" dataKey="planned" name="Planned %" stroke="#A8A29E" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="actual" name="Actual %" stroke="#E8602A" strokeWidth={2.5} dot={{ r: 3, fill: "#E8602A" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === "Timeline" && (
            <div>
              <h4 className="font-semibold text-[#1C1917] text-sm mb-5">Project Timeline</h4>
              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#E7E5E4] -translate-x-1/2" />
                <div className="space-y-6">
                  {(project.milestones.length > 0 ? project.milestones : [
                    { name: "Project Initiation", planned: "2022-03-15", actual: "2022-03-15", status: "Completed", delay: 0 },
                    { name: "DPR Approval", planned: "2022-06-30", actual: "2022-07-15", status: "Completed", delay: 15 },
                    { name: "Land Acquisition", planned: "2022-12-31", actual: "2023-04-10", status: "Completed", delay: 100 },
                    { name: "Construction Start", planned: "2023-03-01", actual: "2023-06-15", status: "Completed", delay: 106 },
                    { name: "50% Completion", planned: "2023-12-31", actual: null, status: "Delayed", delay: 120 },
                    { name: "75% Completion", planned: "2024-06-30", actual: null, status: "Pending", delay: null },
                    { name: "Final Commissioning", planned: "2024-12-31", actual: null, status: "Pending", delay: null },
                  ]).map((m, i) => (
                    <TimelineMilestone key={i} milestone={m} index={i} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Milestones" && (
            <div>
              <h4 className="font-semibold text-[#1C1917] text-sm mb-4">Milestone Tracker</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E7E5E4]">
                      {["Milestone", "Planned Date", "Actual Date", "Status", "Delay"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#78716C] py-2.5 pr-4 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(project.milestones.length > 0 ? project.milestones : [
                      { name: "Project Initiation", planned: "2022-03-15", actual: "2022-03-15", status: "Completed", delay: 0 },
                      { name: "DPR Approval", planned: "2022-06-30", actual: "2022-07-15", status: "Completed", delay: 15 },
                      { name: "Land Acquisition", planned: "2022-12-31", actual: "2023-04-10", status: "Completed", delay: 100 },
                      { name: "Foundation Work", planned: "2023-06-30", actual: "2023-09-20", status: "Completed", delay: 82 },
                      { name: "Bridge Construction", planned: "2023-12-31", actual: null, status: "Delayed", delay: 120 },
                      { name: "Road Laying Ph1", planned: "2024-06-30", actual: null, status: "Pending", delay: null },
                      { name: "Final Commissioning", planned: "2024-12-31", actual: null, status: "Pending", delay: null },
                    ]).map((m, i) => (
                      <tr key={i} className="border-b border-[#F5F5F4] hover:bg-[#FAFAFA]">
                        <td className="py-3 pr-4 text-sm font-medium text-[#1C1917]">{m.name}</td>
                        <td className="py-3 pr-4 text-xs text-[#78716C]">{m.planned}</td>
                        <td className="py-3 pr-4 text-xs text-[#78716C]">{m.actual || "—"}</td>
                        <td className="py-3 pr-4"><MilestoneStatus status={m.status} /></td>
                        <td className="py-3 text-xs font-medium">
                          {m.delay ? <span className="text-red-600">+{m.delay} days</span> : m.delay === 0 ? <span className="text-green-600">On time</span> : <span className="text-[#A8A29E]">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "AI Analysis" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#1C1917] text-sm">AI Risk Summary</h4>
                <button
                  onClick={() => navigate("/explainable-ai")}
                  className="text-xs font-medium text-[#E8602A] bg-[#FEF0E7] hover:bg-[#FDDFCC] px-3 py-1.5 rounded-lg transition-colors"
                >
                  Full AI Explanation →
                </button>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm font-semibold text-red-700 mb-1">Overall Risk: HIGH (89/100)</p>
                <p className="text-sm text-red-600 leading-relaxed">
                  "This project is flagged HIGH RISK because physical work is 32% behind the planned schedule, combined with 3 missed milestones and 2 cost revisions totaling ₹240 Cr."
                </p>
              </div>
              <h4 className="font-semibold text-[#1C1917] text-sm">Key Contributing Factors</h4>
              {[
                { factor: "Physical Progress Gap", pct: 32 },
                { factor: "Milestone Delays", pct: 25 },
                { factor: "Cost Revision History", pct: 20 },
                { factor: "Historical Sector Risk", pct: 12 },
                { factor: "Weather / External", pct: 6 },
              ].map(f => (
                <div key={f.factor}>
                  <div className="flex justify-between text-xs text-[#78716C] mb-1">
                    <span>{f.factor}</span>
                    <span className="font-semibold text-red-600">+{f.pct}%</span>
                  </div>
                  <ProgressBar value={f.pct * 3} color="danger" height="h-1.5" animate />
                </div>
              ))}
              <h4 className="font-semibold text-[#1C1917] text-sm mt-2">AI Recommendations</h4>
              {[
                { title: "Immediate Site Inspection", desc: "Deploy field team for ground verification of construction status." },
                { title: "Budget Review", desc: "Conduct emergency budget review with contractor and ministry." },
                { title: "Ministry Escalation", desc: "Escalate project status to Ministry level for intervention." },
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
