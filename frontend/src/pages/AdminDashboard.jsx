import { useState } from "react";
import {
  Users, Server, ShieldCheck, UserCheck, Activity,
  Lock, RefreshCw, Plus, CheckCircle, AlertTriangle, Search, Filter, Settings,
  Database, FileSpreadsheet, Key, ArrowUpRight, CheckCircle2, Clock, Sparkles,
  Play, ShieldAlert, Cpu
} from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";

const initialKpis = [
  {
    title: "Registered Users", value: "1,428", subtitle: "Across 17 Ministries",
    icon: Users, accentColor: "orange", change: "+24 this week", changeType: "up"
  },
  {
    title: "System Services", value: "12 / 12", subtitle: "All clusters healthy",
    icon: Server, accentColor: "green", change: "99.98% Uptime", changeType: "up"
  },
  {
    title: "CUF Monthly Sync", value: "16 / 17", subtitle: "Ministries submitted",
    icon: Database, accentColor: "orange", change: "April 2026 Cycle", changeType: "neutral"
  },
  {
    title: "Security & Audits", value: "0", subtitle: "Active vulnerabilities",
    icon: ShieldCheck, accentColor: "green", change: "ISO 27001 Certified", changeType: "up"
  },
  {
    title: "Pipeline Latency", value: "42ms", subtitle: "Avg ML inference latency",
    icon: Activity, accentColor: "green", change: "-8ms optimized", changeType: "up"
  },
];

const initialUsersList = [
  { id: 1, name: "Dr. Rajesh Kumar (IAS)", email: "rajesh.kumar@mospi.gov.in", role: "Government Officer", department: "Ministry of Road Transport & Highways", status: "Active", lastActive: "Just now" },
  { id: 2, name: "Ananya Deshmukh", email: "ananya.reviewer@mospi.gov.in", role: "Reviewer / Monitoring Officer", department: "Central IPMD Audit Cell", status: "Active", lastActive: "4 mins ago" },
  { id: 3, name: "Amit Sharma", email: "admin.system@mospi.gov.in", role: "Project Administrator", department: "Infrastructure Project Monitoring Division (MoSPI)", status: "Active", lastActive: "10 mins ago" },
  { id: 4, name: "Vikram Malhotra", email: "vikram.m@nhai.gov.in", role: "Government Officer", department: "NHAI National Highway Operations", status: "Active", lastActive: "1 hour ago" },
  { id: 5, name: "Sanjay Barua", email: "sanjay.b@iwai.gov.in", role: "Government Officer", department: "Inland Waterways Authority of India (IWAI)", status: "Active", lastActive: "3 hours ago" },
  { id: 6, name: "M. K. Tripathy", email: "tripathy.mk@cpwd.gov.in", role: "Reviewer / Monitoring Officer", department: "CPWD Verification Directorate", status: "Active", lastActive: "Yesterday" },
];

const initialIngestionBatches = [
  { id: 1, ministry: "Ministry of Road Transport & Highways", projects: 312, records: 312, status: "Validated & Synced", date: "28 Apr 2026", latency: "1.2s", syncing: false },
  { id: 2, ministry: "Ministry of Railways", projects: 405, records: 405, status: "Validated & Synced", date: "29 Apr 2026", latency: "2.1s", syncing: false },
  { id: 3, ministry: "Ministry of Petroleum & Natural Gas", projects: 218, records: 218, status: "Validated & Synced", date: "30 Apr 2026", latency: "0.9s", syncing: false },
  { id: 4, ministry: "Ministry of Jal Shakti", projects: 280, records: 280, status: "Validated & Synced", date: "Today, 11:20 AM", latency: "1.8s", syncing: false },
  { id: 5, ministry: "Ministry of Power & Renewable Energy", projects: 366, records: 0, status: "Sync Pending", date: "Due in 2 days", latency: "--", syncing: false },
];

const initialSystemNodes = [
  { name: "DRISHTI ML Risk Ensemble (XGBoost + LSTM)", type: "Inference Cluster", status: "Healthy", load: "34%", memory: "18.4 GB / 32 GB", uptime: "99.98%" },
  { name: "Supabase PostgreSQL DRISHTI Data Lake", type: "Database Cluster", status: "Healthy", load: "48%", memory: "42.1 GB / 64 GB", uptime: "100%" },
  { name: "Realtime WebSocket Telemetry Broker", type: "Event Bus", status: "Healthy", load: "22%", memory: "8.2 GB / 16 GB", uptime: "99.95%" },
  { name: "GIS Geospatial Vector Map Engine", type: "Geospatial Tile Server", status: "Optimal", load: "39%", memory: "14.6 GB / 32 GB", uptime: "99.91%" },
];

const initialAuditLogs = [
  { id: "LOG-9823", action: "Reviewer Verification Completed", target: "Vadodara-Mumbai Expwy", actor: "Ananya Deshmukh (Reviewer)", time: "Just now", status: "Success" },
  { id: "LOG-9822", action: "User Provisioned & RBAC Assigned", target: "Dr. Rajesh Kumar", actor: "Amit Sharma (Admin)", time: "10:14 AM", status: "Success" },
  { id: "LOG-9821", action: "ML Ensemble Retrained (v3.2)", target: "DRISHTI-ML-Engine", actor: "System Scheduled Cron", time: "09:30 AM", status: "Success" },
  { id: "LOG-9820", action: "API Gateway Token Issued", target: "NHAI Project Connect", actor: "Amit Sharma (Admin)", time: "08:45 AM", status: "Success" },
  { id: "LOG-9819", action: "Failed Login Challenge Mitigated", target: "IP 192.168.1.44 (Blocked)", actor: "Security Firewall", time: "06:12 AM", status: "Warning" },
];

export default function AdminDashboard({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [usersList, setUsersList] = useState(initialUsersList);
  const [batches, setBatches] = useState(initialIngestionBatches);
  const [auditLogList, setAuditLogList] = useState(initialAuditLogs);
  const [isRetraining, setIsRetraining] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Government Officer");
  const [newDept, setNewDept] = useState("Ministry of Road Transport & Highways");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4500);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        showToast(`User account ${u.name} status updated to: ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    const newUser = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDept,
      status: "Active",
      lastActive: "Just now"
    };
    setUsersList(prev => [newUser, ...prev]);
    setAuditLogList(prev => [
      { id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`, action: `Provisioned New User (${newRole})`, target: newName, actor: "Amit Sharma (Admin)", time: "Just now", status: "Success" },
      ...prev
    ]);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    showToast(`New user ${newName} (${newRole}) successfully provisioned!`);
  };

  // Trigger Force Ingestion
  const handleForceSync = (batchId) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, syncing: true } : b));
    showToast(`Initiating multi-threaded CUF validation pipeline for Ministry...`);

    setTimeout(() => {
      setBatches(prev => prev.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            syncing: false,
            records: b.projects,
            status: "Validated & Synced",
            date: "Just now",
            latency: "1.1s"
          };
        }
        return b;
      }));
      setAuditLogList(prev => [
        { id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`, action: "Manual CUF Ingestion Synced", target: "Ministry of Power & Renewable Energy", actor: "Amit Sharma (Admin)", time: "Just now", status: "Success" },
        ...prev
      ]);
      showToast(`CUF Data Lake Ingestion Completed: 366 Projects validated & synced!`);
    }, 1800);
  };

  // Trigger ML Model Retrain
  const handleRetrainModels = () => {
    setIsRetraining(true);
    showToast("Triggering DRISHTI Multi-Target ML Retraining (XGBoost + LSTM Multi-Step)...");

    setTimeout(() => {
      setIsRetraining(false);
      setAuditLogList(prev => [
        { id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`, action: "ML Ensemble Retrained (v3.3)", target: "DRISHTI-ML-Engine", actor: "Amit Sharma (Admin)", time: "Just now", status: "Success" },
        ...prev
      ]);
      showToast("DRISHTI ML Model Ensemble successfully retrained (v3.3) with latest 2,098 project weights!");
    }, 2200);
  };

  return (
    <Layout
      user={user}
      title="DRISHTI Administrator Portal"
      subtitle="Administrative control center: Manage Ministry access, CUF monthly ingestion pipelines, system clusters, and audit security compliance."
      showDateRange={false}
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

      {/* Top Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {initialKpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 82 : i === 1 ? 100 : i === 2 ? 94 : i === 3 ? 100 : 92}
                color={i === 2 ? "accent" : i === 0 ? "accent" : "success"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "100% gov.in verified" : i === 1 ? "Zero downtime recorded" : i === 2 ? "94.1% cycle complete" : i === 3 ? "ISO 27001 compliant" : "Sub-50ms target met"}
              </p>
            </div>
          </StatCard>
        ))}
      </div>

      {/* CUF Monthly Batch Ingestion Monitor */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database size={17} className="text-[#E8602A]" />
              <h3 className="font-bold text-[#1C1917] text-base">Ministry CUF Monthly Data Ingestion Monitor</h3>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">Real-time status of monthly Common Upload Form (CUF) synchronization across 17 Central Ministries.</p>
          </div>
          <span className="text-xs bg-[#FEF0E7] text-[#E8602A] font-bold px-3 py-1 rounded-lg">
            Cycle: April 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F5F5F4] bg-[#FAF7F4] text-[#78716C] font-semibold">
                <th className="py-2.5 pl-3">Ministry / Implementing Body</th>
                <th className="py-2.5 px-3">Monitored Projects</th>
                <th className="py-2.5 px-3">Records Validated</th>
                <th className="py-2.5 px-3">Ingestion Status</th>
                <th className="py-2.5 px-3">Last Sync</th>
                <th className="py-2.5 pr-3 text-right">Action / Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-[#1C1917]">{b.ministry}</td>
                  <td className="py-3 px-3 text-[#44403C] font-medium">{b.projects} Projects</td>
                  <td className="py-3 px-3 font-mono">{b.records} / {b.projects}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status.includes("Validated")
                        ? "bg-emerald-100 text-emerald-800"
                        : b.status.includes("Warning")
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        b.status.includes("Validated") ? "bg-emerald-600" : b.status.includes("Warning") ? "bg-amber-600" : "bg-stone-400"
                      }`} />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#78716C]">{b.date}</td>
                  <td className="py-3 pr-3 text-right">
                    {b.status === "Sync Pending" ? (
                      <button
                        onClick={() => handleForceSync(b.id)}
                        disabled={b.syncing}
                        className="px-3 py-1 bg-[#E8602A] hover:bg-[#C45320] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                      >
                        {b.syncing ? "Syncing Data Lake..." : "Force Sync Now"}
                      </button>
                    ) : (
                      <span className="font-mono font-medium text-[#78716C]">{b.latency}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#1C1917] text-base">User & Role-Based Access Control (RBAC)</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FEF0E7] text-[#E8602A] text-xs font-bold">
                {usersList.length} Active Accounts
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">Control departmental access, security permissions, and assign 3-Tier System Privileges.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Search user or ministry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-[#E8602A]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs text-[#44403C] font-medium bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8602A] cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Government Officer">Government Officer</option>
              <option value="Reviewer / Monitoring Officer">Reviewer / Monitoring Officer</option>
              <option value="Project Administrator">Project Administrator</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] hover:bg-[#44403C] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={13} /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F5F5F4] text-[#78716C] font-semibold bg-[#FAF7F4]/50">
                <th className="py-2.5 pl-2">User Details</th>
                <th className="py-2.5">Department / Ministry</th>
                <th className="py-2.5">Assigned Role</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Last Active</th>
                <th className="py-2.5 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FEF0E7] text-[#E8602A] font-black flex items-center justify-center text-xs">
                        {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-[#1C1917]">{u.name}</p>
                        <p className="text-[#A8A29E] text-[11px] font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[#44403C] font-medium">{u.department}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      u.role === "Project Administrator"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : u.role === "Reviewer / Monitoring Officer"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "Active" ? "bg-emerald-600" : "bg-red-600"
                      }`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#78716C]">{u.lastActive}</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        u.status === "Active"
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {u.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Server Infrastructure & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Infrastructure Monitor */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#1C1917] text-base">Server & AI Cluster Health</h3>
                <p className="text-xs text-[#78716C] mt-0.5">Live telemetry of backend ML clusters and PostgreSQL data lake.</p>
              </div>
              <button
                onClick={handleRetrainModels}
                disabled={isRetraining}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] hover:bg-[#44403C] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Cpu size={13} className={isRetraining ? "animate-spin" : ""} />
                {isRetraining ? "Retraining Models..." : "Retrain AI Ensemble"}
              </button>
            </div>

            <div className="space-y-3">
              {initialSystemNodes.map((node, i) => (
                <div key={i} className="p-3 rounded-xl border border-[#F5F5F4] bg-[#FAF7F4]/50 hover:bg-[#FAF7F4] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-xs font-bold text-[#1C1917]">{node.name}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {node.status} ({node.uptime})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1 font-medium">
                    <span>Cluster: {node.type}</span>
                    <span>Memory: {node.memory}</span>
                  </div>
                  <ProgressBar
                    value={parseInt(node.load)}
                    color={parseInt(node.load) > 70 ? "danger" : parseInt(node.load) > 40 ? "warning" : "accent"}
                    height="h-1"
                    animate
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security & System Audit Logs */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1C1917] text-base">Security & Audit Trails (CERT-In)</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Immutable audit records for compliance, RBAC, and ML traceability.</p>
            </div>
            <span className="text-xs text-[#E8602A] font-bold">Live Stream</span>
          </div>

          <div className="space-y-2.5">
            {auditLogList.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#E8602A]">{log.id}</span>
                    <p className="text-xs font-bold text-[#1C1917]">{log.action}</p>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Target: <strong>{log.target}</strong> · Actor: {log.actor}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    log.status === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {log.status}
                  </span>
                  <p className="text-[10px] text-[#A8A29E] mt-1 flex items-center justify-end gap-1">
                    <Clock size={10} /> {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-[#E7E5E4] shadow-xl">
            <h3 className="font-bold text-[#1C1917] text-base mb-1">Provision Official User Account</h3>
            <p className="text-xs text-[#78716C] mb-4">Assign 3-Tier access privileges and administrative department.</p>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar (IAS)"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">Official Gov Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. officer.name@mospi.gov.in"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">Assigned 3-Tier Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#1C1917] cursor-pointer"
                >
                  <option value="Government Officer">Government Officer</option>
                  <option value="Reviewer / Monitoring Officer">Reviewer / Monitoring Officer</option>
                  <option value="Project Administrator">Project Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1">Administrative Ministry / Agency</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ministry of Road Transport & Highways"
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#1C1917]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F5F4] hover:bg-[#E7E5E4] text-[#78716C] font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
