import { useState } from "react";
import {
  Users, Server, ShieldCheck, UserCheck, Activity,
  Lock, RefreshCw, Plus, CheckCircle, AlertTriangle, Search, Filter, Settings,
  Database, FileSpreadsheet, Key, ArrowUpRight, CheckCircle2, Clock
} from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";

const adminKpis = [
  {
    title: "Registered Users", value: "1,428", subtitle: "Across 17 Ministries",
    icon: Users, accentColor: "orange", change: "+24 this week", changeType: "up"
  },
  {
    title: "System Services", value: "12 / 12", subtitle: "All clusters healthy",
    icon: Server, accentColor: "green", change: "99.98% Uptime", changeType: "up"
  },
  {
    title: "CUF Monthly Sync", value: "15 / 17", subtitle: "Ministries submitted",
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

const mockUsersList = [
  { id: 1, name: "Rajesh Kumar", email: "officer@infrawatch.gov.in", role: "Government Officer", department: "Ministry of Road Transport", status: "Active", lastActive: "Just now" },
  { id: 2, name: "Amit Sharma", email: "admin@infrawatch.gov.in", role: "Project Administrator", department: "Infrastructure Division (MoSPI)", status: "Active", lastActive: "5 mins ago" },
  { id: 3, name: "Priya Patel", email: "analyst@infrawatch.gov.in", role: "Analyst", department: "Risk & Analytics Cell", status: "Active", lastActive: "12 mins ago" },
  { id: 4, name: "Vikram Malhotra", email: "vikram.m@nhai.gov.in", role: "Government Officer", department: "NHAI North Zone", status: "Active", lastActive: "1 hour ago" },
  { id: 5, name: "Sunita Rao", email: "sunita.r@jalshakti.gov.in", role: "Analyst", department: "Jal Shakti Water Board", status: "Pending", lastActive: "Yesterday" },
  { id: 6, name: "Arun Verma", email: "arun.v@railways.gov.in", role: "Government Officer", department: "Ministry of Railways", status: "Active", lastActive: "2 days ago" },
];

const cufIngestionBatches = [
  { ministry: "Ministry of Road Transport & Highways", projects: 312, records: 312, status: "Validated & Synced", date: "28 Apr 2026", latency: "1.2s" },
  { ministry: "Ministry of Railways", projects: 405, records: 405, status: "Validated & Synced", date: "29 Apr 2026", latency: "2.1s" },
  { ministry: "Ministry of Petroleum & Natural Gas", projects: 218, records: 218, status: "Validated & Synced", date: "30 Apr 2026", latency: "0.9s" },
  { ministry: "Ministry of Jal Shakti", projects: 280, records: 268, status: "Validation Warning", date: "Today", latency: "1.8s" },
  { ministry: "Ministry of Power & Renewable Energy", projects: 366, records: 0, status: "Sync Pending", date: "Due in 2 days", latency: "--" },
];

const systemNodes = [
  { name: "ML Risk Scoring Pipeline", type: "Inference Cluster", status: "Healthy", load: "34%", memory: "18.4 GB / 32 GB", uptime: "99.98%" },
  { name: "PostgreSQL DRISHTI Data Lake", type: "Database Cluster", status: "Healthy", load: "48%", memory: "42.1 GB / 64 GB", uptime: "100%" },
  { name: "Realtime WebSocket Broker", type: "Event Bus", status: "Healthy", load: "22%", memory: "8.2 GB / 16 GB", uptime: "99.95%" },
  { name: "GIS Geospatial Map Server", type: "Geospatial Tile Engine", status: "Optimal", load: "39%", memory: "14.6 GB / 32 GB", uptime: "99.91%" },
];

const auditLogs = [
  { id: "LOG-9821", action: "User Role Elevated to Analyst", target: "Sunita Rao", actor: "Amit Sharma (Admin)", time: "10:14 AM", status: "Success" },
  { id: "LOG-9820", action: "ML Ensemble Retrained (v3.2)", target: "DRISHTI-ML-Engine", actor: "System Scheduled Cron", time: "09:30 AM", status: "Success" },
  { id: "LOG-9819", action: "API Gateway Token Issued", target: "NHAI Project Connect", actor: "Amit Sharma (Admin)", time: "08:45 AM", status: "Success" },
  { id: "LOG-9818", action: "Failed Login Challenge", target: "IP 192.168.1.44 (3 attempts)", actor: "Security Firewall", time: "06:12 AM", status: "Warning" },
];

export default function AdminDashboard({ user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [usersList, setUsersList] = useState(mockUsersList);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Government Officer");
  const [newDept, setNewDept] = useState("Ministry of Road Transport");

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (id) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));
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
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
  };

  return (
    <Layout
      user={user}
      title="DRISHTI Administrator Portal"
      subtitle="Administrative control center: Manage Ministry access, CUF monthly ingestion pipelines, system clusters, and audit security compliance."
      showDateRange={false}
    >
      {/* Top Admin KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {adminKpis.map((k, i) => (
          <StatCard key={i} {...k}>
            <div className="mt-3">
              <ProgressBar
                value={i === 0 ? 82 : i === 1 ? 100 : i === 2 ? 88 : i === 3 ? 100 : 92}
                color={i === 2 ? "accent" : i === 0 ? "accent" : "success"}
                height="h-1"
                animate
              />
              <p className="text-xs text-[#A8A29E] mt-1.5 font-medium">
                {i === 0 ? "88% gov.in verified" : i === 1 ? "Zero downtime recorded" : i === 2 ? "88.2% cycle complete" : i === 3 ? "ISO 27001 compliant" : "Sub-50ms target met"}
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
              <h3 className="font-semibold text-[#1C1917] text-base">Ministry CUF Monthly Data Ingestion Monitor</h3>
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
                <th className="py-2.5 pr-3 text-right">Pipeline Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {cufIngestionBatches.map((b, i) => (
                <tr key={i} className="hover:bg-[#FAF7F4]/60 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-[#1C1917]">{b.ministry}</td>
                  <td className="py-3 px-3 text-[#44403C] font-medium">{b.projects} Projects</td>
                  <td className="py-3 px-3 font-mono">{b.records} / {b.projects}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  <td className="py-3 pr-3 text-right font-mono font-medium text-[#78716C]">{b.latency}</td>
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
              <h3 className="font-semibold text-[#1C1917] text-base">User & Role Management</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF0E7] text-[#E8602A] text-xs font-semibold">
                {usersList.length} Active Accounts
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">Control departmental access, security permissions, and assign system privileges.</p>
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
              className="text-xs text-[#78716C] bg-[#F5F5F4] border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#E8602A]"
            >
              <option value="All">All Roles</option>
              <option value="Government Officer">Government Officer</option>
              <option value="Project Administrator">Project Administrator</option>
              <option value="Analyst">Analyst</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1917] hover:bg-[#44403C] text-white text-xs font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={13} /> Add User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F5F5F4] text-[#A8A29E] font-medium">
                <th className="pb-3 pl-2">User Details</th>
                <th className="pb-3">Department / Ministry</th>
                <th className="pb-3">Assigned Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Active</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF7F4]/60 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FEF0E7] text-[#E8602A] font-bold flex items-center justify-center text-xs">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1C1917]">{u.name}</p>
                        <p className="text-[#A8A29E] text-[11px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-[#44403C] font-medium">{u.department}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                      u.role === "Project Administrator"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : u.role === "Analyst"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : u.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        u.status === "Active" ? "bg-emerald-600" : u.status === "Pending" ? "bg-amber-600" : "bg-red-600"
                      }`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#78716C]">{u.lastActive}</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
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
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-base">Server & Service Health</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Live telemetry of backend ML clusters and databases.</p>
            </div>
            <button className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {systemNodes.map((node, i) => (
              <div key={i} className="p-3 rounded-xl border border-[#F5F5F4] bg-[#FAF7F4]/50 hover:bg-[#FAF7F4] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-[#1C1917]">{node.name}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {node.status} ({node.uptime})
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#78716C] mb-1">
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

        {/* Security & System Audit Logs */}
        <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1C1917] text-base">Security & Audit Trails</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Immutable audit records for compliance and tracing.</p>
            </div>
            <span className="text-xs text-[#E8602A] font-semibold cursor-pointer hover:underline">View All Logs</span>
          </div>

          <div className="divide-y divide-[#F5F5F4]">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${
                    log.status === "Warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {log.status === "Warning" ? <AlertTriangle size={13} /> : <CheckCircle size={13} />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1C1917]">{log.action}</p>
                    <p className="text-[11px] text-[#78716C]">Target: <span className="font-medium text-[#44403C]">{log.target}</span></p>
                    <p className="text-[10px] text-[#A8A29E]">By: {log.actor} · ID: {log.id}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#A8A29E] font-medium flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#E7E5E4]">
            <h3 className="text-base font-bold text-[#1C1917] mb-1">Provision New System Account</h3>
            <p className="text-xs text-[#78716C] mb-4">Assign role credentials and departmental scope.</p>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#44403C] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  required
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#44403C] mb-1">Official Government Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="ramesh.g@gov.in"
                  required
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#44403C] mb-1">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                >
                  <option value="Government Officer">Government Officer (Monitoring & Escalations)</option>
                  <option value="Analyst">Analyst (Statistical & ML Modeling)</option>
                  <option value="Project Administrator">Project Administrator (System & Ingestion)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#44403C] mb-1">Ministry / Division</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF7F4] text-[#1C1917] outline-none focus:border-[#E8602A]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#44403C] text-white font-semibold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
