import { useState } from "react";
import {
  CheckSquare, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  ShieldCheck, FileSpreadsheet, Eye, MessageSquare, Clock, Filter,
  FolderPlus, Building2, MapPin, FileCheck2, Send, HelpCircle
} from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";

const reviewerKpis = [
  {
    title: "Pending Registrations", value: "3", subtitle: "New project proposals",
    icon: FolderPlus, accentColor: "orange", change: "Requires review", changeType: "neutral"
  },
  {
    title: "Pending Monthly Updates", value: "6", subtitle: "CUF Submissions to verify",
    icon: Clock, accentColor: "orange", change: "April 2026 Cycle", changeType: "neutral"
  },
  {
    title: "Approved This Month", value: "34", subtitle: "Ingested into DRISHTI Data Lake",
    icon: CheckCircle2, accentColor: "green", change: "+16 this week", changeType: "up"
  },
  {
    title: "High Risk Escalations", value: "5", subtitle: "Escalated to MoSPI Authority",
    icon: AlertTriangle, accentColor: "red", change: "Critical notice issued", changeType: "up"
  },
];

const mockPendingRegistrations = [
  {
    id: "REG-2026-089",
    name: "Vadodara-Mumbai Expressway Phase 3 (South Corridor)",
    ministry: "Ministry of Road Transport & Highways",
    sector: "Transport & Logistics",
    agency: "National Highways Authority of India (NHAI)",
    state: "Gujarat / Maharashtra",
    approvedCost: 4850,
    startDate: "May 2026",
    targetCompletion: "Dec 2029",
    landAcquired: 64,
    submittedBy: "Dr. Rajesh Kumar (Project Officer)",
    submissionDate: "Today, 09:15 AM",
    dprDoc: "DPR-NHAI-VM3-Final.pdf",
    description: "Construction of 8-lane access-controlled greenfield expressway connecting South Gujarat to MMR border."
  },
  {
    id: "REG-2026-090",
    name: "Brahmaputra River Multi-Modal Logistics Hub",
    ministry: "Ministry of Ports, Shipping and Waterways",
    sector: "Waterways & Logistics",
    agency: "Inland Waterways Authority of India (IWAI)",
    state: "Assam",
    approvedCost: 1420,
    startDate: "June 2026",
    targetCompletion: "Nov 2028",
    landAcquired: 78,
    submittedBy: "Sanjay Barua (IWAI Lead)",
    submissionDate: "Yesterday, 03:40 PM",
    dprDoc: "IWAI-Brahmaputra-Hub-v2.pdf",
    description: "Integrated riverine terminal with rail and highway connectivity at Pandu port."
  },
  {
    id: "REG-2026-091",
    name: "AIIMS Sambalpur 750-Bed Super Specialty Hospital",
    ministry: "Ministry of Health and Family Welfare",
    sector: "Social Infrastructure",
    agency: "Central Public Works Department (CPWD)",
    state: "Odisha",
    approvedCost: 1180,
    startDate: "July 2026",
    targetCompletion: "March 2029",
    landAcquired: 92,
    submittedBy: "M. K. Tripathy (CPWD)",
    submissionDate: "2 days ago",
    dprDoc: "CPWD-AIIMS-SBL-DPR.pdf",
    description: "Tertiary healthcare and medical college infrastructure under PMSSY Phase VII."
  },
];

const mockPendingMonthlyUpdates = [
  {
    id: "SUB-101",
    projectName: "NH-48 Highway Expansion (Gujarat)",
    agency: "NHAI North Corridor",
    ministry: "Ministry of Road Transport",
    submissionDate: "Today, 10:30 AM",
    submittedBy: "Dr. Rajesh Kumar",
    prevSnapshot: { progress: 40, exp: 1420, revisedCost: 2400, land: 68 },
    currSubmission: { progress: 45, exp: 1650, revisedCost: 2640, land: 72 },
    delayReason: "Utility shifting delay in section 4 + cost revision due to steel price index.",
    discrepancyFlag: "Cost revised upwards (+₹240 Cr) · Land clearance hold noted."
  },
  {
    id: "SUB-102",
    projectName: "Eastern Dedicated Freight Corridor (Package 3)",
    agency: "Dedicated Freight Corridor Corp (DFCCIL)",
    ministry: "Ministry of Railways",
    submissionDate: "Yesterday, 04:15 PM",
    submittedBy: "Arun Verma",
    prevSnapshot: { progress: 58, exp: 3200, revisedCost: 4800, land: 88 },
    currSubmission: { progress: 62, exp: 3450, revisedCost: 4800, land: 91 },
    delayReason: "On track for revised milestone Q3.",
    discrepancyFlag: null
  },
  {
    id: "SUB-103",
    projectName: "Subansiri Lower Hydroelectric Project",
    agency: "NHPC Limited",
    ministry: "Ministry of Power",
    submissionDate: "2 days ago",
    submittedBy: "Sunita Rao",
    prevSnapshot: { progress: 51, exp: 4100, revisedCost: 6200, land: 82 },
    currSubmission: { progress: 53, exp: 4480, revisedCost: 6750, land: 84 },
    delayReason: "Monsoon landslide damage near powerhouse intake gallery.",
    discrepancyFlag: "Expenditure increased faster than physical milestone (+₹380 Cr vs +2% progress)."
  },
];

export default function ReviewerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("registrations"); // 'registrations' | 'monthly_updates'
  
  // Registration queue state
  const [regQueue, setRegQueue] = useState(mockPendingRegistrations);
  const [selectedReg, setSelectedReg] = useState(mockPendingRegistrations[0]);

  // Monthly updates queue state
  const [updateQueue, setUpdateQueue] = useState(mockPendingMonthlyUpdates);
  const [selectedUpdate, setSelectedUpdate] = useState(mockPendingMonthlyUpdates[0]);
  
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  // Registration Actions
  const handleApproveRegistration = (id) => {
    setRegQueue(prev => prev.filter(r => r.id !== id));
    setToastType("success");
    setToastMsg("Project Registration " + id + " Approved! Assigned DRISHTI Master ID PRJ-" + Math.floor(1000 + Math.random() * 9000));
    if (regQueue.length > 1) {
      setSelectedReg(regQueue.find(r => r.id !== id));
    } else {
      setSelectedReg(null);
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handleRejectRegistration = (id) => {
    if (!reviewRemarks) {
      alert("Please enter mandatory remarks explaining rejection or required document corrections.");
      return;
    }
    setRegQueue(prev => prev.filter(r => r.id !== id));
    setToastType("warning");
    setToastMsg("Project Registration " + id + " sent back to Agency for correction.");
    setReviewRemarks("");
    if (regQueue.length > 1) {
      setSelectedReg(regQueue.find(r => r.id !== id));
    } else {
      setSelectedReg(null);
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  // Monthly Updates Actions
  const handleApproveUpdate = (id) => {
    setUpdateQueue(prev => prev.filter(q => q.id !== id));
    setToastType("success");
    setToastMsg("CUF Monthly Submission " + id + " Approved! Snapshot ingested into AI Risk Model.");
    if (updateQueue.length > 1) {
      setSelectedUpdate(updateQueue.find(q => q.id !== id));
    } else {
      setSelectedUpdate(null);
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  const handleRejectUpdate = (id) => {
    if (!reviewRemarks) {
      alert("Please enter mandatory remarks explaining data discrepancies.");
      return;
    }
    setUpdateQueue(prev => prev.filter(q => q.id !== id));
    setToastType("warning");
    setToastMsg("Submission " + id + " returned to Agency Officer for correction.");
    setReviewRemarks("");
    if (updateQueue.length > 1) {
      setSelectedUpdate(updateQueue.find(q => q.id !== id));
    } else {
      setSelectedUpdate(null);
    }
    setTimeout(() => setToastMsg(""), 4500);
  };

  return (
    <Layout
      user={user}
      title="Reviewer & Monitoring Authority Centre"
      subtitle="Verify new project registrations, audit monthly CUF progress submissions, check discrepancy diffs, and approve snapshots into DRISHTI."
      showDateRange={false}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`mb-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs ${
          toastType === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-amber-50 border border-amber-200 text-amber-800"
        }`}>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className={toastType === "success" ? "text-emerald-600" : "text-amber-600"} />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg("")} className="text-stone-600 hover:text-stone-900">✕</button>
        </div>
      )}

      {/* Top Reviewer KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {reviewerKpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 40 : i === 1 ? 60 : i === 2 ? 85 : 25}
                color={i === 0 || i === 1 ? "warning" : i === 3 ? "danger" : "success"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "3 New proposals" : i === 1 ? "April 2026 Cycle" : i === 2 ? "Sync verified" : "Escalated to Central MoSPI"}
              </p>
            </div>
          </StatCard>
        ))}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-5 p-1.5 bg-[#F5F5F4] rounded-2xl w-fit border border-[#E7E5E4]">
        <button
          onClick={() => setActiveTab("registrations")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "registrations"
              ? "bg-white text-[#1C1917] shadow-xs"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <FolderPlus size={14} className={activeTab === "registrations" ? "text-[#E8602A]" : ""} />
          Pending Project-Registration Requests ({regQueue.length})
        </button>
        <button
          onClick={() => setActiveTab("monthly_updates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "monthly_updates"
              ? "bg-white text-[#1C1917] shadow-xs"
              : "text-[#78716C] hover:text-[#1C1917]"
          }`}
        >
          <FileSpreadsheet size={14} className={activeTab === "monthly_updates" ? "text-[#E8602A]" : ""} />
          Pending Monthly CUF Updates ({updateQueue.length})
        </button>
      </div>

      {activeTab === "registrations" ? (
        /* TAB 1: PENDING PROJECT-REGISTRATION REQUESTS */
        selectedReg ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Queue List */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#1C1917] text-sm">New Registration Requests</h3>
                  <p className="text-xs text-[#78716C] mt-0.5">{regQueue.length} Proposals waiting for master portfolio registration.</p>
                </div>
                <span className="text-xs bg-[#FEF0E7] text-[#E8602A] font-bold px-2.5 py-1 rounded-lg">
                  New Proposals
                </span>
              </div>

              <div className="space-y-3">
                {regQueue.map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedReg.id === reg.id
                        ? "bg-[#FEF0E7]/60 border-[#E8602A] shadow-xs"
                        : "bg-[#FAF7F4]/60 border-[#E7E5E4] hover:bg-[#FAF7F4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-[#E8602A]">{reg.id}</span>
                      <span className="text-[10px] text-[#A8A29E]">{reg.submissionDate}</span>
                    </div>
                    <p className="font-bold text-xs text-[#1C1917] line-clamp-1">{reg.name}</p>
                    <p className="text-[11px] text-[#78716C] mt-0.5">{reg.agency}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[#44403C]">
                      <span>Approved Cost: ₹{reg.approvedCost} Cr</span>
                      <span className="text-emerald-700 font-bold">{reg.landAcquired}% Land Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Detail View & Approval */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#F5F5F4]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#E8602A]">{selectedReg.id}</span>
                  <h3 className="font-black text-[#1C1917] text-base mt-0.5">{selectedReg.name}</h3>
                  <p className="text-xs text-[#78716C]">{selectedReg.ministry} · Submitted by: <strong>{selectedReg.submittedBy}</strong></p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  New Registration
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-xs">
                <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4]">
                  <p className="text-[#78716C]">Approved Cost</p>
                  <p className="text-base font-black text-[#1C1917] mt-0.5">₹{selectedReg.approvedCost} Cr</p>
                </div>
                <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4]">
                  <p className="text-[#78716C]">Target Timeline</p>
                  <p className="text-xs font-bold text-[#1C1917] mt-1">{selectedReg.targetCompletion}</p>
                </div>
                <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4]">
                  <p className="text-[#78716C]">Initial Land Handover</p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">{selectedReg.landAcquired}%</p>
                </div>
                <div className="p-3 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4]">
                  <p className="text-[#78716C]">State / Region</p>
                  <p className="text-xs font-bold text-[#1C1917] mt-1 truncate">{selectedReg.state}</p>
                </div>
              </div>

              <div className="mb-4 p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4] text-xs">
                <p className="font-bold text-[#1C1917] mb-1">Project Scope & DPR Summary:</p>
                <p className="text-[#44403C] leading-relaxed">{selectedReg.description}</p>
                <div className="mt-2 pt-2 border-t border-[#E7E5E4] flex items-center justify-between">
                  <span className="text-[11px] text-[#78716C]">Attached Feasibility Report: <strong>{selectedReg.dprDoc}</strong></span>
                  <span className="text-[11px] text-[#E8602A] font-semibold cursor-pointer hover:underline">Download DPR →</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#44403C]">
                  Reviewer Registration Remarks:
                </label>
                <textarea
                  rows={2}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  placeholder="Enter remarks for registration approval or required clarifications..."
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-xs text-[#1C1917] outline-none focus:border-[#E8602A] resize-none"
                />

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleRejectRegistration(selectedReg.id)}
                    className="flex-1 py-2.5 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={14} /> Send Back for Clarification
                  </button>
                  <button
                    onClick={() => handleApproveRegistration(selectedReg.id)}
                    className="flex-1 py-2.5 bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Approve Registration & Assign DRISHTI ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E5E4] shadow-sm flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-bold text-[#1C1917] text-base">All Project Registrations Verified!</h3>
            <p className="text-xs text-[#78716C] mt-1 max-w-sm">
              All submitted new project proposals have been processed and added to the Central DRISHTI master repository.
            </p>
          </div>
        )
      ) : (
        /* TAB 2: PENDING MONTHLY CUF UPDATES */
        selectedUpdate ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Queue List */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#1C1917] text-sm">Monthly Submissions Queue</h3>
                  <p className="text-xs text-[#78716C] mt-0.5">{updateQueue.length} CUF submissions awaiting audit.</p>
                </div>
                <span className="text-xs bg-[#FEF0E7] text-[#E8602A] font-bold px-2.5 py-1 rounded-lg">
                  Cycle: Apr 2026
                </span>
              </div>

              <div className="space-y-3">
                {updateQueue.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedUpdate(sub)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedUpdate.id === sub.id
                        ? "bg-[#FEF0E7]/60 border-[#E8602A] shadow-xs"
                        : "bg-[#FAF7F4]/60 border-[#E7E5E4] hover:bg-[#FAF7F4]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-[#E8602A]">{sub.id}</span>
                      <span className="text-[10px] text-[#A8A29E]">{sub.submissionDate}</span>
                    </div>
                    <p className="font-bold text-xs text-[#1C1917] line-clamp-1">{sub.projectName}</p>
                    <p className="text-[11px] text-[#78716C] mt-0.5">{sub.agency}</p>
                    {sub.discrepancyFlag && (
                      <div className="mt-2 text-[10px] bg-red-50 text-red-700 border border-red-100 p-1.5 rounded-lg flex items-center gap-1 font-semibold">
                        <AlertTriangle size={11} className="flex-shrink-0" />
                        <span className="truncate">{sub.discrepancyFlag}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Update Detail View & Side-by-side Diff */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E7E5E4] shadow-sm">
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#F5F5F4]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#E8602A]">{selectedUpdate.id}</span>
                  <h3 className="font-bold text-[#1C1917] text-base mt-0.5">{selectedUpdate.projectName}</h3>
                  <p className="text-xs text-[#78716C]">{selectedUpdate.ministry} · Officer: <strong>{selectedUpdate.submittedBy}</strong></p>
                </div>
              </div>

              {/* Discrepancy Callout */}
              {selectedUpdate.discrepancyFlag && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <p className="font-bold">Algorithmic Discrepancy Flag:</p>
                    <p className="text-[11px] mt-0.5">{selectedUpdate.discrepancyFlag}</p>
                  </div>
                </div>
              )}

              {/* Side-by-side Comparison Table */}
              <div className="mb-5 border border-[#E7E5E4] rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-[#FAF7F4] p-3 font-semibold text-[#78716C] border-b border-[#E7E5E4]">
                  <span>Parameter</span>
                  <span>Previous Snapshot (Mar 26)</span>
                  <span className="text-[#E8602A]">Current Submission (Apr 26)</span>
                </div>
                <div className="divide-y divide-[#F5F5F4] p-1">
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold text-[#44403C]">Physical Progress</span>
                    <span className="font-mono">{selectedUpdate.prevSnapshot.progress}%</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {selectedUpdate.currSubmission.progress}% (+{selectedUpdate.currSubmission.progress - selectedUpdate.prevSnapshot.progress}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold text-[#44403C]">Cumulative Expenditure</span>
                    <span className="font-mono">₹{selectedUpdate.prevSnapshot.exp} Cr</span>
                    <span className="font-mono font-bold text-amber-600">
                      ₹{selectedUpdate.currSubmission.exp} Cr (+₹{selectedUpdate.currSubmission.exp - selectedUpdate.prevSnapshot.exp} Cr)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold text-[#44403C]">Approved / Revised Cost</span>
                    <span className="font-mono">₹{selectedUpdate.prevSnapshot.revisedCost} Cr</span>
                    <span className={`font-mono font-bold ${selectedUpdate.currSubmission.revisedCost > selectedUpdate.prevSnapshot.revisedCost ? "text-red-600" : "text-[#1C1917]"}`}>
                      ₹{selectedUpdate.currSubmission.revisedCost} Cr
                    </span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 items-center">
                    <span className="font-semibold text-[#44403C]">Land Handover</span>
                    <span className="font-mono">{selectedUpdate.prevSnapshot.land}%</span>
                    <span className="font-mono font-bold text-[#1C1917]">{selectedUpdate.currSubmission.land}%</span>
                  </div>
                </div>
              </div>

              {/* Delay explanation */}
              <div className="mb-5 p-3.5 bg-[#FAF7F4] rounded-xl border border-[#E7E5E4] text-xs">
                <p className="font-bold text-[#1C1917] mb-1">Agency Delay Justification:</p>
                <p className="text-[#44403C] italic leading-relaxed">"{selectedUpdate.delayReason}"</p>
              </div>

              {/* Reviewer Action Area */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-[#44403C]">
                  Reviewer Verification Remarks / Correction Notes:
                </label>
                <textarea
                  rows={2}
                  value={reviewRemarks}
                  onChange={e => setReviewRemarks(e.target.value)}
                  placeholder="Enter remarks for approval or required remediation..."
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-xs text-[#1C1917] outline-none focus:border-[#E8602A] resize-none"
                />

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleRejectUpdate(selectedUpdate.id)}
                    className="flex-1 py-2.5 bg-white border border-red-300 hover:bg-red-50 text-red-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle size={14} /> Send Back for Correction
                  </button>
                  <button
                    onClick={() => handleApproveUpdate(selectedUpdate.id)}
                    className="flex-1 py-2.5 bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Approve & Ingest into AI Engine
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E5E4] shadow-sm flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="font-bold text-[#1C1917] text-base">All Monthly Submissions Audited!</h3>
            <p className="text-xs text-[#78716C] mt-1 max-w-sm">
              All monthly CUF data has been audited and ingested into the DRISHTI predictive AI pipeline.
            </p>
          </div>
        )
      )}
    </Layout>
  );
}
