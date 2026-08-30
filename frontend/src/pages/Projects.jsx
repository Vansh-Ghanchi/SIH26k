import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, MapPin, LayoutGrid, List } from "lucide-react";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import IndiaStateMap from "../components/IndiaStateMap";
import { projects } from "../data/projects";

const PAGE_SIZE = 8;

const ministries = ["All", ...new Set(projects.map(p => p.ministry))];
const sectors = ["All", ...new Set(projects.map(p => p.sector))];
const states = ["All", ...new Set(projects.map(p => p.state))];
const riskLevels = ["All", "Critical", "High", "Medium", "Low"];

const stateClusters = [
  { state: "Gujarat", projects: 4, highRisk: 2, totalValue: "₹48,200 Cr", status: "Critical Attention" },
  { state: "Maharashtra", projects: 5, highRisk: 3, totalValue: "₹62,400 Cr", status: "High Delay Lag" },
  { state: "Uttar Pradesh", projects: 4, highRisk: 1, totalValue: "₹34,100 Cr", status: "Moderate Risk" },
  { state: "Assam", projects: 2, highRisk: 1, totalValue: "₹18,500 Cr", status: "Environmental Hold" },
  { state: "Rajasthan", projects: 3, highRisk: 0, totalValue: "₹14,200 Cr", status: "On Track" },
];

export default function Projects({ user }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'state_hotspots'
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState("All");
  const [sector, setSector] = useState("All");
  const [state, setState] = useState("All");
  const [risk, setRisk] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (ministry !== "All" && p.ministry !== ministry) return false;
    if (sector !== "All" && p.sector !== sector) return false;
    if (state !== "All" && p.state !== state) return false;
    if (risk !== "All" && p.riskLevel !== risk) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <Layout
      user={user}
      title="Monitored Projects Repository"
      subtitle="Comprehensive PAIMANA portfolio tracking 1,981 central infrastructure projects across 22 sectors."
    >
      {/* View Switcher & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#1C1917] bg-white border border-[#E7E5E4] px-3 py-1.5 rounded-xl shadow-xs">
            {filtered.length} Projects Filtered
          </span>
          <span className="text-xs text-[#78716C]">Total Portfolio: 1,981 Projects (₹42.78L Cr)</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4]">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list" ? "bg-white text-[#1C1917] shadow-xs" : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <List size={13} /> Project Table
          </button>
          <button
            onClick={() => setViewMode("state_hotspots")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "state_hotspots" ? "bg-white text-[#1C1917] shadow-xs" : "text-[#78716C] hover:text-[#1C1917]"
            }`}
          >
            <MapPin size={13} /> Geographic Clusters
          </button>
        </div>
      </div>

      {viewMode === "state_hotspots" ? (
        /* Interactive State Geospatial Map */
        <div className="mb-6">
          <IndiaStateMap />
        </div>
      ) : (
        /* Standard Project Filter & Table */
        <>
          <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-44">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search project name..."
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl text-xs outline-none focus:border-[#E8602A] text-[#1C1917]"
                />
              </div>

              <select
                value={ministry}
                onChange={handleFilterChange(setMinistry)}
                className="text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#44403C]"
              >
                {ministries.map(m => (
                  <option key={m} value={m}>{m === "All" ? "All Ministries" : m}</option>
                ))}
              </select>

              <select
                value={sector}
                onChange={handleFilterChange(setSector)}
                className="text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#44403C]"
              >
                {sectors.map(s => (
                  <option key={s} value={s}>{s === "All" ? "All Sectors" : s}</option>
                ))}
              </select>

              <select
                value={risk}
                onChange={handleFilterChange(setRisk)}
                className="text-xs bg-[#FAF7F4] border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#44403C]"
              >
                {riskLevels.map(r => (
                  <option key={r} value={r}>{r === "All" ? "All Risk Levels" : `${r} Risk`}</option>
                ))}
              </select>

              {(search || ministry !== "All" || sector !== "All" || state !== "All" || risk !== "All") && (
                <button
                  onClick={() => { setSearch(""); setMinistry("All"); setSector("All"); setState("All"); setRisk("All"); setPage(1); }}
                  className="text-xs text-[#E8602A] hover:underline font-medium px-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F5F5F4] bg-[#FAF7F4] text-[#78716C] font-semibold">
                    <th className="py-3.5 pl-4">Project Details</th>
                    <th className="py-3.5 px-3">Ministry & Sector</th>
                    <th className="py-3.5 px-3">Approved / Revised Cost</th>
                    <th className="py-3.5 px-3">Physical Progress</th>
                    <th className="py-3.5 px-3">Risk Assessment</th>
                    <th className="py-3.5 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="hover:bg-[#FAF7F4]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 pl-4">
                        <p className="font-bold text-[#1C1917] hover:text-[#E8602A] transition-colors">{p.name}</p>
                        <p className="text-[11px] text-[#A8A29E] flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {p.state} · ID: PRJ-{p.id.toString().padStart(4, "0")}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-[#44403C]">{p.ministry}</p>
                        <p className="text-[11px] text-[#A8A29E]">{p.sector}</p>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-[#1C1917]">
                        <p>₹{p.approvedCost} Cr</p>
                        {p.revisedCost && p.revisedCost > p.approvedCost && (
                          <p className="text-[10px] text-red-600 font-bold">Rev: ₹{p.revisedCost} Cr</p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 min-w-32">
                        <div className="flex justify-between text-[11px] font-semibold text-[#1C1917] mb-1">
                          <span>Progress</span>
                          <span>{p.physicalProgress}%</span>
                        </div>
                        <ProgressBar
                          value={p.physicalProgress}
                          color={p.physicalProgress >= 70 ? "success" : p.physicalProgress >= 40 ? "warning" : "danger"}
                          height="h-1.5"
                          animate
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <RiskBadge level={p.riskLevel} score={p.overallRisk} />
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <span className="text-xs font-bold text-[#E8602A] hover:underline">
                          View Analysis →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#F5F5F4] text-xs">
                <span className="text-[#78716C]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-lg border border-[#E7E5E4] disabled:opacity-40 hover:bg-[#F5F5F4]"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-2 font-medium">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-lg border border-[#E7E5E4] disabled:opacity-40 hover:bg-[#F5F5F4]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
