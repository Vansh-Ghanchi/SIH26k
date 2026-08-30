import { useState } from "react";
import {
  FolderCheck, Clock, AlertTriangle, Send, CheckCircle2,
  FileSpreadsheet, ShieldAlert, ArrowUpRight, Plus, HelpCircle,
  Building, Calendar, Check, AlertCircle, FileText
} from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import RiskBadge from "../components/RiskBadge";

const agencyKpis = [
  {
    title: "Assigned Projects", value: "6", subtitle: "Under NHAI North Division",
    icon: Building, accentColor: "orange", change: "April 2026", changeType: "neutral"
  },
  {
    title: "Pending CUF Update", value: "2", subtitle: "Submission due in 3 days",
    icon: Clock, accentColor: "red", change: "Action required", changeType: "up"
  },
  {
    title: "Approved Updates", value: "4", subtitle: "Validated by Nodal Reviewer",
    icon: CheckCircle2, accentColor: "green", change: "This month", changeType: "up"
  },
  {
    title: "High Risk Flagged", value: "1", subtitle: "NH-48 Expressway Package",
    icon: AlertTriangle, accentColor: "red", change: "Reviewer comments added", changeType: "up"
  },
];

const assignedProjects = [
  { id: 1, name: "NH-48 Highway Expansion (Gujarat)", approvedCost: 2400, revisedCost: 2640, exp: 1650, progress: 45, status: "Update Due", risk: "Critical", riskScore: 89, lastUpdate: "31 Mar 2026" },
  { id: 2, name: "Delhi-Dehradun Expressway Package 2", approvedCost: 1850, revisedCost: 1850, exp: 1200, progress: 68, status: "Approved", risk: "Low", riskScore: 28, lastUpdate: "28 Apr 2026" },
  { id: 3, name: "Amritsar-Bhatinda Green Expressway", approvedCost: 3100, revisedCost: 3250, exp: 2100, progress: 54, status: "Approved", risk: "Medium", riskScore: 52, lastUpdate: "29 Apr 2026" },
  { id: 4, name: "Jaipur Ring Road Phase 3", approvedCost: 950, revisedCost: 950, exp: 420, progress: 38, status: "Update Due", risk: "High", riskScore: 68, lastUpdate: "31 Mar 2026" },
];

export default function AgencyDashboard({ user }) {
  const [selectedProject, setSelectedProject] = useState(assignedProjects[0]);
  const [physicalProgress, setPhysicalProgress] = useState(selectedProject.progress);
  const [expenditure, setExpenditure] = useState(selectedProject.exp);
  const [revisedCost, setRevisedCost] = useState(selectedProject.revisedCost);
  const [landAcquired, setLandAcquired] = useState(72);
  const [delayReason, setDelayReason] = useState("Slow utility shifting & forest clearance clearance lag in sector 4.");
  const [milestoneStatus, setMilestoneStatus] = useState("Milestone 4 - Bridge Foundation Laying");
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedToast, setSubmittedToast] = useState("");
  const [validationWarning, setValidationWarning] = useState("");

  const handleProjectSelect = (p) => {
    setSelectedProject(p);
    setPhysicalProgress(p.progress);
    setExpenditure(p.exp);
    setRevisedCost(p.revisedCost);
    setValidationWarning("");
  };

  const handleProgressChange = (val) => {
    setPhysicalProgress(val);
    if (val < selectedProject.progress) {
      setValidationWarning("Warning: Physical progress cannot be lower than previous snapshot (" + selectedProject.progress + "%).");
    } else {
      setValidationWarning("");
    }
  };

  const handleSubmitCUF = (e) => {
    e.preventDefault();
    if (!confirmationChecked) return;
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmittedToast("Monthly CUF Progress for " + selectedProject.name + " submitted to Reviewer successfully!");
      setTimeout(() => setSubmittedToast(""), 4500);
    }, 1000);
  };

  return (
    <Layout
      user={user}
      title="Implementing Agency Portal (NHAI)"
      subtitle="Field Execution & Common Upload Form (CUF) Monthly Progress Reporting Unit."
      showDateRange={false}
    >
      {/* Toast */}
      {submittedToast && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {submittedToast}
          </span>
          <button onClick={() => setSubmittedToast("")} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Top Agency KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {agencyKpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 100 : i === 1 ? 33 : i === 2 ? 66 : 16}
                color={i === 1 ? "warning" : i === 3 ? "danger" : "success"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "NHAI North Corridor" : i === 1 ? "April 2026 Cycle" : i === 2 ? "Sync verified" : "Requires site remediation"}
              </p>
            </div>
          </StatCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Assigned Projects List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#1C1917] text-sm">Assigned Projects (NHAI North)</h3>
                <p className="text-xs text-[#78716C] mt-0.5">Select a project to update monthly CUF data.</p>
              </div>
              <span className="text-xs bg-[#FEF0E7] text-[#E8602A] font-bold px-2.5 py-1 rounded-lg">
                4 Projects
              </span>
            </div>

            <div className="space-y-2.5">
              {assignedProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProjectSelect(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedProject.id === p.id
                      ? "bg-[#FEF0E7]/60 border-[#E8602A] shadow-xs"
                      : "bg-[#FAF7F4]/60 border-[#E7E5E4] hover:bg-[#FAF7F4]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-bold text-xs text-[#1C1917] leading-snug">{p.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      p.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#78716C] mb-2">
                    <span>Approved: ₹{p.approvedCost} Cr</span>
                    <span>Exp: ₹{p.exp} Cr</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                      <span>Physical Progress</span>
                      <span className="text-[#1C1917]">{p.progress}%</span>
                    </div>
                    <ProgressBar
                      value={p.progress}
                      color={p.progress > 60 ? "success" : p.progress > 40 ? "warning" : "danger"}
                      height="h-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs flex items-start gap-2">
            <HelpCircle size={15} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Nodal Policy:</strong> Monthly submissions must be completed before the 5th of each calendar month as mandated by MoSPI.
            </p>
          </div>
        </div>

        {/* Right: Monthly CUF Progress Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F5F5F4]">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={17} className="text-[#E8602A]" />
                <h3 className="font-bold text-[#1C1917] text-sm">Common Upload Form (CUF) — Monthly Update</h3>
              </div>
              <p className="text-xs text-[#78716C] mt-0.5">Editing: <span className="font-bold text-[#44403C]">{selectedProject.name}</span></p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#FAF7F4] border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
              Reporting: Apr 2026
            </span>
          </div>

          {validationWarning && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{validationWarning}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCUF} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#44403C] mb-1">
                  Physical Progress (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={physicalProgress}
                  onChange={e => handleProgressChange(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] font-semibold outline-none focus:border-[#E8602A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403C] mb-1">
                  Cumulative Expenditure (₹ Crores) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={expenditure}
                  onChange={e => setExpenditure(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] font-semibold outline-none focus:border-[#E8602A]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#44403C] mb-1">
                  Latest Revised Cost (₹ Crores)
                </label>
                <input
                  type="number"
                  min="0"
                  value={revisedCost}
                  onChange={e => setRevisedCost(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#44403C] mb-1">
                  Land Handover / Acquisition (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={landAcquired}
                  onChange={e => setLandAcquired(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#44403C] mb-1">
                Current Execution Milestone
              </label>
              <input
                type="text"
                value={milestoneStatus}
                onChange={e => setMilestoneStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#44403C] mb-1">
                Operational Bottlenecks & Remarks (If Delayed)
              </label>
              <textarea
                rows={3}
                value={delayReason}
                onChange={e => setDelayReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A] resize-none"
                placeholder="Explain causes for delay or expenditure deviations..."
              />
            </div>

            {/* Declaration Checkbox */}
            <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4] flex items-start gap-2.5">
              <input
                type="checkbox"
                id="decl"
                checked={confirmationChecked}
                onChange={e => setConfirmationChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#E8602A] cursor-pointer"
                required
              />
              <label htmlFor="decl" className="text-[11px] text-[#44403C] leading-snug cursor-pointer">
                I hereby declare that the physical milestone progress and cumulative expenditure reported above represent verified site data as of April 2026.
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !confirmationChecked}
              className="w-full py-3 bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Transmitting to Nodal Reviewer...
                </span>
              ) : (
                <>
                  <Send size={14} /> Submit CUF Progress to Reviewer
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
